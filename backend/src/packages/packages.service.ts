import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class PackagesService {
  private readonly logger = new Logger(PackagesService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Pobiera wszystkie pakiety usług dla tenanta
   */
  async findAll(tenantId: string) {
    return this.prisma.service_packages.findMany({
      where: { tenantId, isActive: true },
      include: {
        items: {
          include: {
            service: true,
          },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Pobiera pojedynczy pakiet
   */
  async findOne(id: string, tenantId: string) {
    const pkg = await this.prisma.service_packages.findFirst({
      where: { id, tenantId },
      include: {
        items: {
          include: {
            service: true,
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!pkg) {
      throw new NotFoundException('Pakiet nie został znaleziony');
    }

    return pkg;
  }

  /**
   * Tworzy nowy pakiet usług
   */
  async create(tenantId: string, data: {
    name: string;
    description?: string;
    price: number;
    serviceIds: string[];
  }) {
    // Pobierz usługi, aby obliczyć oryginalną cenę i czas
    const services = await this.prisma.services.findMany({
      where: { id: { in: data.serviceIds } },
    });

    if (services.length !== data.serviceIds.length) {
      throw new BadRequestException('Niektóre usługi nie istnieją');
    }

    const originalPrice = services.reduce((sum, s) => sum + Number(s.basePrice), 0);
    const duration = services.reduce((sum, s) => sum + s.duration, 0);

    // Utwórz pakiet z elementami
    const pkg = await this.prisma.service_packages.create({
      data: {
        tenantId,
        name: data.name,
        description: data.description,
        price: data.price,
        originalPrice,
        duration,
        items: {
          create: data.serviceIds.map((serviceId, index) => ({
            serviceId,
            order: index,
          })),
        },
      },
      include: {
        items: {
          include: {
            service: true,
          },
        },
      },
    });

    this.logger.log(`Utworzono pakiet "${data.name}" dla tenant ${tenantId}`);
    return pkg;
  }

  /**
   * Aktualizuje pakiet
   */
  async update(id: string, tenantId: string, data: {
    name?: string;
    description?: string;
    price?: number;
    serviceIds?: string[];
    isActive?: boolean;
  }) {
    const existing = await this.findOne(id, tenantId);

    let updateData: any = {
      name: data.name,
      description: data.description,
      price: data.price,
      isActive: data.isActive,
    };

    // Jeśli zmieniono usługi, przelicz cenę i czas
    if (data.serviceIds) {
      const services = await this.prisma.services.findMany({
        where: { id: { in: data.serviceIds } },
      });

      if (services.length !== data.serviceIds.length) {
        throw new BadRequestException('Niektóre usługi nie istnieją');
      }

      updateData.originalPrice = services.reduce((sum, s) => sum + Number(s.basePrice), 0);
      updateData.duration = services.reduce((sum, s) => sum + s.duration, 0);

      // Usuń stare elementy i dodaj nowe
      await this.prisma.package_items.deleteMany({
        where: { packageId: id },
      });

      await this.prisma.package_items.createMany({
        data: data.serviceIds.map((serviceId, index) => ({
          packageId: id,
          serviceId,
          order: index,
        })),
      });
    }

    const pkg = await this.prisma.service_packages.update({
      where: { id },
      data: updateData,
      include: {
        items: {
          include: {
            service: true,
          },
        },
      },
    });

    this.logger.log(`Zaktualizowano pakiet "${pkg.name}" (${id})`);
    return pkg;
  }

  /**
   * Usuwa pakiet (soft delete)
   */
  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);

    await this.prisma.service_packages.update({
      where: { id },
      data: { isActive: false },
    });

    this.logger.log(`Usunięto pakiet ${id}`);
    return { success: true };
  }

  /**
   * Oblicza oszczędność dla pakietu
   */
  calculateSavings(price: number, originalPrice: number) {
    const savings = originalPrice - price;
    const savingsPercent = originalPrice > 0 ? (savings / originalPrice) * 100 : 0;
    return {
      savings,
      savingsPercent: Math.round(savingsPercent),
    };
  }
}
