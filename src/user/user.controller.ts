import { AUTH_COOKIE_NAME } from '@crp-nest-app/shared';
import { AuthService } from './auth.service';
import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    Query,
    Res,
    UseGuards,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
import type { Response } from 'express';
import type { LoginUserDTO } from './dtos/loginUser.dto';
import type { CreateUserDTO } from './dtos/createUser.dto';
import { User } from './decorators/user.decorator';
import { AuthGuard } from './guards/user.guard';
import { UpdateUserDTO } from './dtos/updateUser.dto';
import { GetUserQueryDto } from './dtos/userSearchQuery.dto';
import { ResponseUserDTO } from './dtos/responseUser.dto';

@Controller('api/users')
export class UserController {
    constructor(private readonly authService: AuthService) {}

    @Post('register')
    async register(
        @Body() cerateUserDto: CreateUserDTO,
        @Res({ passthrough: true }) res: Response,
    ): Promise<ResponseUserDTO | null> {
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
    ): Promise<ResponseUserDTO | null> {
        const { email, password } = LoginUserDto;

        const user = await this.authService.login(email, password);

        if (!user) return null;

        console.log({ user });

        const token = this.authService.generateToken(user);
        this.addTokenToCookie(token, res);
        return user;
    }

    @Get('logout')
    logout(@Res() res: Response): Response {
        this.clearAuthCookie(res);
        return res.send({ message: 'User was loggedout successfully!' });
    }

    @Get('accounts')
    @UseGuards(AuthGuard)
    async getAll(@Query() query: GetUserQueryDto): Promise<ResponseUserDTO[]> {
        return await this.authService.getAllUsers(query);
    }

    @Post('accounts')
    @UseGuards(AuthGuard)
    @UsePipes(new ValidationPipe())
    async createUser(
        @Body() createDto: CreateUserDTO,
        @User() currUser: ResponseUserDTO,
    ): Promise<ResponseUserDTO | null> {
        return await this.authService.createUser(createDto, currUser);
    }

    @Put('accounts/:id')
    @UseGuards(AuthGuard)
    @UsePipes(new ValidationPipe())
    async updateUser(
        @Param('id') id: string,
        @Body() updateDto: UpdateUserDTO,
        @User() currUser: ResponseUserDTO,
    ): Promise<ResponseUserDTO | null> {
        return await this.authService.updateUser(id, updateDto, currUser);
    }

    @Delete('accounts/:id')
    @UseGuards(AuthGuard)
    async deleteUser(
        @Param('id') id: string,
        @User() currUser: ResponseUserDTO,
    ): Promise<ResponseUserDTO | null> {
        return await this.authService.deleteUser(id, currUser);
    }

    @Get('ownAccount')
    async getOwnAccont(
        @User('id') id: string,
    ): Promise<ResponseUserDTO | null> {
        console.log({ id });

        return await this.authService.getUserById(id);
    }

    @Get(':id')
    async getById(@Param('id') id: string): Promise<ResponseUserDTO | null> {
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
