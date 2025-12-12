import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './user.schema';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
        JwtModule.register({
            secret: process.env.JWT_SECRET || 'super-secret',
            signOptions: { expiresIn: '1d' },
        }),
    ],
    providers: [AuthService],
    controllers: [UserController],
    exports: [AuthService],
})
export class UserModule {}
