import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import * as process from 'process';


@Injectable()
export class ApiKeyGuard implements CanActivate {
  validApiKeys = ''
  constructor() {
    this.validApiKeys = process.env.API_KEY_WEBHOOK as string;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const key = req.headers['x-api-key'] ?? req.query.api_key;
    return this.validateApiKey(key);
  }


  async validateApiKey(apiKey: string): Promise<boolean> {
    return this.validApiKeys == apiKey;
  }
}
