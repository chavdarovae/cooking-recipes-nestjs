import { IsEmail } from 'class-validator';

export class UpdateUserDTO {
	readonly username: string;

	@IsEmail()
	readonly email: string;

	readonly image: string;

	readonly bio: string;
}
