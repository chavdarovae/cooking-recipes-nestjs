import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Recipe, RecipeDocument } from './recipe.schema';
import { Model, Types } from 'mongoose';
import { GetRecipesQueryDto } from './dtos/recipeSerachQuery.dto';
import { CreateRecipeDto } from './dtos/createRecipe.dto';
import { UpdateRecipeDto } from './dtos/updateRecipe.dto';
import { RecipeResponseDto } from './dtos/responseRecipe.dto';
import { RecipeMapper } from './recipe.mapper';

@Injectable()
export class RecipeService {
    private static readonly RESPONSE_FIELDS =
        '_id title ingredients instructions description image recommendList owner';
    private static readonly ALLOWED_SORT_FIELDS = ['title', 'createdAt'];
    private static readonly MAX_ENTITIES_PER_PAGE = 50;

    constructor(
        @InjectModel(Recipe.name) private recipeModel: Model<RecipeDocument>,
    ) {}

    async getAllRecipes(
        query?: GetRecipesQueryDto,
    ): Promise<RecipeResponseDto[]> {
        const {
            search,
            page = 1,
            entitiesPerPage = 20,
            sort,
            ...rest
        } = query || {};

        const safeLimit = Math.min(
            entitiesPerPage,
            RecipeService.MAX_ENTITIES_PER_PAGE,
        );
        const skip = (page - 1) * safeLimit;

        const mongoQuery: any = {};

        if (search) {
            const regex = { $regex: search, $options: 'i' };
            mongoQuery.$or = [{ title: regex }, { description: regex }];
        }

        let sortQuery;

        if (
            sort &&
            RecipeService.ALLOWED_SORT_FIELDS.includes(sort.replace('-', ''))
        ) {
            sortQuery = sort.startsWith('-')
                ? { [sort.slice(1)]: -1 }
                : { [sort]: 1 };
        }

        const recipes = await this.recipeModel
            .find(mongoQuery)
            .select(RecipeService.RESPONSE_FIELDS)
            .sort(sortQuery)
            .skip(skip)
            .limit(safeLimit)
            .lean()
            .exec();

        return recipes ? RecipeMapper.toResponseList(recipes) : [];
    }

    async getRecipeById(id: string): Promise<RecipeResponseDto | null> {
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid recipe id');
        }
        const recipe = await this.recipeModel
            .findById(id)
            .select(RecipeService.RESPONSE_FIELDS)
            .lean()
            .exec();

        if (!recipe) {
            throw new NotFoundException('Recipe not found');
        }

        return RecipeMapper.toResponse(recipe);
    }

    async createRecipe(
        createRecipeDto: CreateRecipeDto,
    ): Promise<RecipeResponseDto> {
        const recipe = await this.recipeModel.create(createRecipeDto);
        return RecipeMapper.toResponse(recipe.toObject());
    }

    async updateRecipe(
        id: string,
        updateRecipeDto: UpdateRecipeDto,
    ): Promise<RecipeResponseDto> {
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid recipe id');
        }
        const recipe = await this.recipeModel
            .findByIdAndUpdate(id, updateRecipeDto, { new: true })
            .select(RecipeService.RESPONSE_FIELDS)
            .lean()
            .exec();

        if (!recipe) {
            throw new NotFoundException('Recipe not found');
        }
        return RecipeMapper.toResponse(recipe);
    }

    async deleteRecipe(id: string): Promise<null> {
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid recipe id');
        }
        const result = await this.recipeModel.findByIdAndDelete(id).exec();

        if (!result) {
            throw new NotFoundException('Recipe not found');
        }
        return null;
    }
}
