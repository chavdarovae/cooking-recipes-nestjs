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
    ): Promise<ResponseRecipeDto> {
        return this.recipeService.createRecipe(createDto);
    }

    @Put(':id')
    @UseGuards(AuthGuard)
    @UsePipes(new ValidationPipe())
    async updateRecipe(
        @Param('id') id: string,
        @Body() updateDto: UpdateRecipeDto,
    ): Promise<ResponseRecipeDto> {
        return this.recipeService.updateRecipe(id, updateDto);
    }

    @Delete(':id')
    @UseGuards(AuthGuard)
    async deleteRecipe(@Param('id') id: string): Promise<null> {
        return this.recipeService.deleteRecipe(id);
    }
}
