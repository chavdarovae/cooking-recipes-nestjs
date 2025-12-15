import { IsNotEmpty, IsEmail } from 'class-validator';

export class LoginUserDTO {
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    password: string;
}
