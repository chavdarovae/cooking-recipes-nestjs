import { GenericMetaDataRequestDTO, UserRolesEnum } from '@crp-nest-app/shared';
import { IsOptional, IsString, IsNumberString, IsEnum } from 'class-validator';

type KeysOfROles = keyof UserRolesEnum;

export class GetUserQueryDto extends GenericMetaDataRequestDTO {
    @IsOptional()
    @IsString()
    search?: string;
    @IsOptional()
    @IsEnum(UserRolesEnum)
    role?: KeysOfROles;
}
