import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class LoyaltyService {
  private readonly logger = new Logger(LoyaltyService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Pobiera lub tworzy ustawienia programu lojalnościowego dla tenanta
   */
  async getSettings(tenantId: string) {
    let program = await this.prisma.loyalty_programs.findFirst({
      where: { tenantId },
      include: {
        levels: { orderBy: { minPoints: 'asc' } },
        loyalty_rewards: { where: { isActive: true }, orderBy: { pointsCost: 'asc' } },
      },
    });

    if (!program) {
      // Utwórz domyślny program
      program = await this.prisma.loyalty_programs.create({
        data: {
          id: `loyalty-${Date.now()}`,
          tenantId,
          name: 'Program Lojalnościowy',
          pointsPerBooking: 0,
          pointsPerCurrency: 1, // 1 punkt za 1 zł
          rewards: {},
          isActive: false,
          updatedAt: new Date(),
        },
        include: {
          levels: true,
          loyalty_rewards: true,
        },
      });
    }

    return program;
  }

  /**
   * Aktualizuje ustawienia programu lojalnościowego
   */
  async updateSettings(tenantId: string, data: {
    name?: string;
    pointsPerCurrency?: number;
    pointsPerBooking?: number;
    isActive?: boolean;
  }) {
    const program = await this.getSettings(tenantId);

    return this.prisma.loyalty_programs.update({
      where: { id: program.id },
      data: {
        name: data.name,
        pointsPerCurrency: data.pointsPerCurrency,
        pointsPerBooking: data.pointsPerBooking,
        isActive: data.isActive,
        updatedAt: new Date(),
      },
      include: {
        levels: { orderBy: { minPoints: 'asc' } },
        loyalty_rewards: { where: { isActive: true } },
      },
    });
  }

  /**
   * Dodaje poziom lojalnościowy
   */
  async addLevel(tenantId: string, data: {
    name: string;
    minPoints: number;
    multiplier?: number;
    color?: string;
    benefits?: any;
  }) {
    const program = await this.getSettings(tenantId);

    return this.prisma.loyalty_levels.create({
      data: {
        programId: program.id,
        name: data.name,
        minPoints: data.minPoints,
        multiplier: data.multiplier || 1,
        color: data.color || '#CD7F32',
        benefits: data.benefits || null,
      },
    });
  }

  /**
   * Dodaje nagrodę do wymiany
   */
  async addReward(tenantId: string, data: {
    name: string;
    description?: string;
    pointsCost: number;
    rewardType: string; // DISCOUNT_PERCENT, DISCOUNT_AMOUNT, FREE_SERVICE
    rewardValue: number;
    serviceId?: string;
  }) {
    const program = await this.getSettings(tenantId);

    return this.prisma.loyalty_rewards.create({
      data: {
        programId: program.id,
        name: data.name,
        description: data.description,
        pointsCost: data.pointsCost,
        rewardType: data.rewardType,
        rewardValue: data.rewardValue,
        serviceId: data.serviceId,
        isActive: true,
      },
    });
  }

  /**
   * Usuwa nagrodę
   */
  async removeReward(rewardId: string) {
    return this.prisma.loyalty_rewards.update({
      where: { id: rewardId },
      data: { isActive: false },
    });
  }

  /**
   * Pobiera saldo punktów klienta
   */
  async getCustomerPoints(tenantId: string, customerId: string) {
    let loyalty = await this.prisma.customer_loyalty.findFirst({
      where: { tenantId, customerId },
      include: {
        level: true,
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!loyalty) {
      // Utwórz rekord lojalnościowy dla klienta
      loyalty = await this.prisma.customer_loyalty.create({
        data: {
          tenantId,
          customerId,
          totalPoints: 0,
          availablePoints: 0,
        },
        include: {
          level: true,
          transactions: true,
        },
      });
    }

    // Pobierz aktualny poziom
    const program = await this.getSettings(tenantId);
    const currentLevel = program.levels.find(
      (l: any) => loyalty!.totalPoints >= l.minPoints
    );

    return {
      ...loyalty,
      currentLevel,
      availableRewards: program.loyalty_rewards.filter(
        (r: any) => loyalty!.availablePoints >= r.pointsCost
      ),
    };
  }

  /**
   * Nalicza punkty za rezerwację
   */
  async earnPoints(tenantId: string, customerId: string, amount: number, bookingId?: string) {
    const program = await this.getSettings(tenantId);
    
    if (!program.isActive) {
      this.logger.debug(`Loyalty program not active for tenant ${tenantId}`);
      return null;
    }

    // Punkty za kwotę + punkty za rezerwację
    const pointsFromAmount = Math.floor(amount * Number(program.pointsPerCurrency));
    const pointsFromBooking = Number(program.pointsPerBooking) || 0;
    const pointsToAdd = pointsFromAmount + pointsFromBooking;
    
    if (pointsToAdd <= 0) {
      return null;
    }

    // Pobierz lub utwórz rekord lojalnościowy
    let loyalty = await this.prisma.customer_loyalty.findFirst({
      where: { tenantId, customerId },
    });

    if (!loyalty) {
      loyalty = await this.prisma.customer_loyalty.create({
        data: {
          tenantId,
          customerId,
          totalPoints: 0,
          availablePoints: 0,
        },
      });
    }

    // Dodaj punkty
    const updated = await this.prisma.customer_loyalty.update({
      where: { id: loyalty.id },
      data: {
        totalPoints: { increment: pointsToAdd },
        availablePoints: { increment: pointsToAdd },
      },
    });

    // Zapisz transakcję
    await this.prisma.loyalty_transactions.create({
      data: {
        customerLoyaltyId: loyalty.id,
        points: pointsToAdd,
        type: 'EARNED',
        description: `Punkty za rezerwację (${amount} zł)`,
        bookingId,
      },
    });

    this.logger.log(`Customer ${customerId} earned ${pointsToAdd} points for ${amount} zł`);

    // Sprawdź czy klient awansował na wyższy poziom
    await this.checkLevelUp(tenantId, loyalty.id, updated.totalPoints);

    return {
      pointsEarned: pointsToAdd,
      newBalance: updated.availablePoints,
    };
  }

  /**
   * Sprawdza i aktualizuje poziom klienta
   */
  private async checkLevelUp(tenantId: string, loyaltyId: string, currentPoints: number) {
    const program = await this.getSettings(tenantId);
    
    const newLevel = program.levels
      .filter((l: any) => currentPoints >= l.minPoints)
      .sort((a: any, b: any) => b.minPoints - a.minPoints)[0];

    if (newLevel) {
      await this.prisma.customer_loyalty.update({
        where: { id: loyaltyId },
        data: { levelId: newLevel.id },
      });
    }
  }

  /**
   * Wymienia punkty na nagrodę
   */
  async redeemReward(tenantId: string, customerId: string, rewardId: string) {
    const reward = await this.prisma.loyalty_rewards.findUnique({
      where: { id: rewardId },
    });

    if (!reward || !reward.isActive) {
      throw new NotFoundException('Nagroda nie istnieje');
    }

    const loyalty = await this.prisma.customer_loyalty.findFirst({
      where: { tenantId, customerId },
    });

    if (!loyalty) {
      throw new BadRequestException('Klient nie ma konta lojalnościowego');
    }

    if (loyalty.availablePoints < reward.pointsCost) {
      throw new BadRequestException(`Niewystarczająca liczba punktów. Potrzebujesz ${reward.pointsCost}, masz ${loyalty.availablePoints}`);
    }

    // Odejmij punkty
    await this.prisma.customer_loyalty.update({
      where: { id: loyalty.id },
      data: {
        availablePoints: { decrement: reward.pointsCost },
      },
    });

    // Zapisz transakcję
    await this.prisma.loyalty_transactions.create({
      data: {
        customerLoyaltyId: loyalty.id,
        points: -reward.pointsCost,
        type: 'REDEEMED',
        description: `Wymiana na: ${reward.name}`,
      },
    });

    // Utwórz rekord wymiany
    const redemption = await this.prisma.loyalty_redemptions.create({
      data: {
        customerId,
        tenantId,
        rewardId,
        pointsUsed: reward.pointsCost,
        status: 'PENDING',
      },
    });

    this.logger.log(`Customer ${customerId} redeemed ${reward.pointsCost} points for "${reward.name}"`);

    return {
      redemption,
      reward,
      newBalance: loyalty.availablePoints - reward.pointsCost,
    };
  }

  /**
   * Pobiera punkty wszystkich klientów
   */
  async getAllCustomerPoints(tenantId: string) {
    const allPoints = await this.prisma.customer_loyalty.findMany({
      where: { tenantId },
      select: {
        customerId: true,
        availablePoints: true,
        totalPoints: true,
      },
    });

    return allPoints;
  }

  /**
   * Pobiera ranking klientów (top 10)
   */
  async getLeaderboard(tenantId: string, limit = 10) {
    const topCustomers = await this.prisma.customer_loyalty.findMany({
      where: { tenantId },
      orderBy: { totalPoints: 'desc' },
      take: limit,
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        level: true,
      },
    });

    return topCustomers.map((c, index) => ({
      rank: index + 1,
      customerId: c.customerId,
      customerName: `${c.customer.firstName} ${c.customer.lastName}`,
      availablePoints: c.availablePoints,
      totalPoints: c.totalPoints,
      level: c.level?.name || 'Brak',
    }));
  }

  /**
   * Pobiera statystyki programu lojalnościowego
   */
  async getStats(tenantId: string) {
    const [
      totalMembers,
      pointsStats,
      activeMembers,
    ] = await Promise.all([
      this.prisma.customer_loyalty.count({ where: { tenantId } }),
      this.prisma.customer_loyalty.aggregate({
        where: { tenantId },
        _sum: { totalPoints: true, availablePoints: true },
      }),
      this.prisma.customer_loyalty.count({
        where: { tenantId, availablePoints: { gt: 0 } },
      }),
    ]);

    const totalIssued = pointsStats._sum.totalPoints || 0;
    const totalAvailable = pointsStats._sum.availablePoints || 0;
    const totalRedeemed = totalIssued - totalAvailable;

    return {
      totalMembers,
      activeMembers,
      totalPointsIssued: totalIssued,
      totalPointsRedeemed: totalRedeemed,
      redemptionRate: totalIssued > 0 ? Math.round((totalRedeemed / totalIssued) * 100) : 0,
    };
  }
}
