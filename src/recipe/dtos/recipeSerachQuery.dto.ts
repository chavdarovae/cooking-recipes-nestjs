import { GenericMetaDataRequestDTO } from '@crp-nest-app/shared';
import { IsOptional, IsString } from 'class-validator';

export class GetRecipesQueryDto extends GenericMetaDataRequestDTO {
    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsString()
    owner?: string;
}
