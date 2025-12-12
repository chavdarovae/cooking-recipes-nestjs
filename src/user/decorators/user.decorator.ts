import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User = createParamDecorator((data: any, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest(); // uses the request and the user property that we append to the req in auth middleware

    if (!request.user) {
        return null;
    }

    if (data) {
        return request.user[data];
    }

    return request.user;
});
