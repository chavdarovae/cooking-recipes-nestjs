import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserRolesEnum } from '../enums/user.enum';
import { ResponseUserDTO } from '@crp-nest-app/user';

@Injectable()
export class SharedUtilService {
    checkIfUserIsAuthorised(
        requiredRole: UserRolesEnum,
        currUser: ResponseUserDTO,
    ): void {
        if (currUser.role !== requiredRole) {
            throw new HttpException(
                'User is not authorised to modify this entity!',
                HttpStatus.UNAUTHORIZED,
            );
        }
    }

    checkIfUserIsOwner(
        requiredRole: UserRolesEnum,
        currUser: ResponseUserDTO,
    ): void {
        if (currUser.role !== requiredRole) {
            throw new HttpException(
                'User is not authorised to modify this entity!',
                HttpStatus.UNAUTHORIZED,
            );
        }
    }
}
