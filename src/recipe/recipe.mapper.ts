import { MongoMapper } from '@crp-nest-app/shared';
import { RecipeResponseDto } from './dtos/responseRecipe.dto';
import { Recipe } from './recipe.schema';

export class RecipeMapper extends MongoMapper {
    static toResponse(reicpe: Recipe): RecipeResponseDto {
        return {
            ...this.mapId(reicpe),
            owner: this.mapOwner(reicpe),
        } as any as RecipeResponseDto;
    }

    static toResponseList(recipes: Recipe[]): RecipeResponseDto[] {
        return recipes.map((recipe: Recipe) => this.toResponse(recipe));
    }
}
