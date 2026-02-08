import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { randomBytes } from 'crypto';

export interface ApiKey {
  id: string;
  tenantId: string;
  name: string;
  key: string;
  createdAt: Date;
  lastUsed?: Date;
}

@Injectable()
export class ApiKeysService {
  private readonly logger = new Logger(ApiKeysService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Generuje nowy klucz API
   */
  async generateApiKey(tenantId: string, name: string): Promise<ApiKey> {
    const keyId = `key_${Date.now()}_${randomBytes(8).toString('hex')}`;
    const apiKey = `rzw24_live_${randomBytes(24).toString('hex')}`;

    const newKey = await this.prisma.api_keys.create({
      data: {
        id: keyId,
        tenantId,
        name,
        key: apiKey,
        createdAt: new Date(),
      },
    });

    this.logger.log(`🔑 Wygenerowano nowy klucz API: ${keyId} dla tenant ${tenantId}`);

    return newKey;
  }

  /**
   * Pobiera wszystkie klucze dla tenanta
   */
  async getApiKeys(tenantId: string): Promise<ApiKey[]> {
    return this.prisma.api_keys.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Usuwa klucz API
   */
  async deleteApiKey(tenantId: string, keyId: string): Promise<boolean> {
    try {
      await this.prisma.api_keys.delete({
        where: { 
          id: keyId,
          tenantId, // Upewnij się że klucz należy do tego tenanta
        },
      });
      this.logger.log(`🗑️ Usunięto klucz API: ${keyId}`);
      return true;
    } catch (error) {
      this.logger.error(`Błąd usuwania klucza API: ${error}`);
      return false;
    }
  }

  /**
   * Weryfikuje klucz API
   */
  async verifyApiKey(apiKey: string): Promise<{ valid: boolean; tenantId?: string }> {
    const found = await this.prisma.api_keys.findUnique({
      where: { key: apiKey },
    });

    if (found) {
      // Aktualizuj lastUsed
      await this.prisma.api_keys.update({
        where: { id: found.id },
        data: { lastUsed: new Date() },
      });
      return { valid: true, tenantId: found.tenantId };
    }

    return { valid: false };
  }
}
