import { UserRolesEnum } from '@crp-nest-app/shared';

export class ResponseUserDTO {
    id: string;
    username: string;
    email: string;
    role: UserRolesEnum;
}
