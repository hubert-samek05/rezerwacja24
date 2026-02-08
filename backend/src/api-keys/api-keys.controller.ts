import { Controller, Get, Post, Delete, Body, Param, Headers, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiKeysService } from './api-keys.service';

@Controller('api-keys')
export class ApiKeysController {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  /**
   * POST /api/api-keys/generate
   * Generuje nowy klucz API
   */
  @Post('generate')
  async generateKey(
    @Headers('x-tenant-id') tenantId: string,
    @Body('name') name: string,
  ) {
    if (!tenantId) {
      return { error: 'Tenant ID is required' };
    }
    
    const keyName = name || 'New API Key';
    return this.apiKeysService.generateApiKey(tenantId, keyName);
  }

  /**
   * GET /api/api-keys
   * Pobiera wszystkie klucze API dla tenanta
   */
  @Get()
  async getKeys(@Headers('x-tenant-id') tenantId: string) {
    if (!tenantId) {
      return { error: 'Tenant ID is required' };
    }
    
    return this.apiKeysService.getApiKeys(tenantId);
  }

  /**
   * DELETE /api/api-keys/:id
   * Usuwa klucz API
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteKey(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') keyId: string,
  ) {
    if (!tenantId) {
      return { error: 'Tenant ID is required' };
    }
    
    const deleted = await this.apiKeysService.deleteApiKey(tenantId, keyId);
    return { success: deleted };
  }

  /**
   * POST /api/api-keys/verify
   * Weryfikuje klucz API
   */
  @Post('verify')
  async verifyKey(@Body('apiKey') apiKey: string) {
    return this.apiKeysService.verifyApiKey(apiKey);
  }
}
