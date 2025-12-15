import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class GenericMetaDataRequestDTO {
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    page?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    pageSize?: number;

    @IsOptional()
    @IsString()
    sort?: string;

    @IsOptional()
    @IsString()
    filter?: string;
}

export class GenericMetaResponseDTO {
    constructor(
        public page: number = 1,
        public pageSize: number = 50,
        public total: number = 0,
        public sort?: string,
        public filter?: string,
    ) {}
}

export class GenericListResponseDTO<T> {
    constructor(
        public data: T[],
        public metaData: GenericMetaResponseDTO = new GenericMetaResponseDTO(),
    ) {}
}
