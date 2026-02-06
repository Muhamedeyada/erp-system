import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'ERP API is running';
  }

  health(): { status: string } {
    return { status: 'ok' };
  }
}
