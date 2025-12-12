import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Recipe, RecipeDocument } from './recipe.schema';
import { Model } from 'mongoose';
import { GetRecipesQueryDto } from './recipe.dto';

@Injectable()
export class RecipeService {
    constructor(
        @InjectModel(Recipe.name) private recipeModel: Model<RecipeDocument>,
    ) {}

    async getAllRecipes(query?: GetRecipesQueryDto): Promise<Recipe[]> {
        try {
            const {
                search,
                page = 1,
                entitiesPerPage = 20,
                sort,
                ...rest
            } = query || {};

            const mongoQuery: any = {};

            // 🔍 Search in title OR description
            if (search) {
                const regex = { $regex: search, $options: 'i' };
                mongoQuery.$or = [{ title: regex }, { description: regex }];
            }

            const skip = (page - 1) * entitiesPerPage;
            const limit = entitiesPerPage;

            let queryBase = this.recipeModel.find(mongoQuery);

            if (sort) {
                queryBase = queryBase.sort(sort);
            }

            queryBase.skip(skip).limit(limit);

            return await queryBase.lean().exec();
        } catch (error) {
            console.error('Error fetching recipes:', error);
            throw new InternalServerErrorException('Failed to fetch recipes');
        }
    }

    async getRecipeById(id: string): Promise<Recipe | null> {
        return await this.recipeModel.findById(id).lean().exec(); // lean() converts to plain JSON
    }
}
