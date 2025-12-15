import { Global, Module } from '@nestjs/common';
import { SharedUtilService } from './utils/shared-util.service';

@Global()
@Module({
    imports: [],
    providers: [SharedUtilService],
    exports: [SharedUtilService],
})
export class SharedModule {}
