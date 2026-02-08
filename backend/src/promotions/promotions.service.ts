import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';

@Injectable()
export class PromotionsService {
  constructor(private prisma: PrismaService) {}

  async createCoupon(tenantId: string, createCouponDto: CreateCouponDto) {
    // Sprawdź czy kod już istnieje dla tego tenanta
    const existingCoupon = await this.prisma.coupons.findFirst({
      where: { 
        tenantId,
        code: createCouponDto.code.toUpperCase() 
      },
    });

    if (existingCoupon) {
      throw new ConflictException('Kod rabatowy o tej nazwie już istnieje');
    }

    // Walidacja dla procentowych rabatów
    if (createCouponDto.discountType === 'PERCENTAGE' && createCouponDto.discountValue > 100) {
      throw new BadRequestException('Rabat procentowy nie może przekraczać 100%');
    }

    const coupon = await this.prisma.coupons.create({
      data: {
        id: `cpn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        tenantId,
        code: createCouponDto.code.toUpperCase(),
        description: createCouponDto.description,
        discountType: createCouponDto.discountType,
        discountValue: createCouponDto.discountValue,
        minPurchase: createCouponDto.minPurchase,
        maxDiscount: createCouponDto.maxDiscount,
        usageLimit: createCouponDto.usageLimit,
        usageCount: 0,
        validFrom: new Date(createCouponDto.validFrom),
        validUntil: createCouponDto.validUntil ? new Date(createCouponDto.validUntil) : null,
        isActive: createCouponDto.isActive ?? true,
        updatedAt: new Date(),
      },
    });

    return coupon;
  }

  async findAllCoupons(tenantId: string) {
    const coupons = await this.prisma.coupons.findMany({
      where: { tenantId },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return coupons;
  }

  async findOneCoupon(tenantId: string, id: string) {
    const coupon = await this.prisma.coupons.findFirst({
      where: { id, tenantId },
    });

    if (!coupon) {
      throw new NotFoundException('Kod rabatowy nie został znaleziony');
    }

    return coupon;
  }

  async updateCoupon(tenantId: string, id: string, updateCouponDto: UpdateCouponDto) {
    // Sprawdź czy kupon istnieje dla tego tenanta
    const existingCoupon = await this.prisma.coupons.findFirst({
      where: { id, tenantId },
    });

    if (!existingCoupon) {
      throw new NotFoundException('Kod rabatowy nie został znaleziony');
    }

    // Jeśli zmienia się kod, sprawdź czy nowy kod nie jest zajęty dla tego tenanta
    if (updateCouponDto.code && updateCouponDto.code.toUpperCase() !== existingCoupon.code) {
      const codeExists = await this.prisma.coupons.findFirst({
        where: { tenantId, code: updateCouponDto.code.toUpperCase() },
      });

      if (codeExists) {
        throw new ConflictException('Kod rabatowy o tej nazwie już istnieje');
      }
    }

    // Walidacja dla procentowych rabatów
    if (updateCouponDto.discountType === 'PERCENTAGE' && updateCouponDto.discountValue && updateCouponDto.discountValue > 100) {
      throw new BadRequestException('Rabat procentowy nie może przekraczać 100%');
    }

    const coupon = await this.prisma.coupons.update({
      where: { id },
      data: {
        ...(updateCouponDto.code && { code: updateCouponDto.code.toUpperCase() }),
        ...(updateCouponDto.description !== undefined && { description: updateCouponDto.description }),
        ...(updateCouponDto.discountType && { discountType: updateCouponDto.discountType }),
        ...(updateCouponDto.discountValue !== undefined && { discountValue: updateCouponDto.discountValue }),
        ...(updateCouponDto.minPurchase !== undefined && { minPurchase: updateCouponDto.minPurchase }),
        ...(updateCouponDto.maxDiscount !== undefined && { maxDiscount: updateCouponDto.maxDiscount }),
        ...(updateCouponDto.usageLimit !== undefined && { usageLimit: updateCouponDto.usageLimit }),
        ...(updateCouponDto.validFrom && { validFrom: new Date(updateCouponDto.validFrom) }),
        ...(updateCouponDto.validUntil !== undefined && { validUntil: updateCouponDto.validUntil ? new Date(updateCouponDto.validUntil) : null }),
        ...(updateCouponDto.isActive !== undefined && { isActive: updateCouponDto.isActive }),
        updatedAt: new Date(),
      },
    });

    return coupon;
  }

  async removeCoupon(tenantId: string, id: string) {
    const coupon = await this.prisma.coupons.findFirst({
      where: { id, tenantId },
    });

    if (!coupon) {
      throw new NotFoundException('Kod rabatowy nie został znaleziony');
    }

    await this.prisma.coupons.delete({
      where: { id },
    });

    return { message: 'Kod rabatowy został usunięty' };
  }

  async validateCoupon(tenantId: string, code: string, orderTotal?: number) {
    const coupon = await this.prisma.coupons.findFirst({
      where: { tenantId, code: code.toUpperCase() },
    });

    if (!coupon) {
      return { valid: false, message: 'Kod rabatowy nie istnieje' };
    }

    if (!coupon.isActive) {
      return { valid: false, message: 'Kod rabatowy jest nieaktywny' };
    }

    const now = new Date();
    if (coupon.validFrom > now) {
      return { valid: false, message: 'Kod rabatowy jeszcze nie obowiązuje' };
    }

    if (coupon.validUntil && coupon.validUntil < now) {
      return { valid: false, message: 'Kod rabatowy wygasł' };
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return { valid: false, message: 'Limit użyć kodu został wyczerpany' };
    }

    const total = orderTotal || 0;
    if (total > 0 && coupon.minPurchase && total < Number(coupon.minPurchase)) {
      return { 
        valid: false, 
        message: `Minimalna wartość zamówienia to ${coupon.minPurchase} zł` 
      };
    }

    // Oblicz rabat
    let discountAmount: number;
    if (coupon.discountType === 'PERCENTAGE') {
      discountAmount = (total * Number(coupon.discountValue)) / 100;
      // Zastosuj maksymalny rabat jeśli ustawiony
      if (coupon.maxDiscount && discountAmount > Number(coupon.maxDiscount)) {
        discountAmount = Number(coupon.maxDiscount);
      }
    } else {
      discountAmount = Number(coupon.discountValue);
    }

    // Rabat nie może być większy niż wartość zamówienia
    if (discountAmount > total) {
      discountAmount = total;
    }

    const finalPrice = total - discountAmount;

    return { 
      valid: true, 
      coupon,
      discountType: coupon.discountType === 'PERCENTAGE' ? 'percentage' : 'fixed',
      discountValue: Number(coupon.discountValue),
      discountAmount,
      finalPrice,
    };
  }

  async applyCoupon(tenantId: string, code: string, orderTotal: number) {
    const validation = await this.validateCoupon(tenantId, code, orderTotal);
    
    if (!validation.valid) {
      throw new BadRequestException(validation.message);
    }

    const coupon = validation.coupon!;
    let discount: number;

    if (coupon.discountType === 'PERCENTAGE') {
      discount = (orderTotal * Number(coupon.discountValue)) / 100;
      
      // Zastosuj maksymalny rabat jeśli ustawiony
      if (coupon.maxDiscount && discount > Number(coupon.maxDiscount)) {
        discount = Number(coupon.maxDiscount);
      }
    } else {
      discount = Number(coupon.discountValue);
    }

    // Rabat nie może być większy niż wartość zamówienia
    if (discount > orderTotal) {
      discount = orderTotal;
    }

    // Zwiększ licznik użyć
    await this.prisma.coupons.update({
      where: { id: coupon.id },
      data: {
        usageCount: coupon.usageCount + 1,
        updatedAt: new Date(),
      },
    });

    return {
      coupon,
      originalTotal: orderTotal,
      discount,
      finalTotal: orderTotal - discount,
    };
  }
}
