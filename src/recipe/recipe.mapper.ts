import {
    GenericListResponseDTO,
    GenericMetaResponseDTO,
    MongoMapper,
} from '@crp-nest-app/shared';
import { ResponseRecipeDto } from './dtos/responseRecipe.dto';
import { Recipe } from './recipe.schema';

export class RecipeMapper extends MongoMapper {
    static toResponse(reicpe: Recipe): ResponseRecipeDto {
        return {
            ...this.mapId(reicpe),
            owner: this.mapOwner(reicpe),
        } as any as ResponseRecipeDto;
    }

    static toResponseList(
        recipes?: any[],
        metaData?: GenericMetaResponseDTO,
    ): GenericListResponseDTO<ResponseRecipeDto> {
        const plainRecipes: ResponseRecipeDto[] | undefined = recipes?.map(
            (recipe: any) => this.toResponse(recipe),
        );
        return this.mapEntityList<ResponseRecipeDto>(plainRecipes, metaData);
    }
}
