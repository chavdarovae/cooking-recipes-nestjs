import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class PaginationAndSortingQueryDto {
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    page?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    entitiesPerPage?: number;

    @IsOptional()
    @IsString()
    sort?: string;
}

export class PagableResponseDto<T> {
    data: T[];

    @Type(() => Number)
    @IsNumber()
    page: number;

    @Type(() => Number)
    @IsNumber()
    entitiesPerPage?: number;

    @Type(() => Number)
    @IsNumber()
    total: string;
}
