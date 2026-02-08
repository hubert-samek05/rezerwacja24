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
import { PromotionsService } from './promotions.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';

@ApiTags('coupons')
@Controller('coupons')
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  @Post()
  @ApiOperation({ summary: 'Utwórz nowy kod rabatowy' })
  @ApiResponse({ status: 201, description: 'Kod rabatowy został utworzony' })
  @ApiResponse({ status: 400, description: 'Nieprawidłowe dane' })
  @ApiResponse({ status: 409, description: 'Kod rabatowy już istnieje' })
  create(@Body() createCouponDto: CreateCouponDto, @Req() req: any) {
    const tenantId = req.headers['x-tenant-id'] || 'default';
    return this.promotionsService.createCoupon(tenantId, createCouponDto);
  }

  @Get()
  @ApiOperation({ summary: 'Pobierz wszystkie kody rabatowe' })
  @ApiResponse({ status: 200, description: 'Lista kodów rabatowych' })
  findAll(@Req() req: any) {
    const tenantId = req.headers['x-tenant-id'] || 'default';
    return this.promotionsService.findAllCoupons(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Pobierz szczegóły kodu rabatowego' })
  @ApiResponse({ status: 200, description: 'Szczegóły kodu rabatowego' })
  @ApiResponse({ status: 404, description: 'Kod rabatowy nie znaleziony' })
  findOne(@Param('id') id: string, @Req() req: any) {
    const tenantId = req.headers['x-tenant-id'] || 'default';
    return this.promotionsService.findOneCoupon(tenantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Zaktualizuj kod rabatowy' })
  @ApiResponse({ status: 200, description: 'Kod rabatowy został zaktualizowany' })
  @ApiResponse({ status: 404, description: 'Kod rabatowy nie znaleziony' })
  @ApiResponse({ status: 409, description: 'Kod rabatowy o tej nazwie już istnieje' })
  update(
    @Param('id') id: string,
    @Body() updateCouponDto: UpdateCouponDto,
    @Req() req: any,
  ) {
    const tenantId = req.headers['x-tenant-id'] || 'default';
    return this.promotionsService.updateCoupon(tenantId, id, updateCouponDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Usuń kod rabatowy' })
  @ApiResponse({ status: 200, description: 'Kod rabatowy został usunięty' })
  @ApiResponse({ status: 404, description: 'Kod rabatowy nie znaleziony' })
  remove(@Param('id') id: string, @Req() req: any) {
    const tenantId = req.headers['x-tenant-id'] || 'default';
    return this.promotionsService.removeCoupon(tenantId, id);
  }

  @Post('validate')
  @ApiOperation({ summary: 'Waliduj kod rabatowy' })
  @ApiResponse({ status: 200, description: 'Wynik walidacji kodu' })
  validate(@Body() body: { code: string; orderTotal?: number }, @Req() req: any) {
    const tenantId = req.headers['x-tenant-id'] || 'default';
    return this.promotionsService.validateCoupon(tenantId, body.code, body.orderTotal);
  }

  @Post('apply')
  @ApiOperation({ summary: 'Zastosuj kod rabatowy do zamówienia' })
  @ApiResponse({ status: 200, description: 'Kod został zastosowany' })
  @ApiResponse({ status: 400, description: 'Kod nie może być zastosowany' })
  apply(@Body() body: { code: string; orderTotal: number }, @Req() req: any) {
    const tenantId = req.headers['x-tenant-id'] || 'default';
    return this.promotionsService.applyCoupon(tenantId, body.code, body.orderTotal);
  }
}
