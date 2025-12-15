import { Response } from 'express';
import { IsString, IsUrl, Length } from 'class-validator';

export class ResponseRecipeDto {
    title: string;
    ingredients: string;
    instructions: string;
    description: string;
    image: string;
    owner: string;
    recommendList: string[];
}
