import { PaginationAndSortingQueryDto } from '@crp-nest-app/shared';
import { IsOptional, IsString, IsNumberString } from 'class-validator';

export class GetRecipesQueryDto extends PaginationAndSortingQueryDto {
    @IsOptional()
    @IsString()
    search?: string;
}
