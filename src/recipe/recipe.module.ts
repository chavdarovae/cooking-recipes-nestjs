import { Module } from '@nestjs/common';
import { RecipeController } from './recipe.controller';
import { RecipeService } from './recipe.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Recipe, RecipeSchema } from './recipe.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Recipe.name, schema: RecipeSchema },
        ]),
    ],
    controllers: [RecipeController],
    providers: [RecipeService],
})
export class RecipeModule {}
