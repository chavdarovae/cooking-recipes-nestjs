import { Injectable } from '@nestjs/common';

@Injectable()
export class RecipeService {
    getAllRecipes(): string[] {
        return ['recipes', 'more recipes'];
    }

    getRecipeById(id: string): string {
        return 'recipes';
    }
}
