import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Apple Strategy - nie używamy passport-apple bezpośrednio,
 * bo Apple OAuth używa POST callback z form-data.
 * Obsługa jest w auth.controller.ts (appleAuthCallback)
 */
@Injectable()
export class AppleStrategy {
  private readonly logger = new Logger(AppleStrategy.name);

  constructor(private configService: ConfigService) {
    this.logger.log('🍎 Apple Strategy initialized');
  }

  getConfig() {
    return {
      clientID: this.configService.get<string>('APPLE_CLIENT_ID'),
      teamID: this.configService.get<string>('APPLE_TEAM_ID'),
      keyID: this.configService.get<string>('APPLE_KEY_ID'),
      privateKey: this.configService.get<string>('APPLE_PRIVATE_KEY')?.replace(/\\n/g, '\n'),
      callbackURL: this.configService.get<string>('APPLE_CALLBACK_URL'),
    };
  }
}
