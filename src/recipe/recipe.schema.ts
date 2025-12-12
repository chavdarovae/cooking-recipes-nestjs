import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';

export type RecipeDocument = Recipe & Document;

@Schema()
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

    @Prop()
    recommendList: Types.ObjectId;

    @Prop()
    owner: Types.ObjectId;
}

export const RecipeSchema = SchemaFactory.createForClass(Recipe);
