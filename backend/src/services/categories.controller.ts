import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrismaService } from '../common/prisma/prisma.service';
import { IsString, IsOptional, IsNumber } from 'class-validator';

class CreateCategoryDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsNumber()
  order?: number;
}

@ApiTags('service-categories')
@Controller('service-categories')
export class CategoriesController {
  constructor(private readonly prisma: PrismaService) {}

  @Post()
  @ApiOperation({ summary: 'Utwórz nową kategorię usług' })
  @ApiResponse({ status: 201, description: 'Kategoria została utworzona' })
  async create(@Body() createCategoryDto: CreateCategoryDto, @Req() req: any) {
    const tenantId = req.headers['x-tenant-id'] || 'default';
    
    return this.prisma.service_categories.create({
      data: {
        id: `cat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...createCategoryDto,
        updatedAt: new Date(),
      },
    });
  }

  @Get()
  @ApiOperation({ summary: 'Pobierz wszystkie kategorie' })
  @ApiResponse({ status: 200, description: 'Lista kategorii' })
  async findAll(@Req() req: any) {
    const tenantId = req.headers['x-tenant-id'] || 'default';
    
    // Pobierz userIds dla tego tenanta
    const tenantUsers = await this.prisma.tenant_users.findMany({
      where: { tenantId },
      select: { userId: true },
    });
    
    const userIds = tenantUsers.map(tu => tu.userId);
    
    // Pobierz employees dla tych users
    const employees = await this.prisma.employees.findMany({
      where: { userId: { in: userIds } },
      select: { id: true },
    });
    
    const employeeIds = employees.map(e => e.id);
    
    // Pobierz WSZYSTKIE kategorie które:
    // 1. Nie mają żadnych usług (nowe kategorie) LUB
    // 2. Mają usługi przypisane do employees tego tenanta
    return this.prisma.service_categories.findMany({
      where: {
        OR: [
          // Kategorie bez usług (nowe)
          {
            services: {
              none: {},
            },
          },
          // Kategorie z usługami tego tenanta
          {
            services: {
              some: {
                service_employees: {
                  some: {
                    employeeId: { in: employeeIds },
                  },
                },
              },
            },
          },
        ],
      },
      include: {
        _count: {
          select: {
            services: true,
          },
        },
      },
      orderBy: {
        order: 'asc',
      },
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Pobierz szczegóły kategorii' })
  @ApiResponse({ status: 200, description: 'Szczegóły kategorii' })
  async findOne(@Param('id') id: string, @Req() req: any) {
    const tenantId = req.headers['x-tenant-id'] || 'default';
    
    return this.prisma.service_categories.findUnique({
      where: { id },
      include: {
        services: true,
        _count: {
          select: {
            services: true,
          },
        },
      },
    });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Zaktualizuj kategorię' })
  @ApiResponse({ status: 200, description: 'Kategoria została zaktualizowana' })
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: Partial<CreateCategoryDto>,
    @Req() req: any,
  ) {
    const tenantId = req.headers['x-tenant-id'] || 'default';
    
    return this.prisma.service_categories.update({
      where: { id },
      data: updateCategoryDto,
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Usuń kategorię' })
  @ApiResponse({ status: 200, description: 'Kategoria została usunięta' })
  async remove(@Param('id') id: string, @Req() req: any) {
    const tenantId = req.headers['x-tenant-id'] || 'default';
    
    // Check if category has services
    const category = await this.prisma.service_categories.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            services: true,
          },
        },
      },
    });

    if (category && category._count.services > 0) {
      throw new Error('Nie można usunąć kategorii, która ma przypisane usługi');
    }

    await this.prisma.service_categories.delete({
      where: { id },
    });

    return { message: 'Kategoria została usunięta' };
  }
}
