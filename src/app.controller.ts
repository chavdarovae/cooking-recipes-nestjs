import { Controller, Get } from '@nestjs/common';
import { AppService } from '../.github/workflows/app.service';

@Controller('')
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Get()
    getHello(): string {
        return this.appService.getHello();
    }
}
