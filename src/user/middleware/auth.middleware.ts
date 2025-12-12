import { AuthService } from './../auth.service';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { verify } from 'jsonwebtoken';
import { AUTH_COOKIE_NAME } from '@crp-nest-app/shared';
import { UserType } from '../types/user.type';
import { NextFunction, Request, Response } from 'express';
import { UserTokenType } from '../types/userToken.type';

interface AuthRequest extends Request {
    user?: UserType | null;
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
    constructor(private readonly authService: AuthService) {}

    async use(req: AuthRequest, res: Response, next: NextFunction) {
        if (!req.cookies) {
            req.user = null;
            next();
            return;
        }

        const token = req.cookies[AUTH_COOKIE_NAME];

        if (!token) {
            req.user = null;
            next();
            return;
        }

        try {
            const decoded = verify(token, process.env.JWT_SECRET || '');
            const decodedUserFromToken = decoded as UserTokenType;
            const user = await this.authService.getUserById(
                decodedUserFromToken.id,
            );
            req.user = user || null;

            next();
            return;
        } catch (error) {
            console.error(error);
            req.user = null;
            res.clearCookie(AUTH_COOKIE_NAME);
            next();
            return;
        }
    }
}
