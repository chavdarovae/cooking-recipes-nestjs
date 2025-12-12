import { UserType } from './user.type';

export type UserTokenType = Omit<UserType, '_id'> & { id: string };
