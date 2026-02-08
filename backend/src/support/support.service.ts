import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

export interface CreateTicketDto {
  type: 'bug' | 'feature' | 'question' | 'other';
  subject: string;
  message: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface TicketResponseDto {
  message: string;
}

@Injectable()
export class SupportService {
  constructor(private prisma: PrismaService) {}

  // Tworzenie zgłoszenia
  async createTicket(tenantId: string, userId: string, userEmail: string, dto: CreateTicketDto) {
    return this.prisma.support_tickets.create({
      data: {
        tenantId,
        userId,
        userEmail,
        type: dto.type,
        subject: dto.subject,
        message: dto.message,
        priority: dto.priority || 'medium',
        status: 'open',
      },
    });
  }

  // Pobieranie zgłoszeń użytkownika
  async getUserTickets(tenantId: string, userId: string) {
    return this.prisma.support_tickets.findMany({
      where: { tenantId, userId },
      orderBy: { createdAt: 'desc' },
      include: {
        responses: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  // Pobieranie wszystkich zgłoszeń (admin)
  async getAllTickets(filters?: { status?: string; type?: string }) {
    const where: any = {};
    if (filters?.status) where.status = filters.status;
    if (filters?.type) where.type = filters.type;

    const tickets = await this.prisma.support_tickets.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        responses: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    // Pobierz emaile użytkowników jeśli brakuje
    const ticketsWithEmails = await Promise.all(
      tickets.map(async (ticket) => {
        if (!ticket.userEmail && ticket.userId) {
          const user = await this.prisma.users.findUnique({
            where: { id: ticket.userId },
            select: { email: true },
          });
          return { ...ticket, userEmail: user?.email || 'Nieznany' };
        }
        return ticket;
      })
    );

    return ticketsWithEmails;
  }

  // Pobieranie pojedynczego zgłoszenia
  async getTicket(id: string) {
    return this.prisma.support_tickets.findUnique({
      where: { id },
      include: {
        responses: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  // Odpowiedź na zgłoszenie (admin)
  async respondToTicket(ticketId: string, adminId: string, message: string) {
    // Dodaj odpowiedź
    const response = await this.prisma.ticket_responses.create({
      data: {
        ticketId,
        adminId,
        message,
        isAdminResponse: true,
      },
    });

    // Zaktualizuj status zgłoszenia
    await this.prisma.support_tickets.update({
      where: { id: ticketId },
      data: { 
        status: 'in_progress',
        updatedAt: new Date(),
      },
    });

    return response;
  }

  // Zamknięcie zgłoszenia
  async closeTicket(ticketId: string) {
    return this.prisma.support_tickets.update({
      where: { id: ticketId },
      data: { 
        status: 'closed',
        closedAt: new Date(),
      },
    });
  }

  // Statystyki zgłoszeń (admin)
  async getTicketStats() {
    const [total, open, inProgress, closed, bugs, features] = await Promise.all([
      this.prisma.support_tickets.count(),
      this.prisma.support_tickets.count({ where: { status: 'open' } }),
      this.prisma.support_tickets.count({ where: { status: 'in_progress' } }),
      this.prisma.support_tickets.count({ where: { status: 'closed' } }),
      this.prisma.support_tickets.count({ where: { type: 'bug' } }),
      this.prisma.support_tickets.count({ where: { type: 'feature' } }),
    ]);

    return { total, open, inProgress, closed, bugs, features };
  }
}
