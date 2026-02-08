import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class PassesService {
  private readonly logger = new Logger(PassesService.name);

  constructor(private prisma: PrismaService) {}

  // ==================== TYPY KARNETÓW ====================

  /**
   * Pobiera wszystkie typy karnetów dla tenanta
   */
  async findAllTypes(tenantId: string) {
    return this.prisma.pass_types.findMany({
      where: { tenantId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Tworzy nowy typ karnetu
   */
  async createType(tenantId: string, data: {
    name: string;
    description?: string;
    passKind: 'VISITS' | 'TIME';
    visitsCount?: number;
    validityDays: number;
    price: number;
    serviceIds?: string[];
  }) {
    if (data.passKind === 'VISITS' && !data.visitsCount) {
      throw new BadRequestException('Dla karnetu wizytowego wymagana jest liczba wizyt');
    }

    const passType = await this.prisma.pass_types.create({
      data: {
        tenantId,
        name: data.name,
        description: data.description,
        passKind: data.passKind,
        visitsCount: data.visitsCount,
        validityDays: data.validityDays,
        price: data.price,
        serviceIds: data.serviceIds || null,
      },
    });

    this.logger.log(`Utworzono typ karnetu "${data.name}" dla tenant ${tenantId}`);
    return passType;
  }

  /**
   * Aktualizuje typ karnetu
   */
  async updateType(id: string, tenantId: string, data: {
    name?: string;
    description?: string;
    visitsCount?: number;
    validityDays?: number;
    price?: number;
    serviceIds?: string[];
    isActive?: boolean;
  }) {
    const existing = await this.prisma.pass_types.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      throw new NotFoundException('Typ karnetu nie został znaleziony');
    }

    return this.prisma.pass_types.update({
      where: { id },
      data,
    });
  }

  /**
   * Usuwa typ karnetu (soft delete)
   */
  async removeType(id: string, tenantId: string) {
    const existing = await this.prisma.pass_types.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      throw new NotFoundException('Typ karnetu nie został znaleziony');
    }

    await this.prisma.pass_types.update({
      where: { id },
      data: { isActive: false },
    });

    return { success: true };
  }

  // ==================== KARNETY KLIENTÓW ====================

  /**
   * Pobiera karnety klienta
   */
  async findCustomerPasses(customerId: string, tenantId: string) {
    return this.prisma.customer_passes.findMany({
      where: { customerId, tenantId },
      include: {
        passType: true,
        usages: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Pobiera aktywne karnety klienta
   */
  async findActiveCustomerPasses(customerId: string, tenantId: string) {
    const now = new Date();
    return this.prisma.customer_passes.findMany({
      where: {
        customerId,
        tenantId,
        status: 'ACTIVE',
        expiresAt: { gt: now },
      },
      include: {
        passType: true,
      },
    });
  }

  /**
   * Sprzedaje karnet klientowi
   */
  async sellPass(tenantId: string, data: {
    passTypeId: string;
    customerId: string;
  }) {
    const passType = await this.prisma.pass_types.findFirst({
      where: { id: data.passTypeId, tenantId, isActive: true },
    });

    if (!passType) {
      throw new NotFoundException('Typ karnetu nie został znaleziony');
    }

    const customer = await this.prisma.customers.findFirst({
      where: { id: data.customerId, tenantId },
    });

    if (!customer) {
      throw new NotFoundException('Klient nie został znaleziony');
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + passType.validityDays);

    const pass = await this.prisma.customer_passes.create({
      data: {
        passTypeId: data.passTypeId,
        customerId: data.customerId,
        tenantId,
        expiresAt,
        visitsTotal: passType.visitsCount,
        status: 'ACTIVE',
      },
      include: {
        passType: true,
        customer: true,
      },
    });

    this.logger.log(`Sprzedano karnet "${passType.name}" klientowi ${customer.firstName} ${customer.lastName}`);
    return pass;
  }

  /**
   * Wykorzystuje karnet przy rezerwacji
   */
  async usePass(passId: string, bookingId?: string) {
    const pass = await this.prisma.customer_passes.findUnique({
      where: { id: passId },
      include: { passType: true },
    });

    if (!pass) {
      throw new NotFoundException('Karnet nie został znaleziony');
    }

    if (pass.status !== 'ACTIVE') {
      throw new BadRequestException('Karnet nie jest aktywny');
    }

    if (new Date() > pass.expiresAt) {
      await this.prisma.customer_passes.update({
        where: { id: passId },
        data: { status: 'EXPIRED' },
      });
      throw new BadRequestException('Karnet wygasł');
    }

    // Dla karnetów wizytowych sprawdź limit
    if (pass.passType.passKind === 'VISITS') {
      if (pass.visitsUsed >= (pass.visitsTotal || 0)) {
        await this.prisma.customer_passes.update({
          where: { id: passId },
          data: { status: 'USED_UP' },
        });
        throw new BadRequestException('Karnet został wykorzystany');
      }
    }

    // Zapisz wykorzystanie
    await this.prisma.pass_usages.create({
      data: {
        passId,
        bookingId,
      },
    });

    // Zaktualizuj licznik
    const updatedPass = await this.prisma.customer_passes.update({
      where: { id: passId },
      data: {
        visitsUsed: { increment: 1 },
      },
    });

    // Sprawdź czy karnet został wykorzystany
    if (pass.passType.passKind === 'VISITS' && updatedPass.visitsUsed >= (pass.visitsTotal || 0)) {
      await this.prisma.customer_passes.update({
        where: { id: passId },
        data: { status: 'USED_UP' },
      });
    }

    this.logger.log(`Wykorzystano karnet ${passId}`);
    return updatedPass;
  }

  /**
   * Anuluje karnet
   */
  async cancelPass(passId: string, tenantId: string) {
    const pass = await this.prisma.customer_passes.findFirst({
      where: { id: passId, tenantId },
    });

    if (!pass) {
      throw new NotFoundException('Karnet nie został znaleziony');
    }

    await this.prisma.customer_passes.update({
      where: { id: passId },
      data: { status: 'CANCELLED' },
    });

    this.logger.log(`Anulowano karnet ${passId}`);
    return { success: true };
  }

  /**
   * Zwraca wizytę na karnet (przy anulowaniu/usunięciu rezerwacji)
   */
  async refundPassUsage(bookingId: string) {
    // Znajdź wykorzystanie karnetu dla tej rezerwacji
    const usage = await this.prisma.pass_usages.findFirst({
      where: { bookingId },
      include: { pass: true },
    });

    if (!usage) {
      this.logger.log(`Brak wykorzystania karnetu dla rezerwacji ${bookingId}`);
      return null;
    }

    const pass = usage.pass;

    // Usuń wykorzystanie
    await this.prisma.pass_usages.delete({
      where: { id: usage.id },
    });

    // Zmniejsz licznik wykorzystanych wizyt
    const updatedPass = await this.prisma.customer_passes.update({
      where: { id: pass.id },
      data: {
        visitsUsed: { decrement: 1 },
        // Jeśli karnet był USED_UP, przywróć do ACTIVE
        status: pass.status === 'USED_UP' ? 'ACTIVE' : pass.status,
      },
    });

    this.logger.log(`Zwrócono wizytę na karnet ${pass.id} dla rezerwacji ${bookingId}`);
    return updatedPass;
  }

  /**
   * Sprawdza czy rezerwacja ma przypisany karnet
   */
  async getPassUsageForBooking(bookingId: string) {
    return this.prisma.pass_usages.findFirst({
      where: { bookingId },
      include: { 
        pass: {
          include: { passType: true }
        }
      },
    });
  }

  /**
   * Pobiera statystyki karnetów dla tenanta
   */
  async getStats(tenantId: string) {
    const [active, expired, usedUp, totalSold] = await Promise.all([
      this.prisma.customer_passes.count({ where: { tenantId, status: 'ACTIVE' } }),
      this.prisma.customer_passes.count({ where: { tenantId, status: 'EXPIRED' } }),
      this.prisma.customer_passes.count({ where: { tenantId, status: 'USED_UP' } }),
      this.prisma.customer_passes.count({ where: { tenantId } }),
    ]);

    return {
      active,
      expired,
      usedUp,
      totalSold,
    };
  }

  /**
   * Pobiera wszystkie sprzedane karnety dla tenanta
   */
  async findAllSoldPasses(tenantId: string, status?: string) {
    const where: any = { tenantId };
    
    if (status && status !== 'all') {
      where.status = status;
    }

    return this.prisma.customer_passes.findMany({
      where,
      include: {
        passType: true,
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        usages: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
