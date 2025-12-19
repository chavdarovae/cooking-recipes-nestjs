import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from '../.github/workflows/app.service';
import { RecipeModule } from '@crp-nest-app/recipe';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from '@crp-nest-app/user';
import { AuthMiddleware } from './user/middleware/auth.middleware';
import { SharedModule } from './shared/shared.module';

@Module({
    imports: [
        ConfigModule.forRoot(),
        MongooseModule.forRoot(
            (process.env.DB_URL ||
                process.env.DB_URL_LOCAL ||
                'mongodb://localhost:27017') +
                `${process.env.DB_NAME}?retryWrites=true&w=majority`,
            { autoIndex: false },
        ),
        SharedModule,
        UserModule,
        RecipeModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {
    // global middleware, that is why it is includede in the app module
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(AuthMiddleware).forRoutes({
            path: '*',
            method: RequestMethod.ALL,
        });
    }
}
