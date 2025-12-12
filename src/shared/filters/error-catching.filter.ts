import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        // Detect if the exception is a Nest HttpException (BadRequest, NotFound, etc.)
        const isHttpException = exception instanceof HttpException;

        const status = isHttpException
            ? exception.getStatus()
            : HttpStatus.INTERNAL_SERVER_ERROR;

        const message = isHttpException
            ? exception.getResponse()
            : 'Internal server error';

        // Optional: log unexpected internal errors
        if (!isHttpException) {
            console.error('Unhandled exception:', exception);
        }

        response.status(status).json({
            statusCode: status,
            message,
        });
    }
}
