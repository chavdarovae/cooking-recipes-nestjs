import { Recipe } from './recipe.schema';
import { RecipeService } from './recipe.service';
import { Controller, Get, Param, Query } from '@nestjs/common';
import { GetRecipesQueryDto } from './recipe.dto';

@Controller('/api/recipes')
export class RecipeController {
    constructor(private readonly recipeService: RecipeService) {}

    @Get()
    async getAll(@Query() query: GetRecipesQueryDto): Promise<Recipe[]> {
        return this.recipeService.getAllRecipes(query);
    }

    @Get(':id')
    async getById(@Param('id') id: string): Promise<Recipe | null> {
        return this.recipeService.getRecipeById(id);
    }
}
