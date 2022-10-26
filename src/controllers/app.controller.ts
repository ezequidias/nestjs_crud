
import { Controller, Get, Request } from '@nestjs/common';

@Controller()
export class AppController {
    constructor() { }

    @Get(['/health', '/api/health'])
    async healthCheck(@Request() req) {
        return { works: 'Hello World' };
    }
}