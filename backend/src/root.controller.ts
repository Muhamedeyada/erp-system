import { Controller, Get } from '@nestjs/common';
import { Public } from './auth/decorators/public.decorator';

@Controller('/')
export class RootController {
  @Public()
  @Get()
  root(): { message: string; api: string } {
    return { message: 'ERP API', api: '/api' };
  }
}
