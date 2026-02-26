import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Query,
  Param,
  Body,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { MarketplaceService } from './marketplace.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('marketplace')
@Controller('marketplace')
export class MarketplaceController {
  private readonly logger = new Logger(MarketplaceController.name);

  constructor(private readonly marketplaceService: MarketplaceService) {}

  private getTenantId(req: any): string {
    let fromHeader = req.headers['x-tenant-id'];
    // Handle case where header is an array (sent multiple times)
    if (Array.isArray(fromHeader)) {
      fromHeader = fromHeader[0];
    }
    const fromUser = req.user?.tenantId;
    const tenantId = fromHeader || fromUser;
    this.logger.debug(`getTenantId - header: ${fromHeader}, user: ${fromUser}, final: ${tenantId}`);
    return tenantId;
  }

  /**
   * Publiczne endpointy - dostępne bez autoryzacji
   */

  @Get('listings')
  @ApiOperation({ summary: 'Pobierz listę opublikowanych firm' })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'subcategory', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'city', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['ranking', 'rating', 'newest', 'popular'] })
  async getListings(
    @Query('category') category?: string,
    @Query('subcategory') subcategory?: string,
    @Query('search') search?: string,
    @Query('city') city?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: 'ranking' | 'rating' | 'newest' | 'popular',
  ) {
    return this.marketplaceService.getPublishedListings({
      category,
      subcategory,
      search,
      city,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? Math.min(parseInt(limit, 10), 50) : 20,
      sortBy,
    });
  }

  @Get('listings/:slug')
  @ApiOperation({ summary: 'Pobierz szczegóły profilu firmy' })
  async getListingBySlug(@Param('slug') slug: string) {
    return this.marketplaceService.getListingBySlug(slug);
  }

  @Post('track-view')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Śledź wyświetlenie strony firmy (subdomena)' })
  async trackView(@Body() body: { tenantId: string }) {
    return this.marketplaceService.trackView(body.tenantId);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Pobierz listę kategorii z liczbą firm' })
  async getCategories() {
    return this.marketplaceService.getCategories();
  }

  @Get('featured')
  @ApiOperation({ summary: 'Pobierz wyróżnione firmy' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getFeatured(@Query('limit') limit?: string) {
    return this.marketplaceService.getFeaturedListings(
      limit ? Math.min(parseInt(limit, 10), 12) : 6,
    );
  }

  @Get('search-availability')
  @ApiOperation({ summary: 'Wyszukaj firmy z dostępnymi terminami' })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'subcategory', required: false })
  @ApiQuery({ name: 'city', required: false })
  @ApiQuery({ name: 'date', required: true, description: 'Data w formacie YYYY-MM-DD' })
  @ApiQuery({ name: 'timeFrom', required: false, description: 'Godzina od (HH:MM)' })
  @ApiQuery({ name: 'timeTo', required: false, description: 'Godzina do (HH:MM)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async searchAvailability(
    @Query('category') category?: string,
    @Query('subcategory') subcategory?: string,
    @Query('city') city?: string,
    @Query('date') date?: string,
    @Query('timeFrom') timeFrom?: string,
    @Query('timeTo') timeTo?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    if (!date) {
      // Domyślnie dzisiejsza data
      const today = new Date();
      date = today.toISOString().split('T')[0];
    }
    
    return this.marketplaceService.searchAvailableSlots({
      category,
      subcategory,
      city,
      date,
      timeFrom,
      timeTo,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? Math.min(parseInt(limit, 10), 50) : 20,
    });
  }

  /**
   * Endpointy wymagające autoryzacji - zarządzanie własnym profilem
   */

  @Get('my-profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Pobierz profil marketplace dla swojej firmy' })
  async getMyProfile(@Req() req: any) {
    const tenantId = this.getTenantId(req);
    return this.marketplaceService.getListingByTenantId(tenantId);
  }

  @Post('publish')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Opublikuj profil firmy w marketplace' })
  async publishProfile(
    @Req() req: any,
    @Body()
    body: {
      title?: string;
      description?: string;
      shortDesc?: string;
      category: string;
      subcategory?: string;
      tags?: string[];
      coverImage?: string;
      gallery?: string[];
    },
  ) {
    const tenantId = this.getTenantId(req);
    return this.marketplaceService.publishProfile(tenantId, body);
  }

  @Put('my-profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Aktualizuj profil firmy w marketplace' })
  async updateProfile(
    @Req() req: any,
    @Body()
    body: {
      title?: string;
      description?: string;
      shortDesc?: string;
      category: string;
      subcategory?: string;
      tags?: string[];
      coverImage?: string;
      gallery?: string[];
    },
  ) {
    const tenantId = this.getTenantId(req);
    return this.marketplaceService.publishProfile(tenantId, body);
  }

  @Delete('unpublish')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Ukryj profil firmy z marketplace' })
  async unpublishProfile(@Req() req: any) {
    const tenantId = this.getTenantId(req);
    return this.marketplaceService.unpublishProfile(tenantId);
  }
}
