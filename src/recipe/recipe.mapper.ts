import { MongoMapper } from '@crp-nest-app/shared';
import { ResponseRecipeDto } from './dtos/responseRecipe.dto';
import { Recipe } from './recipe.schema';

export class RecipeMapper extends MongoMapper {
    static toResponse(reicpe: Recipe): ResponseRecipeDto {
        return {
            ...this.mapId(reicpe),
            owner: this.mapOwner(reicpe),
        } as any as ResponseRecipeDto;
    }

    static toResponseList(recipes: Recipe[]): ResponseRecipeDto[] {
        return recipes.map((recipe: Recipe) => this.toResponse(recipe));
    }
}
