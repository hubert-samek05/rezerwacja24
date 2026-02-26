import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';

interface ListingsQuery {
  category?: string;
  subcategory?: string;
  search?: string;
  city?: string;
  page?: number;
  limit?: number;
  sortBy?: 'ranking' | 'rating' | 'newest' | 'popular';
}

interface PublishProfileDto {
  title?: string;
  description?: string;
  shortDesc?: string;
  category: string;
  subcategory?: string;
  tags?: string[];
  coverImage?: string;
  gallery?: string[];
}

@Injectable()
export class MarketplaceService {
  private readonly logger = new Logger(MarketplaceService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Pobiera listę opublikowanych firm z marketplace
   */
  async getPublishedListings(query: ListingsQuery) {
    const { category, subcategory, search, city, page = 1, limit = 20, sortBy = 'ranking' } = query;
    const skip = (page - 1) * limit;

    // Budowanie warunków WHERE
    const where: any = {
      isPublished: true,
      tenants: {
        isActive: true,
        isSuspended: false,
      },
    };

    if (category) {
      where.category = category;
    }

    if (subcategory) {
      where.subcategory = subcategory;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { has: search.toLowerCase() } },
      ];
    }

    if (city) {
      where.tenants = {
        ...where.tenants,
        city: { contains: city, mode: 'insensitive' },
      };
    }

    // Sortowanie - Featured (plan Premium) zawsze na górze
    let secondaryOrderBy: any = { rankingScore: 'desc' };
    switch (sortBy) {
      case 'rating':
        secondaryOrderBy = { averageRating: 'desc' };
        break;
      case 'newest':
        secondaryOrderBy = { publishedAt: 'desc' };
        break;
      case 'popular':
        secondaryOrderBy = { viewCount: 'desc' };
        break;
      case 'ranking':
      default:
        secondaryOrderBy = { rankingScore: 'desc' };
    }

    const [listings, total] = await Promise.all([
      this.prisma.marketplace_listings.findMany({
        where,
        orderBy: [
          { isFeatured: 'desc' },  // Featured (Premium) zawsze na górze
          secondaryOrderBy,        // Potem wg wybranego kryterium
        ],
        skip,
        take: limit,
        include: {
          tenants: {
            select: {
              id: true,
              name: true,
              subdomain: true,
              logo: true,
              banner: true,
              city: true,
              address: true,
            },
          },
        },
      }),
      this.prisma.marketplace_listings.count({ where }),
    ]);

