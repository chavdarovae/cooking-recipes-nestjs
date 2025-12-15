import { MongoMapper } from '@crp-nest-app/shared';
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

    static toResponseList(users: any[]): ResponseUserDTO[] {
        return users.map((user) => this.toResponse(user));
    }
}
