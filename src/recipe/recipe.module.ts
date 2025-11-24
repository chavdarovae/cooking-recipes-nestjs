import { Module } from '@nestjs/common';
import { RecipeController } from './recipe.controller';
import { RecipeService } from './recipe.controller copy';

@Module({
    imports: [],
    controllers: [RecipeController],
    providers: [RecipeService],
})
export class RecipeModule {}
