import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class GroupBookingsService {
  private readonly logger = new Logger(GroupBookingsService.name);

  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  // ==================== TYPY ZAJĘĆ GRUPOWYCH ====================

  /**
   * Pobiera wszystkie typy zajęć grupowych
   */
  async findAllTypes(tenantId: string) {
    return this.prisma.group_booking_types.findMany({
      where: { tenantId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Tworzy nowy typ zajęć grupowych
   */
  async createType(tenantId: string, data: {
    name: string;
    description?: string;
    maxParticipants: number;
    minParticipants?: number;
    pricePerPerson: number;
    duration: number;
    serviceId?: string;
  }) {
    const type = await this.prisma.group_booking_types.create({
      data: {
        tenantId,
        name: data.name,
        description: data.description,
        maxParticipants: data.maxParticipants,
        minParticipants: data.minParticipants || 1,
        pricePerPerson: data.pricePerPerson,
        duration: data.duration,
        serviceId: data.serviceId,
      },
    });

    this.logger.log(`Utworzono typ zajęć grupowych "${data.name}" dla tenant ${tenantId}`);
    return type;
  }

  /**
   * Aktualizuje typ zajęć grupowych
   */
  async updateType(id: string, tenantId: string, data: {
    name?: string;
    description?: string;
    maxParticipants?: number;
    minParticipants?: number;
    pricePerPerson?: number;
    duration?: number;
    isActive?: boolean;
  }) {
    const existing = await this.prisma.group_booking_types.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      throw new NotFoundException('Typ zajęć grupowych nie został znaleziony');
    }

    return this.prisma.group_booking_types.update({
      where: { id },
      data,
    });
  }

  /**
   * Usuwa typ zajęć grupowych
   */
  async deleteType(id: string, tenantId: string) {
    const existing = await this.prisma.group_booking_types.findFirst({
      where: { id, tenantId },
      include: { groupBookings: { where: { status: { in: ['OPEN', 'FULL'] } } } },
    });

    if (!existing) {
      throw new NotFoundException('Typ zajęć grupowych nie został znaleziony');
    }

    if (existing.groupBookings.length > 0) {
      throw new BadRequestException('Nie można usunąć typu z aktywnymi rezerwacjami');
    }

    await this.prisma.group_booking_types.delete({
      where: { id },
    });

    this.logger.log(`Usunięto typ zajęć grupowych ${id}`);
    return { success: true };
  }

  // ==================== REZERWACJE GRUPOWE ====================

  /**
   * Pobiera wszystkie rezerwacje grupowe
   */
  async findAll(tenantId: string, filters?: {
    status?: string;
    from?: Date;
    to?: Date;
  }) {
    const where: any = { tenantId };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.from || filters?.to) {
      where.startTime = {};
      if (filters.from) where.startTime.gte = filters.from;
      if (filters.to) where.startTime.lte = filters.to;
    }

    return this.prisma.group_bookings.findMany({
      where,
      include: {
        type: true,
        employee: true,
        participants: {
          include: { customer: true },
        },
        _count: {
          select: { participants: true, waitlist: true },
        },
      },
      orderBy: { startTime: 'asc' },
    });
  }

  /**
   * Pobiera pojedynczą rezerwację grupową
   */
  async findOne(id: string, tenantId: string) {
    const booking = await this.prisma.group_bookings.findFirst({
      where: { id, tenantId },
      include: {
        type: true,
        employee: true,
        participants: {
          include: { customer: true },
        },
        waitlist: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Rezerwacja grupowa nie została znaleziona');
    }

    return booking;
  }

  /**
   * Tworzy nową rezerwację grupową
   */
  async create(tenantId: string, data: {
    typeId: string;
    title: string;
    description?: string;
    startTime: Date;
    employeeId?: string;
  }) {
    const type = await this.prisma.group_booking_types.findFirst({
      where: { id: data.typeId, tenantId, isActive: true },
    });

    if (!type) {
      throw new NotFoundException('Typ zajęć grupowych nie został znaleziony');
    }

    const endTime = new Date(data.startTime);
    endTime.setMinutes(endTime.getMinutes() + type.duration);

    const booking = await this.prisma.group_bookings.create({
      data: {
        typeId: data.typeId,
        tenantId,
        employeeId: data.employeeId,
        title: data.title,
        description: data.description,
        startTime: data.startTime,
        endTime,
        maxParticipants: type.maxParticipants,
        pricePerPerson: type.pricePerPerson,
        status: 'OPEN',
      },
      include: {
        type: true,
        employee: true,
      },
    });

    this.logger.log(`Utworzono rezerwację grupową "${data.title}" dla tenant ${tenantId}`);
    return booking;
  }

  /**
   * Dodaje uczestnika do rezerwacji grupowej
   */
  async addParticipant(bookingId: string, tenantId: string, data: {
    customerId?: string;
    name: string;
    email?: string;
    phone?: string;
  }) {
    const booking = await this.findOne(bookingId, tenantId);

    if (booking.status === 'CANCELLED') {
      throw new BadRequestException('Rezerwacja została anulowana');
    }

    if (booking.status === 'COMPLETED') {
      throw new BadRequestException('Rezerwacja została zakończona');
    }

    if (booking.currentParticipants >= booking.maxParticipants) {
      // Dodaj do listy oczekujących
      const position = await this.prisma.group_waitlist.count({
        where: { groupBookingId: bookingId },
      });

      const waitlistEntry = await this.prisma.group_waitlist.create({
        data: {
          groupBookingId: bookingId,
          customerId: data.customerId,
          name: data.name,
          email: data.email || '',
          phone: data.phone,
          position: position + 1,
        },
      });

      return { addedToWaitlist: true, position: position + 1, entry: waitlistEntry };
    }

    // Dodaj uczestnika
    const participant = await this.prisma.group_participants.create({
      data: {
        groupBookingId: bookingId,
        customerId: data.customerId,
        name: data.name,
        email: data.email,
        phone: data.phone,
        status: 'CONFIRMED',
      },
    });

    // Zaktualizuj licznik uczestników
    await this.prisma.group_bookings.update({
      where: { id: bookingId },
      data: {
        currentParticipants: { increment: 1 },
        status: booking.currentParticipants + 1 >= booking.maxParticipants ? 'FULL' : 'OPEN',
      },
    });

    this.logger.log(`Dodano uczestnika "${data.name}" do rezerwacji ${bookingId}`);
    return { addedToWaitlist: false, participant };
  }

  /**
   * Usuwa uczestnika z rezerwacji grupowej
   */
  async removeParticipant(bookingId: string, participantId: string, tenantId: string) {
    const booking = await this.findOne(bookingId, tenantId);

    const participant = await this.prisma.group_participants.findFirst({
      where: { id: participantId, groupBookingId: bookingId },
    });

    if (!participant) {
      throw new NotFoundException('Uczestnik nie został znaleziony');
    }

    await this.prisma.group_participants.delete({
      where: { id: participantId },
    });

    // Zaktualizuj licznik
    await this.prisma.group_bookings.update({
      where: { id: bookingId },
      data: {
        currentParticipants: { decrement: 1 },
        status: 'OPEN',
      },
    });

    // Sprawdź czy ktoś czeka na liście
    const nextInLine = await this.prisma.group_waitlist.findFirst({
      where: { groupBookingId: bookingId },
      orderBy: { position: 'asc' },
    });

    this.logger.log(`Usunięto uczestnika ${participantId} z rezerwacji ${bookingId}`);
    return { 
      success: true, 
      nextInWaitlist: nextInLine ? { name: nextInLine.name, email: nextInLine.email } : null 
    };
  }

  /**
   * Anuluje rezerwację grupową
   */
  async cancel(id: string, tenantId: string) {
    await this.findOne(id, tenantId);

    await this.prisma.group_bookings.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    this.logger.log(`Anulowano rezerwację grupową ${id}`);
    return { success: true };
  }

  /**
   * Oznacza rezerwację jako zakończoną
   */
  async complete(id: string, tenantId: string) {
    await this.findOne(id, tenantId);

    await this.prisma.group_bookings.update({
      where: { id },
      data: { status: 'COMPLETED' },
    });

    this.logger.log(`Zakończono rezerwację grupową ${id}`);
    return { success: true };
  }

  /**
   * Pobiera publiczne zajęcia grupowe (dla strony rezerwacji)
   */
  async findPublicBookings(tenantId: string) {
    const now = new Date();
    return this.prisma.group_bookings.findMany({
      where: {
        tenantId,
        status: { in: ['OPEN', 'FULL'] },
        startTime: { gt: now },
        isPublic: true,
      },
      include: {
        type: true,
        employee: {
          select: { firstName: true, lastName: true, avatar: true },
        },
        _count: {
          select: { participants: true },
        },
      },
      orderBy: { startTime: 'asc' },
    });
  }

  // ==================== ZAPIS WIELU OSÓB NARAZ ====================

  /**
   * Dodaje wielu uczestników do rezerwacji grupowej naraz
   */
  async addMultipleParticipants(bookingId: string, tenantId: string, data: {
    participants: Array<{
      name: string;
      email?: string;
      phone?: string;
    }>;
    rodoConsent?: boolean;
    rodoConsentText?: string;
    marketingConsent?: boolean;
    marketingConsentText?: string;
    couponCode?: string;
  }) {
    const booking = await this.findOne(bookingId, tenantId);

    if (booking.status === 'CANCELLED') {
      throw new BadRequestException('Rezerwacja została anulowana');
    }

    if (booking.status === 'COMPLETED') {
      throw new BadRequestException('Rezerwacja została zakończona');
    }

    const availableSpots = booking.maxParticipants - booking.currentParticipants;
    const participantsToAdd = data.participants;
    const addedParticipants: any[] = [];
    const waitlistEntries: any[] = [];

    // Walidacja kuponu jeśli podany
    let couponDiscount = null;
    if (data.couponCode) {
      const coupon = await this.prisma.coupons.findFirst({
        where: {
          tenantId,
          code: data.couponCode.toUpperCase(),
          isActive: true,
          OR: [
            { validUntil: null },
            { validUntil: { gt: new Date() } },
          ],
        },
      });
      if (coupon) {
        couponDiscount = {
          type: coupon.discountType,
          value: Number(coupon.discountValue),
        };
      }
    }

    for (let i = 0; i < participantsToAdd.length; i++) {
      const participant = participantsToAdd[i];

      if (i < availableSpots) {
        // Dodaj jako uczestnika
        const created = await this.prisma.group_participants.create({
          data: {
            groupBookingId: bookingId,
            name: participant.name,
            email: participant.email,
            phone: participant.phone,
            status: 'CONFIRMED',
          },
        });
        addedParticipants.push(created);
      } else {
        // Dodaj do listy oczekujących
        const position = await this.prisma.group_waitlist.count({
          where: { groupBookingId: bookingId },
        });

        const waitlistEntry = await this.prisma.group_waitlist.create({
          data: {
            groupBookingId: bookingId,
            name: participant.name,
            email: participant.email || '',
            phone: participant.phone,
            position: position + 1,
          },
        });
        waitlistEntries.push(waitlistEntry);
      }
    }

    // Zaktualizuj licznik uczestników
    const newParticipantCount = booking.currentParticipants + addedParticipants.length;
    await this.prisma.group_bookings.update({
      where: { id: bookingId },
      data: {
        currentParticipants: newParticipantCount,
        status: newParticipantCount >= booking.maxParticipants ? 'FULL' : 'OPEN',
      },
    });

    // Wyślij powiadomienia email dla każdego uczestnika
    const tenant = await this.prisma.tenants.findUnique({
      where: { id: tenantId },
    });

    for (const participant of addedParticipants) {
      if (participant.email) {
        try {
          await this.notificationsService.sendGroupBookingConfirmation(
            participant.email,
            participant.name,
            booking.title,
            booking.startTime,
            Number(booking.pricePerPerson),
            tenant?.name || 'Rezerwacja24',
            couponDiscount,
          );
        } catch (error) {
          this.logger.error(`Błąd wysyłania powiadomienia do ${participant.email}:`, error);
        }
      }
    }

    this.logger.log(`Dodano ${addedParticipants.length} uczestników do rezerwacji ${bookingId}`);
    
    return {
      addedCount: addedParticipants.length,
      waitlistCount: waitlistEntries.length,
      participants: addedParticipants,
      waitlist: waitlistEntries,
      totalPrice: addedParticipants.length * Number(booking.pricePerPerson),
      couponDiscount,
    };
  }

  // ==================== EDYCJA REZERWACJI GRUPOWEJ ====================

  /**
   * Aktualizuje rezerwację grupową
   */
  async update(id: string, tenantId: string, data: {
    title?: string;
    description?: string;
    startTime?: Date;
    employeeId?: string;
    maxParticipants?: number;
    isPublic?: boolean;
  }) {
    const booking = await this.findOne(id, tenantId);

    if (booking.status === 'CANCELLED' || booking.status === 'COMPLETED') {
      throw new BadRequestException('Nie można edytować zakończonej lub anulowanej rezerwacji');
    }

    const updateData: any = {};

    if (data.title) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.employeeId !== undefined) updateData.employeeId = data.employeeId || null;
    if (data.isPublic !== undefined) updateData.isPublic = data.isPublic;
    if (data.maxParticipants) {
      if (data.maxParticipants < booking.currentParticipants) {
        throw new BadRequestException('Nie można zmniejszyć limitu poniżej aktualnej liczby uczestników');
      }
      updateData.maxParticipants = data.maxParticipants;
      // Aktualizuj status jeśli zmieniono limit
      updateData.status = booking.currentParticipants >= data.maxParticipants ? 'FULL' : 'OPEN';
    }

    if (data.startTime) {
      updateData.startTime = data.startTime;
      const endTime = new Date(data.startTime);
      endTime.setMinutes(endTime.getMinutes() + booking.type.duration);
      updateData.endTime = endTime;

      // Wyślij powiadomienia o zmianie terminu
      for (const participant of booking.participants) {
        if (participant.email) {
          try {
            await this.notificationsService.sendGroupBookingReschedule(
              participant.email,
              participant.name,
              booking.title,
              booking.startTime,
              data.startTime,
            );
          } catch (error) {
            this.logger.error(`Błąd wysyłania powiadomienia o zmianie terminu:`, error);
          }
        }
      }
    }

    const updated = await this.prisma.group_bookings.update({
      where: { id },
      data: updateData,
      include: { type: true, employee: true, participants: true },
    });

    this.logger.log(`Zaktualizowano rezerwację grupową ${id}`);
    return updated;
  }

  // ==================== CYKLICZNE ZAJĘCIA GRUPOWE ====================

  /**
   * Tworzy cykliczne zajęcia grupowe
   */
  async createRecurring(tenantId: string, data: {
    typeId: string;
    title: string;
    description?: string;
    startTime: Date;
    employeeId?: string;
    recurrence: 'daily' | 'weekly' | 'biweekly' | 'monthly';
    occurrences: number; // ile razy powtórzyć
  }) {
    const type = await this.prisma.group_booking_types.findFirst({
      where: { id: data.typeId, tenantId, isActive: true },
    });

    if (!type) {
      throw new NotFoundException('Typ zajęć grupowych nie został znaleziony');
    }

    if (data.occurrences < 1 || data.occurrences > 52) {
      throw new BadRequestException('Liczba powtórzeń musi być między 1 a 52');
    }

    const createdBookings: any[] = [];
    let currentDate = new Date(data.startTime);

    for (let i = 0; i < data.occurrences; i++) {
      const endTime = new Date(currentDate);
      endTime.setMinutes(endTime.getMinutes() + type.duration);

      const booking = await this.prisma.group_bookings.create({
        data: {
          typeId: data.typeId,
          tenantId,
          employeeId: data.employeeId,
          title: data.title,
          description: data.description,
          startTime: new Date(currentDate),
          endTime,
          maxParticipants: type.maxParticipants,
          pricePerPerson: type.pricePerPerson,
          status: 'OPEN',
        },
      });

      createdBookings.push(booking);

      // Oblicz następną datę
      switch (data.recurrence) {
        case 'daily':
          currentDate.setDate(currentDate.getDate() + 1);
          break;
        case 'weekly':
          currentDate.setDate(currentDate.getDate() + 7);
          break;
        case 'biweekly':
          currentDate.setDate(currentDate.getDate() + 14);
          break;
        case 'monthly':
          currentDate.setMonth(currentDate.getMonth() + 1);
          break;
      }
    }

    this.logger.log(`Utworzono ${createdBookings.length} cyklicznych zajęć grupowych dla tenant ${tenantId}`);
    return { count: createdBookings.length, bookings: createdBookings };
  }

  // ==================== AUTOMATYCZNA OBSŁUGA WAITLISTY ====================

  /**
   * Przenosi osobę z waitlisty na listę uczestników
   */
  async promoteFromWaitlist(bookingId: string, tenantId: string, waitlistId?: string) {
    const booking = await this.findOne(bookingId, tenantId);

    if (booking.currentParticipants >= booking.maxParticipants) {
      throw new BadRequestException('Brak wolnych miejsc');
    }

    // Pobierz osobę z waitlisty (konkretną lub pierwszą w kolejce)
    const waitlistEntry = waitlistId
      ? await this.prisma.group_waitlist.findFirst({
          where: { id: waitlistId, groupBookingId: bookingId },
        })
      : await this.prisma.group_waitlist.findFirst({
          where: { groupBookingId: bookingId },
          orderBy: { position: 'asc' },
        });

    if (!waitlistEntry) {
      throw new NotFoundException('Brak osób na liście oczekujących');
    }

    // Dodaj jako uczestnika
    const participant = await this.prisma.group_participants.create({
      data: {
        groupBookingId: bookingId,
        name: waitlistEntry.name,
        email: waitlistEntry.email,
        phone: waitlistEntry.phone,
        status: 'CONFIRMED',
      },
    });

    // Usuń z waitlisty
    await this.prisma.group_waitlist.delete({
      where: { id: waitlistEntry.id },
    });

    // Zaktualizuj pozycje pozostałych na waitliście
    await this.prisma.group_waitlist.updateMany({
      where: {
        groupBookingId: bookingId,
        position: { gt: waitlistEntry.position },
      },
      data: {
        position: { decrement: 1 },
      },
    });

    // Zaktualizuj licznik uczestników
    const newCount = booking.currentParticipants + 1;
    await this.prisma.group_bookings.update({
      where: { id: bookingId },
      data: {
        currentParticipants: newCount,
        status: newCount >= booking.maxParticipants ? 'FULL' : 'OPEN',
      },
    });

    // Wyślij powiadomienie
    if (waitlistEntry.email) {
      const tenant = await this.prisma.tenants.findUnique({
        where: { id: tenantId },
      });

      try {
        await this.notificationsService.sendWaitlistPromotion(
          waitlistEntry.email,
          waitlistEntry.name,
          booking.title,
          booking.startTime,
          tenant?.name || 'Rezerwacja24',
        );
      } catch (error) {
        this.logger.error(`Błąd wysyłania powiadomienia o przeniesieniu z waitlisty:`, error);
      }
    }

    this.logger.log(`Przeniesiono ${waitlistEntry.name} z waitlisty do uczestników rezerwacji ${bookingId}`);
    return { success: true, participant };
  }

  /**
   * Pobiera listę oczekujących dla rezerwacji
   */
  async getWaitlist(bookingId: string, tenantId: string) {
    await this.findOne(bookingId, tenantId);

    return this.prisma.group_waitlist.findMany({
      where: { groupBookingId: bookingId },
      orderBy: { position: 'asc' },
    });
  }

  /**
   * Usuwa osobę z listy oczekujących
   */
  async removeFromWaitlist(bookingId: string, waitlistId: string, tenantId: string) {
    await this.findOne(bookingId, tenantId);

    const entry = await this.prisma.group_waitlist.findFirst({
      where: { id: waitlistId, groupBookingId: bookingId },
    });

    if (!entry) {
      throw new NotFoundException('Wpis na liście oczekujących nie został znaleziony');
    }

    await this.prisma.group_waitlist.delete({
      where: { id: waitlistId },
    });

    // Zaktualizuj pozycje
    await this.prisma.group_waitlist.updateMany({
      where: {
        groupBookingId: bookingId,
        position: { gt: entry.position },
      },
      data: {
        position: { decrement: 1 },
      },
    });

    this.logger.log(`Usunięto ${entry.name} z listy oczekujących rezerwacji ${bookingId}`);
    return { success: true };
  }

  // ==================== OZNACZANIE OBECNOŚCI ====================

  /**
   * Oznacza uczestnika jako obecnego (check-in)
   */
  async checkInParticipant(bookingId: string, participantId: string, tenantId: string) {
    await this.findOne(bookingId, tenantId);

    const participant = await this.prisma.group_participants.findFirst({
      where: { id: participantId, groupBookingId: bookingId },
    });

    if (!participant) {
      throw new NotFoundException('Uczestnik nie został znaleziony');
    }

    const updated = await this.prisma.group_participants.update({
      where: { id: participantId },
      data: { status: 'CHECKED_IN' },
    });

    this.logger.log(`Check-in uczestnika ${participantId} na rezerwacji ${bookingId}`);
    return updated;
  }

  /**
   * Oznacza uczestnika jako nieobecnego (no-show)
   */
  async markNoShow(bookingId: string, participantId: string, tenantId: string) {
    await this.findOne(bookingId, tenantId);

    const participant = await this.prisma.group_participants.findFirst({
      where: { id: participantId, groupBookingId: bookingId },
    });

    if (!participant) {
      throw new NotFoundException('Uczestnik nie został znaleziony');
    }

    const updated = await this.prisma.group_participants.update({
      where: { id: participantId },
      data: { status: 'NO_SHOW' },
    });

    this.logger.log(`Oznaczono no-show uczestnika ${participantId} na rezerwacji ${bookingId}`);
    return updated;
  }

  /**
   * Masowy check-in wszystkich uczestników
   */
  async checkInAll(bookingId: string, tenantId: string) {
    await this.findOne(bookingId, tenantId);

    const result = await this.prisma.group_participants.updateMany({
      where: { groupBookingId: bookingId, status: 'CONFIRMED' },
      data: { status: 'CHECKED_IN' },
    });

    this.logger.log(`Masowy check-in ${result.count} uczestników na rezerwacji ${bookingId}`);
    return { checkedIn: result.count };
  }

  // ==================== STATYSTYKI ZAJĘĆ GRUPOWYCH ====================

  /**
   * Pobiera statystyki zajęć grupowych
   */
  async getStatistics(tenantId: string, from?: Date, to?: Date) {
    const dateFilter: any = {};
    if (from) dateFilter.gte = from;
    if (to) dateFilter.lte = to;

    const whereClause: any = { tenantId };
    if (from || to) {
      whereClause.startTime = dateFilter;
    }

    // Wszystkie rezerwacje w okresie
    const bookings = await this.prisma.group_bookings.findMany({
      where: whereClause,
      include: {
        type: true,
        participants: true,
        _count: { select: { participants: true } },
      },
    });

    // Oblicz statystyki
    const totalBookings = bookings.length;
    const completedBookings = bookings.filter(b => b.status === 'COMPLETED').length;
    const cancelledBookings = bookings.filter(b => b.status === 'CANCELLED').length;
    const totalParticipants = bookings.reduce((sum, b) => sum + b._count.participants, 0);
    const totalRevenue = bookings
      .filter(b => b.status === 'COMPLETED')
      .reduce((sum, b) => sum + (b._count.participants * Number(b.pricePerPerson)), 0);

    // Średnia frekwencja
    const avgOccupancy = totalBookings > 0
      ? bookings.reduce((sum, b) => sum + (b._count.participants / b.maxParticipants * 100), 0) / totalBookings
      : 0;

    // Najpopularniejsze typy zajęć
    const typeStats: Record<string, { name: string; count: number; participants: number; revenue: number }> = {};
    for (const booking of bookings) {
      const typeId = booking.typeId;
      if (!typeStats[typeId]) {
        typeStats[typeId] = {
          name: booking.type.name,
          count: 0,
          participants: 0,
          revenue: 0,
        };
      }
      typeStats[typeId].count++;
      typeStats[typeId].participants += booking._count.participants;
      if (booking.status === 'COMPLETED') {
        typeStats[typeId].revenue += booking._count.participants * Number(booking.pricePerPerson);
      }
    }

    const popularTypes = Object.values(typeStats)
      .sort((a, b) => b.participants - a.participants)
      .slice(0, 5);

    // Statystyki dzienne
    const dailyStats: Record<string, { bookings: number; participants: number; revenue: number }> = {};
    for (const booking of bookings) {
      const date = booking.startTime.toISOString().split('T')[0];
      if (!dailyStats[date]) {
        dailyStats[date] = { bookings: 0, participants: 0, revenue: 0 };
      }
      dailyStats[date].bookings++;
      dailyStats[date].participants += booking._count.participants;
      if (booking.status === 'COMPLETED') {
        dailyStats[date].revenue += booking._count.participants * Number(booking.pricePerPerson);
      }
    }

    return {
      summary: {
        totalBookings,
        completedBookings,
        cancelledBookings,
        totalParticipants,
        totalRevenue,
        avgOccupancy: Math.round(avgOccupancy * 10) / 10,
      },
      popularTypes,
      dailyStats,
    };
  }

  // ==================== PŁATNOŚCI ONLINE ====================

  /**
   * Oblicza kwotę do zapłaty dla uczestników
   */
  async calculatePayment(bookingId: string, tenantId: string, participantIds: string[]) {
    const booking = await this.findOne(bookingId, tenantId);

    const participants = await this.prisma.group_participants.findMany({
      where: {
        id: { in: participantIds },
        groupBookingId: bookingId,
      },
    });

    if (participants.length === 0) {
      throw new BadRequestException('Nie znaleziono uczestników');
    }

    const amount = participants.length * Number(booking.pricePerPerson);

    return {
      amount,
      participantCount: participants.length,
      pricePerPerson: Number(booking.pricePerPerson),
      participants: participants.map(p => ({ id: p.id, name: p.name, email: p.email })),
    };
  }

  /**
   * Oznacza uczestników jako opłaconych
   */
  async markAsPaid(bookingId: string, participantIds: string[], tenantId: string) {
    await this.findOne(bookingId, tenantId);

    const now = new Date();
    const result = await this.prisma.group_participants.updateMany({
      where: {
        id: { in: participantIds },
        groupBookingId: bookingId,
      },
      data: { paidAt: now },
    });

    this.logger.log(`Oznaczono ${result.count} uczestników jako opłaconych na rezerwacji ${bookingId}`);
    return { markedAsPaid: result.count };
  }

  // ==================== WYSYŁANIE PRZYPOMNIEŃ ====================

  /**
   * Wysyła przypomnienia o nadchodzących zajęciach
   */
  async sendReminders(tenantId: string, hoursBeforeStart: number = 24) {
    const now = new Date();
    const reminderTime = new Date(now.getTime() + hoursBeforeStart * 60 * 60 * 1000);

    const upcomingBookings = await this.prisma.group_bookings.findMany({
      where: {
        tenantId,
        status: { in: ['OPEN', 'FULL'] },
        startTime: {
          gte: now,
          lte: reminderTime,
        },
      },
      include: {
        participants: true,
      },
    });

    const tenant = await this.prisma.tenants.findUnique({
      where: { id: tenantId },
    });

    let sentCount = 0;
    for (const booking of upcomingBookings) {
      for (const participant of booking.participants) {
        if (participant.email) {
          try {
            await this.notificationsService.sendGroupBookingReminder(
              participant.email,
              participant.name,
              booking.title,
              booking.startTime,
              tenant?.name || 'Rezerwacja24',
            );
            sentCount++;
          } catch (error) {
            this.logger.error(`Błąd wysyłania przypomnienia do ${participant.email}:`, error);
          }
        }
      }
    }

    this.logger.log(`Wysłano ${sentCount} przypomnień o zajęciach grupowych`);
    return { sentReminders: sentCount, bookingsCount: upcomingBookings.length };
  }
}
