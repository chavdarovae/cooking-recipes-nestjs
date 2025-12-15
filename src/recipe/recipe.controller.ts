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
import { RecipeResponseDto } from './dtos/responseRecipe.dto';

@Controller('/api/recipes')
export class RecipeController {
    constructor(private readonly recipeService: RecipeService) {}

    @Get()
    async getAll(
        @Query() query: GetRecipesQueryDto,
    ): Promise<RecipeResponseDto[]> {
        return this.recipeService.getAllRecipes(query);
    }

    @Get(':id')
    async getById(@Param('id') id: string): Promise<RecipeResponseDto | null> {
        return this.recipeService.getRecipeById(id);
    }

    @Post()
    @UseGuards(AuthGuard)
    @UsePipes(new ValidationPipe())
    async createRecipe(
        @Body() createDto: CreateRecipeDto,
    ): Promise<RecipeResponseDto> {
        return this.recipeService.createRecipe(createDto);
    }

    @Put(':id')
    @UseGuards(AuthGuard)
    @UsePipes(new ValidationPipe())
    async updateRecipe(
        @Param() id: string,
        @Body() updateDto: UpdateRecipeDto,
    ): Promise<RecipeResponseDto> {
        return this.recipeService.updateRecipe(id, updateDto);
    }

    @Delete(':id')
    @UseGuards(AuthGuard)
    async deleteRecipe(@Param() id: string): Promise<null> {
        return this.recipeService.deleteRecipe(id);
    }
}
