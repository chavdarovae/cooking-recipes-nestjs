import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './shared/filters/error-catching.filter';
import cookieParser from 'cookie-parser';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.useGlobalPipes(
        // Register globally all validation pipes
        new ValidationPipe({
            whitelist: true, // remove unknown properties
            forbidNonWhitelisted: false, // or true if you want strict mode
            transform: true, // auto-convert types (e.g., "5" -> 5)
        }),
    );

    app.useGlobalFilters(new AllExceptionsFilter()); // Register globally all exception filters
    app.use(cookieParser());
    await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
