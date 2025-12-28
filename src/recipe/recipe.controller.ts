import { Recipe } from './recipe.schema';
import { RecipeService } from './recipe.service';
import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    Query,
    UseGuards,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
import { GetRecipesQueryDto } from './dtos/recipeSerachQuery.dto';
import { AuthGuard } from 'src/user/guards/user.guard';
import { CreateRecipeDto } from './dtos/createRecipe.dto';
import { UpdateRecipeDto } from './dtos/updateRecipe.dto';
import { ResponseRecipeDto } from './dtos/responseRecipe.dto';
import { GenericListResponseDTO } from '@crp-nest-app/shared';
import { User } from 'src/user/decorators/user.decorator';
import { ResponseUserDTO } from '@crp-nest-app/user';

@Controller('/api/recipes')
export class RecipeController {
    constructor(private readonly recipeService: RecipeService) {}

    @Get()
    async getAll(
        @Query() query: GetRecipesQueryDto,
    ): Promise<GenericListResponseDTO<ResponseRecipeDto>> {
        return this.recipeService.getAllRecipes(query);
    }

    @Get(':id')
    async getById(@Param('id') id: string): Promise<ResponseRecipeDto | null> {
        return this.recipeService.getRecipeById(id);
    }

    @Post()
    @UseGuards(AuthGuard)
    @UsePipes(new ValidationPipe())
    async createRecipe(
        @Body() createDto: CreateRecipeDto,
        @User('id') currUserId: string,
    ): Promise<ResponseRecipeDto> {
        return this.recipeService.createRecipe(createDto, currUserId);
    }

    @Put(':id')
    @UseGuards(AuthGuard)
    @UsePipes(new ValidationPipe())
    async updateRecipe(
        @Param('id') id: string,
        @Body() updateDto: UpdateRecipeDto,
        @User() currUser: ResponseUserDTO,
    ): Promise<ResponseRecipeDto> {
        return this.recipeService.updateRecipe(id, updateDto, currUser);
    }

    @Delete(':id')
    @UseGuards(AuthGuard)
    async deleteRecipe(
        @Param('id') id: string,
        @User() currUser: ResponseUserDTO,
    ): Promise<null> {
        return this.recipeService.deleteRecipe(id, currUser);
    }

    @Get(':id/recommend')
    @UseGuards(AuthGuard)
    async recommendRecipe(
        @Param('id') recipeId: string,
        @User('id') currUserId: string,
    ): Promise<any> {
        return this.recipeService.recommendRecipe(recipeId, currUserId);
    }
}
