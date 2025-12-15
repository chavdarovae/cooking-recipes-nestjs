import {
    GenericListResponseDTO,
    GenericMetaResponseDTO,
    MongoMapper,
} from '@crp-nest-app/shared';
import { ResponseUserDTO } from './dtos/responseUser.dto';

export class UserMapper extends MongoMapper {
    static toResponse(user: any): ResponseUserDTO {
        const mapped = this.mapId(user);

        return {
            id: mapped.id,
            username: mapped.username,
            email: mapped.email,
            role: mapped.role,
        };
    }

    static toResponseList(
        users?: any[],
        metaData?: GenericMetaResponseDTO,
    ): GenericListResponseDTO<ResponseUserDTO> {
        const plainUsers: ResponseUserDTO[] | undefined = users?.map(
            (recipe: any) => this.toResponse(recipe),
        );
        return this.mapEntityList(plainUsers, metaData);
    }
}
