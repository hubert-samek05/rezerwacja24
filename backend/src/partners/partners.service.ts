import { Injectable, BadRequestException, NotFoundException, UnauthorizedException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { 
  RegisterPartnerDto, 
  LoginPartnerDto, 
  UpdatePartnerDto, 
  RequestPayoutDto,
  ApprovePartnerDto 
} from './dto/partner.dto';

@Injectable()
export class PartnersService {
  constructor(private prisma: PrismaService) {}

  // ==========================================
  // REJESTRACJA I LOGOWANIE PARTNERA
  // ==========================================

  async register(dto: RegisterPartnerDto) {
    // Sprawdź czy email już istnieje
    const existing = await this.prisma.partners.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('Partner z tym adresem email już istnieje');
    }

    // Generuj unikalny kod polecający
    const referralCode = await this.generateUniqueReferralCode(dto.companyName);

    // Hashuj hasło
    const passwordHash = await bcrypt.hash(dto.password, 10);

    const partner = await this.prisma.partners.create({
      data: {
        companyName: dto.companyName,
        contactName: dto.contactName,
        email: dto.email,
        phone: dto.phone,
        passwordHash,
        referralCode,
        taxId: dto.taxId,
        status: 'PENDING',
      },
    });

    return {
      id: partner.id,
      email: partner.email,
      referralCode: partner.referralCode,
      status: partner.status,
      message: 'Rejestracja zakończona. Oczekuj na zatwierdzenie przez administratora.',
    };
  }

  async login(dto: LoginPartnerDto) {
    const partner = await this.prisma.partners.findUnique({
      where: { email: dto.email },
    });

    if (!partner) {
      throw new UnauthorizedException('Nieprawidłowy email lub hasło');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, partner.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Nieprawidłowy email lub hasło');
    }

    if (partner.status !== 'ACTIVE') {
      throw new UnauthorizedException(`Konto partnera jest ${partner.status === 'PENDING' ? 'w trakcie weryfikacji' : 'nieaktywne'}`);
    }

    // Aktualizuj ostatnie logowanie
    await this.prisma.partners.update({
      where: { id: partner.id },
      data: { lastLoginAt: new Date() },
    });

    return {
      id: partner.id,
      email: partner.email,
      companyName: partner.companyName,
      referralCode: partner.referralCode,
    };
  }

  // ==========================================
  // PANEL PARTNERA
  // ==========================================

  async getPartnerDashboard(partnerId: string) {
    const partner = await this.prisma.partners.findUnique({
      where: { id: partnerId },
      include: {
        conversions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!partner) {
      throw new NotFoundException('Partner nie znaleziony');
    }

    const baseUrl = process.env.FRONTEND_URL || 'https://rezerwacja24.pl';
    const referralLink = `${baseUrl}/ref/${partner.referralCode}`;

    const conversionRate = partner.totalClicks > 0 
      ? ((partner.totalRegistrations / partner.totalClicks) * 100).toFixed(2)
      : '0.00';

    return {
      partner: {
        id: partner.id,
        companyName: partner.companyName,
        contactName: partner.contactName,
        email: partner.email,
        referralCode: partner.referralCode,
        bankAccount: partner.bankAccount,
        status: partner.status,
      },
      stats: {
        totalClicks: partner.totalClicks,
        totalRegistrations: partner.totalRegistrations,
        totalPaidCustomers: partner.totalPaidCustomers,
        totalEarnings: Number(partner.totalEarnings),
        pendingPayout: Number(partner.pendingPayout),
        conversionRate: parseFloat(conversionRate),
      },
      referralLink,
      commissionInfo: {
        oneTime: Number(partner.oneTimeCommission),
        recurring: Number(partner.recurringCommission),
        recurringMonths: partner.recurringMonths,
        referralDiscount: Number(partner.referralDiscount),
        discountMonths: partner.discountMonths,
      },
      recentConversions: partner.conversions,
    };
  }

  async getPartnerConversions(partnerId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [conversions, total] = await Promise.all([
      this.prisma.partner_conversions.findMany({
        where: { partnerId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.partner_conversions.count({ where: { partnerId } }),
    ]);

    // Pobierz nazwy tenantów
    const tenantIds = conversions.map(c => c.tenantId);
    const tenants = await this.prisma.tenants.findMany({
      where: { id: { in: tenantIds } },
      select: { id: true, name: true },
    });
    const tenantMap = new Map(tenants.map(t => [t.id, t.name]));

    return {
      data: conversions.map(c => ({
        id: c.id,
        tenantName: tenantMap.get(c.tenantId) || 'Nieznany',
        status: c.status,
        registeredAt: c.registeredAt,
        firstPaymentAt: c.firstPaymentAt,
        oneTimeAmount: c.oneTimeAmount ? Number(c.oneTimeAmount) : null,
        totalRecurringPaid: Number(c.totalRecurringPaid),
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getPartnerCommissions(partnerId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [commissions, total] = await Promise.all([
      this.prisma.partner_commissions.findMany({
        where: { partnerId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          conversion: true,
        },
      }),
      this.prisma.partner_commissions.count({ where: { partnerId } }),
    ]);

    return {
      data: commissions.map(c => ({
        id: c.id,
        type: c.type,
        amount: Number(c.amount),
        month: c.month,
        status: c.status,
        createdAt: c.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getPartnerPayouts(partnerId: string) {
    const payouts = await this.prisma.partner_payouts.findMany({
      where: { partnerId },
      orderBy: { createdAt: 'desc' },
    });

    return payouts.map(p => ({
      id: p.id,
      amount: Number(p.amount),
      status: p.status,
      requestedAt: p.requestedAt,
      processedAt: p.processedAt,
      bankAccount: p.bankAccount,
    }));
  }

  async updatePartner(partnerId: string, dto: UpdatePartnerDto) {
    const partner = await this.prisma.partners.update({
      where: { id: partnerId },
      data: {
        companyName: dto.companyName,
        contactName: dto.contactName,
        phone: dto.phone,
        bankAccount: dto.bankAccount,
        bankName: dto.bankName,
        taxId: dto.taxId,
      },
    });

    return {
      id: partner.id,
      companyName: partner.companyName,
      contactName: partner.contactName,
      email: partner.email,
      phone: partner.phone,
      bankAccount: partner.bankAccount,
      bankName: partner.bankName,
      taxId: partner.taxId,
    };
  }

  // ==========================================
  // WYPŁATY
  // ==========================================

  async requestPayout(partnerId: string, dto: RequestPayoutDto) {
    const partner = await this.prisma.partners.findUnique({
      where: { id: partnerId },
    });

    if (!partner) {
      throw new NotFoundException('Partner nie znaleziony');
    }

    if (Number(partner.pendingPayout) < dto.amount) {
      throw new BadRequestException(`Niewystarczające środki. Dostępne: ${partner.pendingPayout} zł`);
    }

    if (dto.amount < 100) {
      throw new BadRequestException('Minimalna kwota wypłaty to 100 zł');
    }

    // Utwórz żądanie wypłaty
    const payout = await this.prisma.partner_payouts.create({
      data: {
        partnerId,
        amount: dto.amount,
        bankAccount: dto.bankAccount,
        bankName: dto.bankName,
        status: 'PENDING',
      },
    });

    // Zmniejsz pending payout
    await this.prisma.partners.update({
      where: { id: partnerId },
      data: {
        pendingPayout: { decrement: dto.amount },
      },
    });

    // Oznacz prowizje jako w trakcie wypłaty
    await this.prisma.partner_commissions.updateMany({
      where: {
        partnerId,
        status: 'APPROVED',
      },
      data: {
        paidInPayoutId: payout.id,
        status: 'PAID',
      },
    });

    return {
      id: payout.id,
      amount: dto.amount,
      status: 'PENDING',
      message: 'Żądanie wypłaty zostało złożone. Przelew zostanie zrealizowany w ciągu 7 dni roboczych.',
    };
  }

  // ==========================================
  // ŚLEDZENIE KLIKNIĘĆ I KONWERSJI
  // ==========================================

  async trackClick(referralCode: string, ipAddress?: string, userAgent?: string, referer?: string, landingPage?: string) {
    const partner = await this.prisma.partners.findUnique({
      where: { referralCode },
    });

    if (!partner || partner.status !== 'ACTIVE') {
      return null;
    }

    // Zapisz kliknięcie
    await this.prisma.partner_clicks.create({
      data: {
        partnerId: partner.id,
        ipAddress,
        userAgent,
        referer,
        landingPage,
      },
    });

    // Zwiększ licznik kliknięć
    await this.prisma.partners.update({
      where: { id: partner.id },
      data: { totalClicks: { increment: 1 } },
    });

    return {
      partnerId: partner.id,
      referralCode: partner.referralCode,
      discount: Number(partner.referralDiscount),
      discountMonths: partner.discountMonths,
    };
  }

  async trackConversion(referralCode: string, tenantId: string) {
    const partner = await this.prisma.partners.findUnique({
      where: { referralCode },
    });

    if (!partner || partner.status !== 'ACTIVE') {
      return null;
    }

    // Sprawdź czy konwersja już istnieje
    const existingConversion = await this.prisma.partner_conversions.findUnique({
      where: { tenantId },
    });

    if (existingConversion) {
      return existingConversion;
    }

    // Utwórz konwersję
    const conversion = await this.prisma.partner_conversions.create({
      data: {
        partnerId: partner.id,
        tenantId,
        status: 'REGISTERED',
      },
    });

    // Zwiększ licznik rejestracji
    await this.prisma.partners.update({
      where: { id: partner.id },
      data: { totalRegistrations: { increment: 1 } },
    });

    // Ustaw rabat dla tenanta
    const discountEndsAt = new Date();
    discountEndsAt.setMonth(discountEndsAt.getMonth() + partner.discountMonths);

    await this.prisma.tenants.update({
      where: { id: tenantId },
      data: {
        referredByPartnerId: partner.id,
        referralDiscountPercent: partner.referralDiscount,
        referralDiscountEndsAt: discountEndsAt,
      },
    });

    return conversion;
  }

  async processPayment(tenantId: string, paymentAmount: number, paymentId: string, invoiceId?: string) {
    // Znajdź konwersję dla tego tenanta
    const conversion = await this.prisma.partner_conversions.findUnique({
      where: { tenantId },
      include: { partner: true },
    });

    if (!conversion) {
      return null; // Tenant nie był polecony przez partnera
    }

    const partner = conversion.partner;
    const commissions: any[] = [];

    // Jednorazowa prowizja (jeśli jeszcze nie wypłacona)
    if (!conversion.oneTimePaid) {
      const oneTimeAmount = Number(partner.oneTimeCommission);
      
      const oneTimeCommission = await this.prisma.partner_commissions.create({
        data: {
          conversionId: conversion.id,
          partnerId: partner.id,
          type: 'ONE_TIME',
          amount: oneTimeAmount,
          paymentId,
          invoiceId,
          status: 'PENDING',
        },
      });

      commissions.push(oneTimeCommission);

      // Aktualizuj konwersję
      await this.prisma.partner_conversions.update({
        where: { id: conversion.id },
        data: {
          oneTimePaid: true,
          oneTimePaidAt: new Date(),
          oneTimeAmount: oneTimeAmount,
          status: 'PAID',
          firstPaymentAt: new Date(),
        },
      });

      // Aktualizuj statystyki partnera
      await this.prisma.partners.update({
        where: { id: partner.id },
        data: {
          totalPaidCustomers: { increment: 1 },
          totalEarnings: { increment: oneTimeAmount },
          pendingPayout: { increment: oneTimeAmount },
        },
      });
    }

    // Prowizja recurring (jeśli w okresie 12 miesięcy)
    if (conversion.recurringPaidMonths < partner.recurringMonths) {
      const recurringPercent = Number(partner.recurringCommission);
      const recurringAmount = (paymentAmount * recurringPercent) / 100;
      const currentMonth = conversion.recurringPaidMonths + 1;

      const recurringCommission = await this.prisma.partner_commissions.create({
        data: {
          conversionId: conversion.id,
          partnerId: partner.id,
          type: 'RECURRING',
          amount: recurringAmount,
          month: currentMonth,
          paymentId,
          invoiceId,
          status: 'PENDING',
        },
      });

      commissions.push(recurringCommission);

      // Aktualizuj konwersję
      await this.prisma.partner_conversions.update({
        where: { id: conversion.id },
        data: {
          recurringPaidMonths: { increment: 1 },
          totalRecurringPaid: { increment: recurringAmount },
          lastPaymentAt: new Date(),
        },
      });

      // Aktualizuj statystyki partnera
      await this.prisma.partners.update({
        where: { id: partner.id },
        data: {
          totalEarnings: { increment: recurringAmount },
          pendingPayout: { increment: recurringAmount },
        },
      });
    }

    return commissions;
  }

  // ==========================================
  // FUNKCJE ADMINISTRACYJNE
  // ==========================================

  async getAllPartners(status?: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where = status ? { status: status as any } : {};

    const [partners, total] = await Promise.all([
      this.prisma.partners.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          companyName: true,
          contactName: true,
          email: true,
          phone: true,
          referralCode: true,
          status: true,
          totalClicks: true,
          totalRegistrations: true,
          totalPaidCustomers: true,
          totalEarnings: true,
          pendingPayout: true,
          createdAt: true,
        },
      }),
      this.prisma.partners.count({ where }),
    ]);

    return {
      data: partners.map(p => ({
        ...p,
        totalEarnings: Number(p.totalEarnings),
        pendingPayout: Number(p.pendingPayout),
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async approvePartner(partnerId: string, adminId: string, dto?: ApprovePartnerDto) {
    const partner = await this.prisma.partners.findUnique({
      where: { id: partnerId },
    });

    if (!partner) {
      throw new NotFoundException('Partner nie znaleziony');
    }

    const updateData: any = {
      status: 'ACTIVE',
      approvedAt: new Date(),
      approvedBy: adminId,
    };

    if (dto?.oneTimeCommission !== undefined) {
      updateData.oneTimeCommission = dto.oneTimeCommission;
    }
    if (dto?.recurringCommission !== undefined) {
      updateData.recurringCommission = dto.recurringCommission;
    }
    if (dto?.referralDiscount !== undefined) {
      updateData.referralDiscount = dto.referralDiscount;
    }

    const updated = await this.prisma.partners.update({
      where: { id: partnerId },
      data: updateData,
    });

    // TODO: Wyślij email do partnera o zatwierdzeniu

    return {
      id: updated.id,
      status: updated.status,
      message: 'Partner został zatwierdzony',
    };
  }

  async rejectPartner(partnerId: string, adminId: string, reason?: string) {
    const partner = await this.prisma.partners.update({
      where: { id: partnerId },
      data: {
        status: 'REJECTED',
      },
    });

    // TODO: Wyślij email do partnera o odrzuceniu

    return {
      id: partner.id,
      status: partner.status,
      message: 'Partner został odrzucony',
    };
  }

  async suspendPartner(partnerId: string, adminId: string, reason?: string) {
    const partner = await this.prisma.partners.update({
      where: { id: partnerId },
      data: {
        status: 'SUSPENDED',
      },
    });

    return {
      id: partner.id,
      status: partner.status,
      message: 'Partner został zawieszony',
    };
  }

  async processPayoutAdmin(payoutId: string, adminId: string, transferId?: string, notes?: string) {
    const payout = await this.prisma.partner_payouts.update({
      where: { id: payoutId },
      data: {
        status: 'COMPLETED',
        processedAt: new Date(),
        processedBy: adminId,
        transferId,
        notes,
      },
    });

    return {
      id: payout.id,
      status: payout.status,
      message: 'Wypłata została zrealizowana',
    };
  }

  async getPendingPayouts() {
    const payouts = await this.prisma.partner_payouts.findMany({
      where: { status: 'PENDING' },
      orderBy: { requestedAt: 'asc' },
      include: {
        partner: {
          select: {
            companyName: true,
            email: true,
            taxId: true,
          },
        },
      },
    });

    return payouts.map(p => ({
      id: p.id,
      amount: Number(p.amount),
      bankAccount: p.bankAccount,
      bankName: p.bankName,
      requestedAt: p.requestedAt,
      partner: p.partner,
    }));
  }

  // ==========================================
  // POMOCNICZE
  // ==========================================

  private async generateUniqueReferralCode(companyName: string): Promise<string> {
    // Generuj kod z nazwy firmy
    const baseCode = companyName
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .substring(0, 6);
    
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    let code = `${baseCode}${randomSuffix}`;

    // Sprawdź unikalność
    let exists = await this.prisma.partners.findUnique({
      where: { referralCode: code },
    });

    while (exists) {
      const newSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
      code = `${baseCode}${newSuffix}`;
      exists = await this.prisma.partners.findUnique({
        where: { referralCode: code },
      });
    }

    return code;
  }

  async getPartnerByReferralCode(referralCode: string) {
    return this.prisma.partners.findUnique({
      where: { referralCode },
      select: {
        id: true,
        companyName: true,
        referralCode: true,
        referralDiscount: true,
        discountMonths: true,
        status: true,
      },
    });
  }
}
