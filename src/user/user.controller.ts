import { AUTH_COOKIE_NAME } from '@crp-nest-app/shared';
import { AuthService } from './auth.service';
import { Body, Controller, Get, Param, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import type { LoginUserDTO } from './dtos/loginUser.dto';
import type { UserType } from './types/user.type';
import type { CreateUserDTO } from './dtos/createUser.dto';
import type { UserResponceType } from './types/userResponse.type';
import { User } from './decorators/user.decorator';

@Controller('api/users')
export class UserController {
    constructor(private readonly authService: AuthService) {}

    @Post('register')
    async register(
        @Body() cerateUserDto: CreateUserDTO,
        @Res({ passthrough: true }) res: Response,
    ): Promise<UserResponceType | null> {
        const { username, email, password } = cerateUserDto;
        const user = await this.authService.register(username, email, password);

        if (!user) return null;

        const token = this.authService.generateToken(user);
        this.addTokenToCookie(token, res);
        return user;
    }

    @Post('login')
    async login(
        @Body() LoginUserDto: LoginUserDTO,
        @Res({ passthrough: true }) res: Response,
    ): Promise<UserResponceType | null> {
        const { email, password } = LoginUserDto;

        const user = await this.authService.login(email, password);

        if (!user) return null;

        const token = this.authService.generateToken(user);
        this.addTokenToCookie(token, res);
        return user as UserResponceType;
    }

    @Get('logout')
    logout(@Res() res: Response): Response {
        this.clearAuthCookie(res);
        return res.send({ message: 'User was loggedout successfully!' });
    }

    @Get()
    async getAll(): Promise<UserType[]> {
        return await this.authService.getAllUsers();
    }

    @Get('ownAccount')
    async getOwnAccont(@User('email') email: any): Promise<UserType | null> {
        return await this.authService.getOwnAccount(email);
    }

    @Get(':id')
    async getById(@Param('id') id: string): Promise<UserType | null> {
        return await this.authService.getUserById(id);
    }

    private addTokenToCookie(token: string, res: Response) {
        res.cookie(AUTH_COOKIE_NAME, token, {
            httpOnly: true,
            sameSite: 'lax', // should not be null
            secure: process.env.NODE_ENV === 'production',
        });
    }

    private clearAuthCookie(res: Response) {
        res.clearCookie(AUTH_COOKIE_NAME, {
            httpOnly: true,
            sameSite: 'lax', // should not be null
            secure: process.env.NODE_ENV === 'production',
            path: '/',
        });
    }
}
