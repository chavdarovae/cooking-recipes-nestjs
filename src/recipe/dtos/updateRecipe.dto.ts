import { IsString, IsUrl, Length } from 'class-validator';
import { Recipe } from '../recipe.schema';

export class UpdateRecipeDto implements Partial<Recipe> {
    @IsString()
    @Length(2)
    title: string;

    @IsString()
    @Length(10, 600)
    ingredients: string;

    @IsString()
    @Length(10, 400)
    instructions: string;

    @IsString()
    @Length(10)
    description: string;

    @IsUrl()
    @Length(6)
    image: string;
}
