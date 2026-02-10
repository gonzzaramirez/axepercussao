import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  healthCheck() {
    return {
      status: 'ok',
      service: 'Axé Percussão API',
      timestamp: new Date().toISOString(),
    };
  }
}
