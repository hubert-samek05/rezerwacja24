import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { getBaseTemplate } from '../email/templates/base.template';
import { getTwoFactorTemplate } from '../email/templates/two-factor.template';
import * as crypto from 'crypto';

@Injectable()
export class TwoFactorService {
  private readonly logger = new Logger(TwoFactorService.name);
  
  // Przechowuj kody tymczasowo w pamięci (w produkcji lepiej Redis)
  private pendingCodes: Map<string, { code: string; expiresAt: Date }> = new Map();

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {
    // Czyść wygasłe kody co 5 minut
    setInterval(() => this.cleanupExpiredCodes(), 5 * 60 * 1000);
  }

  private cleanupExpiredCodes() {
    const now = new Date();
    for (const [key, value] of this.pendingCodes.entries()) {
      if (value.expiresAt < now) {
        this.pendingCodes.delete(key);
      }
    }
  }

  /**
   * Generuje 6-cyfrowy kod weryfikacyjny
   */
  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Włącza 2FA dla użytkownika
   */
  async enableTwoFactor(userId: string): Promise<{ message: string }> {
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
      select: { email: true, twoFactorEnabled: true },
    });

    if (!user) {
      throw new BadRequestException('Użytkownik nie znaleziony');
    }

    if (user.twoFactorEnabled) {
      throw new BadRequestException('2FA jest już włączone');
    }

    // Włącz 2FA
    await this.prisma.users.update({
      where: { id: userId },
      data: { twoFactorEnabled: true },
    });

    this.logger.log(`2FA enabled for user: ${userId}`);

    return { message: 'Uwierzytelnianie dwuskładnikowe zostało włączone' };
  }

  /**
   * Wyłącza 2FA
   */
  async disableTwoFactor(userId: string): Promise<{ message: string }> {
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
      select: { twoFactorEnabled: true },
    });

    if (!user) {
      throw new BadRequestException('Użytkownik nie znaleziony');
    }

    if (!user.twoFactorEnabled) {
      throw new BadRequestException('2FA nie jest włączone');
    }

    // Wyłącz 2FA
    await this.prisma.users.update({
      where: { id: userId },
      data: { twoFactorEnabled: false },
    });

    this.logger.log(`2FA disabled for user: ${userId}`);

    return { message: 'Uwierzytelnianie dwuskładnikowe zostało wyłączone' };
  }

  /**
   * Wysyła kod weryfikacyjny na email
   */
  async sendVerificationCode(userId: string): Promise<{ message: string }> {
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
      select: { email: true, firstName: true },
    });

    if (!user) {
      throw new BadRequestException('Użytkownik nie znaleziony');
    }

    // Generuj kod
    const code = this.generateCode();
    
    // Zapisz kod z czasem wygaśnięcia (10 minut)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    this.pendingCodes.set(userId, { code, expiresAt });

    // Wyślij email z kodem
    try {
      const html = getBaseTemplate(
        'Kod weryfikacyjny - Rezerwacja24',
        getTwoFactorTemplate({ firstName: user.firstName, code })
      );

      await this.emailService.sendEmail({
        to: user.email,
        subject: '🔐 Kod weryfikacyjny - Rezerwacja24',
        html,
      });

      this.logger.log(`Verification code sent to user: ${userId}`);
      return { message: 'Kod weryfikacyjny został wysłany na email' };
    } catch (error) {
      this.logger.error(`Failed to send verification code: ${error.message}`);
      throw new BadRequestException('Nie udało się wysłać kodu weryfikacyjnego');
    }
  }

  /**
   * Weryfikuje kod 2FA podczas logowania
   */
  async verifyCode(userId: string, code: string): Promise<boolean> {
    this.logger.log(`Verifying code for user: ${userId}, code: ${code}`);
    this.logger.log(`Pending codes map size: ${this.pendingCodes.size}`);
    this.logger.log(`Pending codes keys: ${Array.from(this.pendingCodes.keys()).join(', ')}`);
    
    const pending = this.pendingCodes.get(userId);
    
    if (!pending) {
      this.logger.warn(`No pending code for user: ${userId}`);
      return false;
    }
    
    this.logger.log(`Found pending code: ${pending.code}, expires: ${pending.expiresAt}`);
    this.logger.log(`Code match: ${pending.code === code}`);

    // Sprawdź czy kod nie wygasł
    if (pending.expiresAt < new Date()) {
      this.pendingCodes.delete(userId);
      this.logger.warn(`Code expired for user: ${userId}`);
      return false;
    }

    // Sprawdź kod
    if (pending.code === code) {
      this.pendingCodes.delete(userId);
      this.logger.log(`Code verified for user: ${userId}`);
      return true;
    }

    this.logger.warn(`Invalid code for user: ${userId}`);
    return false;
  }

  /**
   * Sprawdza czy użytkownik ma włączone 2FA
   */
  async isTwoFactorEnabled(userId: string): Promise<boolean> {
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
      select: { twoFactorEnabled: true },
    });
    return user?.twoFactorEnabled || false;
  }
}
