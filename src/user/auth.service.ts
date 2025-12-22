import { SharedUtilService } from './../shared/utils/shared-util.service';
import {
    BadRequestException,
    HttpException,
    HttpStatus,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from 'src/user/user.schema';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UpdateUserDTO } from './dtos/updateUser.dto';
import { GetUserQueryDto } from './dtos/userSearchQuery.dto';
import {
    GenericListResponseDTO,
    GenericMetaResponseDTO,
    UserRolesEnum,
} from '@crp-nest-app/shared';
import { CreateUserDTO } from './dtos/createUser.dto';
import { UserMapper } from './user.mapper';
import { ResponseUserDTO } from './dtos/responseUser.dto';

@Injectable()
export class AuthService {
    private static readonly RESPONSE_FIELDS = '_id email username role';
    private static readonly RESPONSE_FIELDS_WITH_PASS =
        '_id email username role password';
    private static readonly ALLOWED_SORT_FIELDS = ['username', 'createdAt'];
    private static readonly MAX_ENTITIES_PER_PAGE = 50;

    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        private jwtService: JwtService,
        private sharedUtilService: SharedUtilService,
    ) {}

    async register(
        username: string,
        email: string,
        password: string,
    ): Promise<ResponseUserDTO> {
        const existingUsername = await this.userModel.findOne({ username });
        const existingEmail = await this.userModel.findOne({ email });

        if (existingUsername || existingEmail) {
            throw new HttpException(
                'Username or email already taken!',
                HttpStatus.UNPROCESSABLE_ENTITY,
            );
        }

        const user = await this.userModel.create({
            username,
            email,
            password,
            role: 'USER',
        });

        return UserMapper.toResponse(user);
    }

    async login(email: string, password: string): Promise<ResponseUserDTO> {
        const userToLogin = await this.userModel
            .findOne({ email })
            .select(AuthService.RESPONSE_FIELDS_WITH_PASS)
            .lean()
            .exec();

        if (!userToLogin) {
            throw new NotFoundException('Email not found!');
        }

        const isPasswordCorrect = await this.comparePassword(
            password,
            userToLogin.password,
        );

        if (!isPasswordCorrect) {
            throw new HttpException(
                'Password is not valid!',
                HttpStatus.UNPROCESSABLE_ENTITY,
            );
        }

        return UserMapper.toResponse(userToLogin);
    }

    async getAllUsers(
        query?: GetUserQueryDto,
    ): Promise<GenericListResponseDTO<ResponseUserDTO>> {
        const { search, role, page = 1, pageSize = 20, sort } = query || {};

        const safeLimit = Math.min(pageSize, AuthService.MAX_ENTITIES_PER_PAGE);
        const skip = (page - 1) * safeLimit;

        const mongoQuery: any = {};
        if (search) {
            const regex = { $regex: search, $options: 'i' };
            mongoQuery.$or = [{ username: regex }, { email: regex }];
        }

        if (role) {
            mongoQuery.role = role;
        }

        let sortQuery;

        if (
            sort &&
            AuthService.ALLOWED_SORT_FIELDS.includes(sort.replace('-', ''))
        ) {
            sortQuery = sort.startsWith('-')
                ? { [sort.slice(1)]: -1 }
                : { [sort]: 1 };
        }

        const users = await this.userModel
            .find(mongoQuery)
            .sort(sortQuery)
            .skip(skip)
            .limit(safeLimit)
            .select(AuthService.RESPONSE_FIELDS)
            .lean()
            .exec();

        const recipesCount = await this.userModel.countDocuments(mongoQuery);

        const metaData = new GenericMetaResponseDTO(
            page,
            pageSize,
            recipesCount,
        );

        return UserMapper.toResponseList(users, metaData);
    }

    async getUserById(id: string): Promise<ResponseUserDTO> {
        if (id === null) {
            throw new HttpException(
                'User has no valid credentials',
                HttpStatus.UNAUTHORIZED,
            );
        }

        if (!Types.ObjectId.isValid(id)) {
            // throw new BadRequestException('Invalid user id');
        }

        const user = await this.userModel
            .findById(id)
            .select(AuthService.RESPONSE_FIELDS)
            .lean()
            .exec();

        if (!user) {
            throw new NotFoundException('User not found!');
        }
        return UserMapper.toResponse(user);
    }

    async getOwnAccount(email: string): Promise<ResponseUserDTO> {
        const ownAccount = await this.userModel
            .findOne({ email })
            .select(AuthService.RESPONSE_FIELDS)
            .lean()
            .exec();

        if (!ownAccount) {
            throw new NotFoundException('User not found!');
        }

        return UserMapper.toResponse(ownAccount);
    }

    async createUser(
        createDto: CreateUserDTO,
        currUser: ResponseUserDTO,
    ): Promise<ResponseUserDTO> {
        this.sharedUtilService.checkIfUserIsAuthorised(
            UserRolesEnum.ADMIN,
            currUser,
        );

        const { username, email, role, password } = createDto;

        const existingUsername = await this.userModel.findOne({ username });
        const existingEmail = await this.userModel.findOne({ email });
        if (existingUsername || existingEmail) {
            throw new HttpException(
                'Username or email already taken!',
                HttpStatus.UNPROCESSABLE_ENTITY,
            );
        }
        const user = await this.userModel.create({
            username,
            email,
            password,
            role,
        });

        if (!user) {
            throw new NotFoundException('User could not be created');
        }

        return UserMapper.toResponse(user.toObject());
    }

    async updateUser(
        id: string,
        updateDto: UpdateUserDTO,
        currUser?: ResponseUserDTO,
    ): Promise<ResponseUserDTO | null> {
        if (currUser) {
            this.sharedUtilService.checkIfUserIsAuthorised(
                UserRolesEnum.ADMIN,
                currUser,
            );
        }

        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid user id');
        }

        const userToUpdate = await this.userModel
            .findByIdAndUpdate(id, updateDto, { new: true })
            .lean()
            .exec();

        if (!userToUpdate) {
            throw new NotFoundException('User could not be updated');
        }

        return UserMapper.toResponse(userToUpdate);
    }

    async deleteUser(id: string, currUser: ResponseUserDTO): Promise<null> {
        this.sharedUtilService.checkIfUserIsAuthorised(
            UserRolesEnum.ADMIN,
            currUser,
        );

        const userToDelete = await this.userModel.findByIdAndDelete(id);

        if (!userToDelete) {
            throw new NotFoundException('User could not be deleted');
        }

        return null;
    }

    generateToken(user: any): string {
        const payload = {
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role,
        };

        return this.jwtService.sign(payload, {
            expiresIn: '2h',
            secret: process.env.JWT_SECRET,
        });
    }

    private comparePassword(password: string, hashedPassword: string) {
        return bcrypt.compare(password, hashedPassword);
    }
}
