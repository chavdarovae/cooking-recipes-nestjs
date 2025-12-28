import { ForbiddenException, Injectable } from '@nestjs/common';
import { ResponseUserDTO } from '@crp-nest-app/user';

@Injectable()
export class SharedUtilService {
    checkIfUserIsOwner(entityCreator: string, currUser: ResponseUserDTO): void {
        if (currUser.id !== entityCreator) {
            throw new ForbiddenException();
        }
    }
}
