import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';

export type RecipeDocument = Recipe & Document;

@Schema({
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'lastModifiedAt',
    },
})
export class Recipe {
    @Prop()
    title: string;

    @Prop()
    ingredients: string;

    @Prop()
    instructions: string;

    @Prop()
    description: string;

    @Prop()
    image: string;

    @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
    recommendList: Types.ObjectId[];

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    owner: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    createdBy: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    lastModifiedBy?: Types.ObjectId;

    createdAt?: Date;
    lastModifiedAt?: Date;
}

export const RecipeSchema = SchemaFactory.createForClass(Recipe);

RecipeSchema.index({ title: 'text', description: 'text' }); // text search
RecipeSchema.index({ createdAt: -1 }); // fast sorting by creation date
RecipeSchema.index({ lastModifiedAt: -1 }); // fast sorting by last modified date
