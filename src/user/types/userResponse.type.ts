import { UserType } from './user.type';

export type UserResponceType = UserType & {
    token?: string;
};
