import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RecipeModule } from '@crp-nest-app/recipe';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from '@crp-nest-app/user';
import { AuthMiddleware } from './user/middleware/auth.middleware';
import { SharedUtilService } from './shared';

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
        UserModule,
        RecipeModule,
    ],
    controllers: [AppController],
    providers: [AppService, SharedUtilService],
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
