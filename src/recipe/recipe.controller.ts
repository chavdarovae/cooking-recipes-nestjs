import { RecipeService } from './recipe.controller copy';
import { Controller, Get } from '@nestjs/common';

@Controller('recipes')
export class RecipeController {
    constructor(private readonly recipeService: RecipeService) {}

    @Get()
    getAll(): string[] {
        return this.recipeService.getAllRecipes();
    }

    @Get()
    getById(id: string): string {
        return this.recipeService.getRecipeById(id);
    }
}
