import { UserDocument } from '../user.schema';

export type UserType = Pick<
    UserDocument,
    '_id' | 'email' | 'username' | 'role'
>;
