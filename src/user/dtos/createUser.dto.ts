import { UserRolesEnum } from '@crp-nest-app/shared';
import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';

export class CreateUserDTO {
    @IsNotEmpty()
    username: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsEnum(UserRolesEnum)
    role: string;

    @IsNotEmpty()
    password: string;
}
