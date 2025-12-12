import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/user/user.schema';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import type { UserType } from './types/user.type';
import { UserTokenType } from './types/userToken.type';

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

    generateToken(user: UserType): string {
        const payload: UserTokenType = {
            id: user._id.toString(),
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

    async getAllUsers(): Promise<UserType[]> {
        return this.userModel
            .find()
            .select('_id email username role')
            .lean()
            .exec();
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

    toUserType(user: UserDocument): UserType {
        return {
            _id: user._id,
            email: user.email,
            username: user.username,
            role: user.role,
        };
    }
}
