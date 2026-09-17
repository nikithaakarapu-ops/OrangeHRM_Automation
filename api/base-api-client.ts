import { APIRequestContext, APIResponse } from '@playwright/test';
import { config } from '../config/environment.config';

export class BaseApiClient {
  constructor(
    protected readonly request: APIRequestContext,
    protected readonly baseUrl: string = config.apiBaseUri,
  ) {}

  async send(
    method: string,
    endpoint: string,
    headers?: Record<string, string>,
    payload?: unknown,
  ): Promise<APIResponse> {
    console.log(`API ${method} ${this.baseUrl}${endpoint}`);
    return this.request.fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers,
      data: payload,
    });
  }
}
