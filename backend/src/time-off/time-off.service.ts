import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateTimeOffDto } from './dto/create-time-off.dto';
import { UpdateTimeOffDto } from './dto/update-time-off.dto';

@Injectable()
export class TimeOffService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, createTimeOffDto: CreateTimeOffDto) {
    const { employeeId, startTime, endTime, reason } = createTimeOffDto;

    // Validate employee exists
    const employee = await this.prisma.employees.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      throw new NotFoundException('Pracownik nie został znaleziony');
    }

    // Validate dates
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start >= end) {
      throw new BadRequestException('Data rozpoczęcia musi być wcześniejsza niż data zakończenia');
    }

    // Check for overlapping time blocks
    const overlapping = await this.prisma.time_blocks.findFirst({
      where: {
        employeeId,
        OR: [
          {
            AND: [
              { startTime: { lte: start } },
              { endTime: { gt: start } },
            ],
          },
          {
            AND: [
              { startTime: { lt: end } },
              { endTime: { gte: end } },
            ],
          },
          {
            AND: [
              { startTime: { gte: start } },
              { endTime: { lte: end } },
            ],
          },
        ],
      },
    });

    if (overlapping) {
      throw new BadRequestException('Ten okres czasu nakłada się z istniejącym urlopem/blokadą');
    }

    // Create time block
    const timeBlock = await this.prisma.time_blocks.create({
      data: {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        employeeId,
        startTime: start,
        endTime: end,
        reason,
      },
    });

    return timeBlock;
  }

  async findAll(
    tenantId: string,
    filters?: { employeeId?: string; startDate?: string; endDate?: string },
  ) {
    // Pobierz userIds dla tego tenanta
    const tenantUsers = await this.prisma.tenant_users.findMany({
      where: { tenantId },
      select: { userId: true },
    });
    
    const userIds = tenantUsers.map(tu => tu.userId);
    
    // Pobierz employees dla tych users
    const tenantEmployees = await this.prisma.employees.findMany({
      where: { userId: { in: userIds } },
      select: { id: true },
    });
    
    const tenantEmployeeIds = tenantEmployees.map(e => e.id);
    
    const where: any = {
      employeeId: { in: tenantEmployeeIds },  // ← FILTRUJ PO TENANT!
    };

    if (filters?.employeeId) {
      where.employeeId = filters.employeeId;
    }

    if (filters?.startDate || filters?.endDate) {
      where.AND = [];

      if (filters.startDate) {
        where.AND.push({
          endTime: { gte: new Date(filters.startDate) },
        });
      }

      if (filters.endDate) {
        where.AND.push({
          startTime: { lte: new Date(filters.endDate) },
        });
      }
    }

    const timeBlocks = await this.prisma.time_blocks.findMany({
      where,
      orderBy: {
        startTime: 'asc',
      },
    });

    // Get employee details for each time block
    const employeeIds = [...new Set(timeBlocks.map((tb) => tb.employeeId))];
    const employees = await this.prisma.employees.findMany({
      where: { id: { in: employeeIds } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatar: true,
      },
    });

    const employeeMap = new Map(employees.map((e) => [e.id, e]));

    return timeBlocks.map((tb) => ({
      ...tb,
      employee: employeeMap.get(tb.employeeId),
    }));
  }

  async findOne(tenantId: string, id: string) {
    const timeBlock = await this.prisma.time_blocks.findUnique({
      where: { id },
    });

    if (!timeBlock) {
      throw new NotFoundException('Urlop/blokada nie została znaleziona');
    }

    // Get employee details
    const employee = await this.prisma.employees.findUnique({
      where: { id: timeBlock.employeeId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatar: true,
        email: true,
      },
    });

    return {
      ...timeBlock,
      employee,
    };
  }

  async update(tenantId: string, id: string, updateTimeOffDto: UpdateTimeOffDto) {
    const existing = await this.prisma.time_blocks.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Urlop/blokada nie została znaleziona');
    }

    // Validate dates if provided
    const startTime = updateTimeOffDto.startTime
      ? new Date(updateTimeOffDto.startTime)
      : existing.startTime;
    const endTime = updateTimeOffDto.endTime
      ? new Date(updateTimeOffDto.endTime)
      : existing.endTime;

    if (startTime >= endTime) {
      throw new BadRequestException('Data rozpoczęcia musi być wcześniejsza niż data zakończenia');
    }

    // Check for overlapping time blocks (excluding current one)
    if (updateTimeOffDto.startTime || updateTimeOffDto.endTime) {
      const overlapping = await this.prisma.time_blocks.findFirst({
        where: {
          id: { not: id },
          employeeId: existing.employeeId,
          OR: [
            {
              AND: [
                { startTime: { lte: startTime } },
                { endTime: { gt: startTime } },
              ],
            },
            {
              AND: [
                { startTime: { lt: endTime } },
                { endTime: { gte: endTime } },
              ],
            },
            {
              AND: [
                { startTime: { gte: startTime } },
                { endTime: { lte: endTime } },
              ],
            },
          ],
        },
      });

      if (overlapping) {
        throw new BadRequestException('Ten okres czasu nakłada się z istniejącym urlopem/blokadą');
      }
    }

    const timeBlock = await this.prisma.time_blocks.update({
      where: { id },
      data: {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        startTime: updateTimeOffDto.startTime ? startTime : undefined,
        endTime: updateTimeOffDto.endTime ? endTime : undefined,
        reason: updateTimeOffDto.reason,
      },
    });

    return timeBlock;
  }

  async remove(tenantId: string, id: string) {
    const timeBlock = await this.prisma.time_blocks.findUnique({
      where: { id },
    });

    if (!timeBlock) {
      throw new NotFoundException('Urlop/blokada nie została znaleziona');
    }

    await this.prisma.time_blocks.delete({
      where: { id },
    });

    return { message: 'Urlop/blokada została usunięta' };
  }

  async checkAvailability(
    tenantId: string,
    employeeId: string,
    startTime: string,
    endTime: string,
  ) {
    const start = new Date(startTime);
    const end = new Date(endTime);

    const timeBlocks = await this.prisma.time_blocks.findMany({
      where: {
        employeeId,
        OR: [
          {
            AND: [
              { startTime: { lte: start } },
              { endTime: { gt: start } },
            ],
          },
          {
            AND: [
              { startTime: { lt: end } },
              { endTime: { gte: end } },
            ],
          },
          {
            AND: [
              { startTime: { gte: start } },
              { endTime: { lte: end } },
            ],
          },
        ],
      },
    });

    return {
      isAvailable: timeBlocks.length === 0,
      conflictingTimeBlocks: timeBlocks,
    };
  }
}
