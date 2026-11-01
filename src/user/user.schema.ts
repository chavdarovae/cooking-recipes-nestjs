import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { UserRolesEnum } from '../shared/enums/user.enum';
import * as bcrypt from 'bcryptjs';
import { SALT_ROUNDS } from '@crp-nest-app/shared';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema({
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'lastModifiedAt',
    },
})
export class User {
    @Prop({ required: true, minlength: 5 })
    username: string;

    @Prop({ required: true, minlength: 4 })
    email: string;

    @Prop({ required: true, minlength: 4 })
    password: string;

    @Prop({ type: String, required: true, enum: UserRolesEnum })
    role: UserRolesEnum;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    createdBy?: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    lastModifiedBy?: Types.ObjectId;

    createdAt?: Date;
    lastModifiedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Hash password before saving
UserSchema.pre<UserDocument>('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
    }
    next();
});

UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ username: 1 }, { unique: true });
UserSchema.index({ createdAt: -1 }); // fast sorting by creation date
UserSchema.index({ lastModifiedAt: -1 }); // fast sorting by last modified date
