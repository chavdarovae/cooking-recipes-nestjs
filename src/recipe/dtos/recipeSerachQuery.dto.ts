import { GenericMetaDataRequestDTO } from '@crp-nest-app/shared';
import { IsOptional, IsString, IsNumberString } from 'class-validator';

export class GetRecipesQueryDto extends GenericMetaDataRequestDTO {
    @IsOptional()
    @IsString()
    search?: string;
}