    return {
      listings: listings.map((listing) => ({
        id: listing.id,
        title: listing.title,
        slug: listing.slug,
        shortDesc: listing.shortDesc,
        coverImage: listing.coverImage,
        category: listing.category,
        subcategory: listing.subcategory,
        tags: listing.tags,
        averageRating: listing.averageRating,
        reviewCount: listing.reviewCount,
        bookingCount: listing.bookingCount,
        isFeatured: listing.isFeatured,
        tenants: listing.tenants,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Pobiera szczegóły pojedynczego profilu (i zwiększa licznik wyświetleń)
   */
  async getListingBySlug(slug: string) {
    const listing = await this.prisma.marketplace_listings.findUnique({
      where: { slug },
      include: {
        tenants: {
          select: {
            id: true,
            name: true,
            subdomain: true,
            logo: true,
            banner: true,
            city: true,
            address: true,
            phone: true,
            email: true,
            description: true,
            openingHours: true,
            socialMedia: true,
          },
        },
        reviews: {
          where: { isApproved: true },
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            authorName: true,
            rating: true,
            title: true,
            comment: true,
            isVerified: true,
            createdAt: true,
          },
        },
      },
    });

    if (!listing || !listing.isPublished) {
      throw new NotFoundException('Profil nie został znaleziony');
    }

    // Zwiększ licznik wyświetleń (w tle)
    this.prisma.marketplace_listings
      .update({
        where: { id: listing.id },
        data: { viewCount: { increment: 1 } },
      })
      .catch((err) => this.logger.error('Błąd zwiększania viewCount:', err));

    return {
      ...listing,
      subdomain: listing.tenants.subdomain,
    };
  }

  /**
   * Śledzi wyświetlenie strony firmy (subdomena)
   */
  async trackView(tenantId: string) {
    if (!tenantId) {
      return { success: false, message: 'Missing tenantId' };
    }

    try {
      const result = await this.prisma.marketplace_listings.updateMany({
        where: { tenantId, isPublished: true },
        data: { viewCount: { increment: 1 } },
      });

      if (result.count > 0) {
        this.logger.debug(`Tracked view for tenant ${tenantId}`);
        return { success: true };
      } else {
        return { success: false, message: 'Listing not found or not published' };
      }
    } catch (err) {
      this.logger.error(`Error tracking view for ${tenantId}:`, err);
      return { success: false, message: 'Error tracking view' };
    }
  }

  /**
   * Pobiera profil marketplace dla danego tenanta (do edycji w dashboardzie)
   */
  async getListingByTenantId(tenantId: string) {
    const listing = await this.prisma.marketplace_listings.findUnique({
      where: { tenantId },
    });

    if (!listing) {
      // Zwróć pusty profil jeśli nie istnieje
      return {
        exists: false,
        isPublished: false,
        title: '',
        description: '',
        shortDesc: '',
        category: '',
        tags: [],
        coverImage: null,
        gallery: [],
      };
    }

    return {
      exists: true,
      ...listing,
    };
  }

  /**
   * Publikuje lub aktualizuje profil firmy w marketplace
   */
  async publishProfile(tenantId: string, data: PublishProfileDto) {
    this.logger.debug(`publishProfile called with tenantId: ${tenantId}`);
    
    // Sprawdź czy tenant istnieje
    const tenant = await this.prisma.tenants.findUnique({
      where: { id: tenantId },
      select: { id: true, name: true, subdomain: true, isActive: true },
    });

    this.logger.debug(`Found tenant: ${JSON.stringify(tenant)}`);

    if (!tenant) {
      this.logger.error(`Tenant not found for id: ${tenantId}`);
      throw new NotFoundException('Firma nie została znaleziona');
    }

    if (!tenant.isActive) {
      throw new BadRequestException('Konto firmy jest nieaktywne');
    }

    // Generuj slug z nazwy firmy
    const baseSlug = this.generateSlug(data.title || tenant.name);
    const slug = await this.ensureUniqueSlug(baseSlug, tenantId);

    const existingListing = await this.prisma.marketplace_listings.findUnique({
      where: { tenantId },
    });

    if (existingListing) {
      // Aktualizuj istniejący profil
      return this.prisma.marketplace_listings.update({
        where: { tenantId },
        data: {
          title: data.title || tenant.name,
          description: data.description || '',
          shortDesc: data.shortDesc,
          category: data.category,
          subcategory: data.subcategory,
          tags: data.tags || [],
          coverImage: data.coverImage,
          gallery: data.gallery || [],
          isPublished: true,
          publishedAt: existingListing.isPublished ? existingListing.publishedAt : new Date(),
          updatedAt: new Date(),
        },
      });
    } else {
      // Utwórz nowy profil
      return this.prisma.marketplace_listings.create({
        data: {
          id: uuidv4(),
          tenantId,
          title: data.title || tenant.name,
          slug,
          description: data.description || '',
          shortDesc: data.shortDesc,
          category: data.category,
          subcategory: data.subcategory,
          tags: data.tags || [],
          coverImage: data.coverImage,
          gallery: data.gallery || [],
          isPublished: true,
          publishedAt: new Date(),
          updatedAt: new Date(),
        },
      });
    }
  }

  /**
   * Ukrywa profil firmy z marketplace (nie usuwa danych)
   */
  async unpublishProfile(tenantId: string) {
    const listing = await this.prisma.marketplace_listings.findUnique({
      where: { tenantId },
    });

    if (!listing) {
      throw new NotFoundException('Profil nie istnieje');
    }

    return this.prisma.marketplace_listings.update({
      where: { tenantId },
      data: {
        isPublished: false,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Pobiera dostępne kategorie z liczbą firm
   */
  async getCategories() {
    const categories = await this.prisma.marketplace_listings.groupBy({
      by: ['category'],
      where: { isPublished: true },
      _count: { category: true },
      orderBy: { _count: { category: 'desc' } },
    });

    return categories.map((c) => ({
      name: c.category,
      count: c._count.category,
    }));
  }

  /**
   * Pobiera wyróżnione firmy (premium lub featured)
   */
  async getFeaturedListings(limit = 6) {
    const listings = await this.prisma.marketplace_listings.findMany({
      where: {
        isPublished: true,
        OR: [{ isFeatured: true }, { isPremium: true }],
        tenants: {
          isActive: true,
          isSuspended: false,
        },
      },
      orderBy: [{ isPremium: 'desc' }, { rankingScore: 'desc' }],
      take: limit,
      include: {
        tenants: {
          select: {
            id: true,
            name: true,
            subdomain: true,
            logo: true,
            banner: true,
            city: true,
          },
        },
      },
    });

    return listings.map((listing) => ({
      id: listing.id,
      title: listing.title,
      slug: listing.slug,
      shortDesc: listing.shortDesc,
      coverImage: listing.coverImage,
      category: listing.category,
      subcategory: listing.subcategory,
      tags: listing.tags,
      averageRating: listing.averageRating,
      reviewCount: listing.reviewCount,
      bookingCount: listing.bookingCount,
      isPremium: listing.isPremium,
      tenants: listing.tenants,
    }));
  }

  // === Pomocnicze metody ===

  /**
   * Wyszukiwanie dostępnych terminów w marketplace
   * Szuka firm z danej kategorii które mają wolne terminy w podanym dniu/godzinie
   */
  async searchAvailableSlots(query: {
    category?: string;
    subcategory?: string;
    city?: string;
    date: string; // YYYY-MM-DD
    timeFrom?: string; // HH:MM
    timeTo?: string; // HH:MM
    page?: number;
    limit?: number;
  }) {
    const { category, subcategory, city, date, timeFrom, timeTo, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    this.logger.log(`🔍 Searching available slots: category=${category}, subcategory=${subcategory}, city=${city}, date=${date}, time=${timeFrom}-${timeTo}`);

    // 1. Znajdź firmy z marketplace pasujące do kryteriów
    const where: any = {
      isPublished: true,
      tenants: {
        isActive: true,
        isSuspended: false,
      },
    };

    if (category) where.category = category;
    if (subcategory) where.subcategory = subcategory;
    if (city) {
      where.tenants.city = { contains: city, mode: 'insensitive' };
    }

    const listings = await this.prisma.marketplace_listings.findMany({
      where,
      include: {
        tenants: {
          select: {
            id: true,
            name: true,
            subdomain: true,
            logo: true,
            banner: true,
            city: true,
            address: true,
            openingHours: true,
          },
        },
      },
      take: 100, // Pobierz więcej, potem filtrujemy po dostępności
    });

    this.logger.log(`Found ${listings.length} listings matching criteria`);

    // 2. Dla każdej firmy sprawdź dostępność
    const resultsWithSlots: any[] = [];
    const requestedDate = new Date(date);
    const dayOfWeek = this.getDayOfWeekName(requestedDate);

    for (const listing of listings) {
      const tenantId = listing.tenantId;

      // Pobierz usługi tej firmy z kategorii/podkategorii
      const services = await this.prisma.services.findMany({
        where: {
          tenantId,
          isActive: true,
        },
        include: {
          service_employees: {
            include: {
              employees: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
        take: 10, // Limit usług na firmę
      });

      if (services.length === 0) continue;

      // Sprawdź dostępność dla pierwszej usługi (reprezentatywna)
      const availableSlots = await this.getAvailableSlotsForTenant(
        tenantId,
        services,
        date,
        timeFrom,
        timeTo,
        listing.tenants.openingHours
      );

      if (availableSlots.length > 0) {
        resultsWithSlots.push({
          listing: {
            id: listing.id,
            title: listing.title,
            slug: listing.slug,
            shortDesc: listing.shortDesc,
            coverImage: listing.coverImage,
            category: listing.category,
            subcategory: listing.subcategory,
            averageRating: listing.averageRating,
            reviewCount: listing.reviewCount,
          },
          tenant: listing.tenants,
          availableSlots: availableSlots.slice(0, 6), // Max 6 slotów na firmę
          servicesCount: services.length,
        });
      }
    }

    // Sortuj po liczbie dostępnych slotów
    resultsWithSlots.sort((a, b) => b.availableSlots.length - a.availableSlots.length);

    // Paginacja
    const paginatedResults = resultsWithSlots.slice(skip, skip + limit);

    return {
      results: paginatedResults,
      pagination: {
        page,
        limit,
        total: resultsWithSlots.length,
        totalPages: Math.ceil(resultsWithSlots.length / limit),
      },
      searchParams: { category, subcategory, city, date, timeFrom, timeTo },
    };
  }

  /**
   * Pobiera dostępne sloty dla danego tenanta
   */
  private async getAvailableSlotsForTenant(
    tenantId: string,
    services: any[],
    date: string,
    timeFrom?: string,
    timeTo?: string,
    openingHours?: any
  ): Promise<{ time: string; serviceId: string; serviceName: string; employeeId?: string; employeeName?: string }[]> {
    const slots: any[] = [];
    const requestedDate = new Date(date);
    const dayOfWeek = this.getDayOfWeekName(requestedDate);

    // Parsuj godziny otwarcia
    let hours = openingHours;
    if (typeof hours === 'string') {
      try { hours = JSON.parse(hours); } catch { hours = null; }
    }

    const dayKey = dayOfWeek.toLowerCase();
    const dayConfig = hours?.[dayKey] || { open: '09:00', close: '17:00', closed: false };

    if (dayConfig.closed) return [];

    const openTime = timeFrom || dayConfig.open || '09:00';
    const closeTime = timeTo || dayConfig.close || '17:00';

    // Pobierz istniejące rezerwacje dla tego dnia
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const existingBookings = await this.prisma.bookings.findMany({
      where: {
        services: { tenantId },
        startTime: { gte: startOfDay, lte: endOfDay },
        status: { notIn: ['CANCELLED', 'NO_SHOW'] },
      },
      select: {
        startTime: true,
        endTime: true,
        employeeId: true,
        serviceId: true,
      },
    });

    // Dla każdej usługi generuj sloty
    for (const service of services.slice(0, 3)) { // Max 3 usługi
      const duration = service.duration || 60;
      const interval = 30; // 30 min interwały

      // Generuj sloty
      const [openH, openM] = openTime.split(':').map(Number);
      const [closeH, closeM] = closeTime.split(':').map(Number);

      let currentMinutes = openH * 60 + openM;
      const endMinutes = closeH * 60 + closeM - duration;

      while (currentMinutes <= endMinutes) {
        const hours = Math.floor(currentMinutes / 60);
        const mins = currentMinutes % 60;
        const timeStr = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;

        // Sprawdź czy slot jest wolny
        const slotStart = new Date(date);
        slotStart.setHours(hours, mins, 0, 0);
        const slotEnd = new Date(slotStart);
        slotEnd.setMinutes(slotEnd.getMinutes() + duration);

        // Sprawdź konflikty z istniejącymi rezerwacjami
        const hasConflict = existingBookings.some(booking => {
          const bookingStart = new Date(booking.startTime);
          const bookingEnd = new Date(booking.endTime);
          return slotStart < bookingEnd && slotEnd > bookingStart;
        });

        if (!hasConflict) {
          // Znajdź dostępnego pracownika
          let employeeInfo: { id?: string; name?: string } = {};
          
          if (service.service_employees?.length > 0) {
            for (const se of service.service_employees) {
              const empBookings = existingBookings.filter(b => b.employeeId === se.employeeId);
              const empHasConflict = empBookings.some(booking => {
                const bookingStart = new Date(booking.startTime);
                const bookingEnd = new Date(booking.endTime);
                return slotStart < bookingEnd && slotEnd > bookingStart;
              });
              
              if (!empHasConflict && se.employees) {
                employeeInfo = {
                  id: se.employeeId,
                  name: `${se.employees.firstName} ${se.employees.lastName}`.trim(),
                };
                break;
              }
            }
          }

          slots.push({
            time: timeStr,
            serviceId: service.id,
            serviceName: service.name,
            duration,
            price: service.basePrice,
            employeeId: employeeInfo.id,
            employeeName: employeeInfo.name,
          });
        }

        currentMinutes += interval;
      }
    }

    // Usuń duplikaty czasów i posortuj
    const uniqueSlots = slots.reduce((acc, slot) => {
      if (!acc.find((s: any) => s.time === slot.time)) {
        acc.push(slot);
      }
      return acc;
    }, []);

    return uniqueSlots.sort((a: any, b: any) => a.time.localeCompare(b.time));
  }

  private getDayOfWeekName(date: Date): string {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[date.getDay()];
  }

  private generateSlug(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Usuń akcenty
      .replace(/ł/g, 'l')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 50);
  }

  private async ensureUniqueSlug(baseSlug: string, tenantId: string): Promise<string> {
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await this.prisma.marketplace_listings.findUnique({
        where: { slug },
        select: { tenantId: true },
      });

      if (!existing || existing.tenantId === tenantId) {
        return slug;
      }

      slug = `${baseSlug}-${counter}`;
      counter++;

      if (counter > 100) {
        slug = `${baseSlug}-${uuidv4().substring(0, 8)}`;
        return slug;
      }
    }
  }
}
