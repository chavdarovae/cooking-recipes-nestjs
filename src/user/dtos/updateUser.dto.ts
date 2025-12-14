import { UserRolesEnum } from '@crp-nest-app/shared';
import { IsEmail, IsEnum, IsString, Length } from 'class-validator';

export class UpdateUserDTO {
    @IsString()
    @Length(5)
    username: string;

    @IsEmail()
    email: string;

    @IsEnum(UserRolesEnum)
    role: string;
}
