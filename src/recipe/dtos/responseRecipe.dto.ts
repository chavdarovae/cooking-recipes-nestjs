import { Response } from 'express';
import { IsString, IsUrl, Length } from 'class-validator';

export class RecipeResponseDto {
    title: string;
    ingredients: string;
    instructions: string;
    description: string;
    image: string;
    owner: string;
    recommendList: string[];
}
