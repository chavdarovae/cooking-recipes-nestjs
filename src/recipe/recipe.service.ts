import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Recipe, RecipeDocument } from './recipe.schema';
import { Model, Types } from 'mongoose';
import { GetRecipesQueryDto } from './dtos/recipeSerachQuery.dto';
import { CreateRecipeDto } from './dtos/createRecipe.dto';
import { UpdateRecipeDto } from './dtos/updateRecipe.dto';
import { ResponseRecipeDto } from './dtos/responseRecipe.dto';
import { RecipeMapper } from './recipe.mapper';
import {
    GenericListResponseDTO,
    GenericMetaResponseDTO,
} from '@crp-nest-app/shared';

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
    ): Promise<GenericListResponseDTO<ResponseRecipeDto>> {
        const {
            search,
            page = 1,
            pageSize = 50,
            sort,
            owner,
            ...rest
        } = query || {};

        const safeLimit = Math.min(
            pageSize,
            RecipeService.MAX_ENTITIES_PER_PAGE,
        );
        const skip = (page - 1) * safeLimit;

        const mongoQuery: any = {};

        if (search) {
            const regex = { $regex: search, $options: 'i' };
            mongoQuery.$or = [{ title: regex }, { description: regex }];
        }

        if (owner && Types.ObjectId.isValid(owner)) {
            mongoQuery.owner = new Types.ObjectId(owner);
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

        const recipesCount = await this.recipeModel.countDocuments(mongoQuery);

        const metaData = new GenericMetaResponseDTO(
            page,
            pageSize,
            recipesCount,
        );

        return RecipeMapper.toResponseList(recipes, metaData);
    }

    async getRecipeById(id: string): Promise<ResponseRecipeDto | null> {
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
        ownerId: string,
    ): Promise<ResponseRecipeDto> {
        const recipe = await this.recipeModel.create({
            ...createRecipeDto,
            owner: new Types.ObjectId(ownerId),
        });
        return RecipeMapper.toResponse(recipe.toObject());
    }

    async updateRecipe(
        id: string,
        updateRecipeDto: UpdateRecipeDto,
    ): Promise<ResponseRecipeDto> {
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid recipe id');
        }

        const recipe = await this.recipeModel
            .findByIdAndUpdate(id, updateRecipeDto, { new: true })
            .select(RecipeService.RESPONSE_FIELDS)
            .lean()
            .exec();

        if (!recipe) {
            throw new NotFoundException('Recipe could not be updated');
        }
        return RecipeMapper.toResponse(recipe);
    }

    async deleteRecipe(id: string): Promise<null> {
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid recipe id');
        }

        const result = await this.recipeModel.findByIdAndDelete(id).exec();

        if (!result) {
            throw new NotFoundException('Recipe could not be deleted');
        }
        return null;
    }

    async recommendRecipe(
        recipeId: string,
        recommanderId: string,
    ): Promise<ResponseRecipeDto> {
        if (!Types.ObjectId.isValid(recipeId)) {
            throw new BadRequestException('Invalid recipe id');
        }

        if (!Types.ObjectId.isValid(recommanderId)) {
            throw new BadRequestException('Invalid recommander id');
        }

        const recipe = await this.recipeModel
            .findByIdAndUpdate(
                recipeId,
                {
                    $push: {
                        recommendList: new Types.ObjectId(recommanderId),
                    },
                },
                { new: true },
            )
            .select(RecipeService.RESPONSE_FIELDS)
            .lean()
            .exec();

        if (!recipe) {
            throw new NotFoundException('Recipe could not be recommanded');
        }
        return RecipeMapper.toResponse(recipe);
    }
}
