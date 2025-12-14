import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/user/user.schema';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import type { UserType } from './types/user.type';
import { UpdateUserDTO } from './dtos/updateUser.dto';
import { GetUserQueryDto } from './dtos/userSearchQuery.dto';
import { UserRolesEnum } from '@crp-nest-app/shared';
import { CreateUserDTO } from './dtos/createUser.dto';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        private jwtService: JwtService,
    ) {}

    async register(
        username: string,
        email: string,
        password: string,
    ): Promise<UserDocument | null> {
        const existingUsername = await this.userModel.findOne({ username });
        const existingEmail = await this.userModel.findOne({ email });
        if (existingUsername || existingEmail) {
            throw new HttpException(
                'Username or email already taken!',
                HttpStatus.UNPROCESSABLE_ENTITY,
            );
        }

        return await this.userModel.create({
            username,
            email,
            password,
            role: 'USER',
        });
    }

    async login(email: string, password: string): Promise<UserDocument | null> {
        const userToLogin = await this.userModel
            .findOne({ email })
            .select('_id email username role password');

        if (!userToLogin) {
            throw new HttpException(
                'Email is not valid!',
                HttpStatus.NOT_FOUND,
            );
        }

        const isPasswordCorrect = await this.comparePassword(
            password,
            userToLogin.password,
        );

        if (!isPasswordCorrect) {
            throw new HttpException(
                'Password is not valid!',
                HttpStatus.CONFLICT,
            );
        }
        return userToLogin;
    }

    async createUser(
        createDto: CreateUserDTO,
        currUser: UserType,
    ): Promise<UserType | null> {
        this.checkIfUserIsAuthorised(UserRolesEnum.ADMIN, currUser);

        const { username, email, role, password } = createDto;
        const existingUsername = await this.userModel.findOne({ username });
        const existingEmail = await this.userModel.findOne({ email });
        if (existingUsername || existingEmail) {
            throw new HttpException(
                'Username or email already taken!',
                HttpStatus.UNPROCESSABLE_ENTITY,
            );
        }
        return await this.userModel.create({
            username,
            email,
            password,
            role,
        });
    }

    async updateUser(
        id: string,
        updateDto: UpdateUserDTO,
        currUser: UserType,
    ): Promise<UserType | null> {
        this.checkIfUserIsAuthorised(UserRolesEnum.ADMIN, currUser);

        const userToUpdate = await this.userModel.findByIdAndUpdate(
            id,
            updateDto,
        );
        if (!userToUpdate) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }
        return userToUpdate;
    }

    async deleteUser(id: string, currUser: UserType): Promise<null> {
        this.checkIfUserIsAuthorised(UserRolesEnum.ADMIN, currUser);
        const userToDelete = await this.userModel.findByIdAndDelete(id);
        if (!userToDelete) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }
        return null;
    }

    generateToken(user: UserType): string {
        const payload = {
            _id: user._id,
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

    verifyToken(token: string) {
        return this.jwtService.verify(token);
    }

    async getAllUsers(query?: GetUserQueryDto): Promise<UserType[]> {
        const {
            search,
            role,
            page = 1,
            entitiesPerPage = 20,
            sort,
        } = query || {};
        const mongoQuery: any = {};
        if (search) {
            const regex = { $regex: search, $options: 'i' };
            mongoQuery.$or = [{ username: regex }, { email: regex }];
        }

        if (role) {
            console.log({ role });

            mongoQuery.role = role;
        }

        let queryBase = this.userModel.find(mongoQuery);

        if (sort) {
            queryBase = queryBase.sort(sort);
        }
        const skip = (page - 1) * entitiesPerPage;
        const limit = entitiesPerPage;

        queryBase.skip(skip).limit(limit);

        return queryBase.select('_id email username role').lean().exec();
    }

    async getUserById(id: string): Promise<UserType | null> {
        const user = await this.userModel
            .findById(id)
            .select('_id email username role')
            .lean()
            .exec();
        if (!user) {
            throw new Error('This user was not found!');
        }
        return user;
    }

    async getOwnAccount(email: string): Promise<UserType | null> {
        const ownAccount = await this.userModel
            .findOne({ email })
            .select('_id email username role')
            .lean()
            .exec();

        if (!ownAccount) {
            throw new Error('No such registered user!');
        }

        return ownAccount;
    }

    private checkIfUserIsAuthorised(
        requiredRole: UserRolesEnum,
        currUser: UserType,
    ): void {
        if (currUser.role !== requiredRole) {
            throw new HttpException(
                'User is not authorised to modify this entity!',
                HttpStatus.UNAUTHORIZED,
            );
        }
    }
}
