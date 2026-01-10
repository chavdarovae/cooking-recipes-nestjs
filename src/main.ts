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

    const allowedOrigins = [
        'http://localhost:4200',
        'https://chavdarovae.github.io',
    ];

    app.enableCors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
    });

    app.useGlobalFilters(new AllExceptionsFilter()); // Register globally all exception filters
    app.use(cookieParser());
    await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
