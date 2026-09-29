import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getData() {
    return {
      name: 'Soir CMS API',
      status: 'ok',
      runtime: 'Node.js + TypeScript',
      timestamp: new Date().toISOString(),
    };
  }
}
