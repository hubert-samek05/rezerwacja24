import { Controller, Get, Param, Put, Patch, Body, NotFoundException, BadRequestException, Res, UseGuards, Logger } from '@nestjs/common';
import { Response } from 'express';
import { TenantsService } from './tenants.service';
import { PrismaService } from '../common/prisma/prisma.service';
import { TenantAccessGuard } from '../common/guards/tenant-access.guard';
import { Public } from '../common/decorators/public.decorator';

@Controller('tenants')
export class TenantsController {
  private readonly logger = new Logger(TenantsController.name);

  constructor(
    private readonly tenantsService: TenantsService,
    private readonly prisma: PrismaService,
  ) {}

  // Endpoint publiczny - sprawdzanie dostępności subdomeny
  @Public()
  @Get('check-subdomain/:subdomain')
  async checkSubdomainAvailability(@Param('subdomain') subdomain: string) {
    const exists = await this.tenantsService.subdomainExists(subdomain);
    return { available: !exists };
  }

  // Endpoint publiczny - lista aktywnych subdomen dla sitemap SEO
  @Public()
  @Get('public/subdomains')
  async getPublicSubdomains() {
    const tenants = await this.prisma.tenants.findMany({
      where: {
        isSuspended: false,
        // Tylko aktywne firmy z uzupełnionymi danymi
        name: { not: '' },
      },
      select: {
        subdomain: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    
    return {
      subdomains: tenants.map(t => t.subdomain).filter(Boolean),
    };
  }

  // Endpoint publiczny - pobieranie tenanta po subdomenie (dla widgetu)
  @Public()
  @Get('subdomain/:subdomain')
  async findBySubdomain(@Param('subdomain') subdomain: string) {
    const tenant = await this.tenantsService.findBySubdomain(subdomain);
    if (!tenant) {
      throw new NotFoundException(`Tenant with subdomain "${subdomain}" not found`);
    }
    return tenant;
  }

  // Sprawdź status konta (czy jest zawieszone) i subskrypcji
  @Get('status')
  async getAccountStatus(@Res({ passthrough: true }) res: Response) {
    const tenantId = res.req.headers['x-tenant-id'] as string;
    if (!tenantId) {
      throw new BadRequestException('Brak x-tenant-id');
    }

    const tenant = await this.prisma.tenants.findUnique({
      where: { id: tenantId },
      select: {
        id: true,
        isSuspended: true,
        suspendedReason: true,
        subscriptions: {
          select: {
            status: true,
            lastPaymentStatus: true,
            lastPaymentError: true,
            trialEnd: true,
            currentPeriodEnd: true,
          },
        },
      },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant nie znaleziony');
    }

    const subscription = tenant.subscriptions;
    
    // Sprawdź czy subskrypcja jest aktywna
    // ACTIVE = płatna subskrypcja aktywna
    // TRIALING = trial aktywny TYLKO jeśli trialEnd > now
    let isActiveSubscription = subscription?.status === 'ACTIVE';
    
    if (subscription?.status === 'TRIALING' && subscription?.trialEnd) {
      const trialEndDate = new Date(subscription.trialEnd);
      const now = new Date();
      isActiveSubscription = trialEndDate > now;
    }
    let actualSuspended = tenant.isSuspended || false;
    let actualReason = tenant.suspendedReason || null;
    
    // Jeśli trial się skończył i konto nie jest zawieszone - zawieś je
    if (!isActiveSubscription && subscription?.status === 'TRIALING' && !tenant.isSuspended) {
      await this.prisma.tenants.update({
        where: { id: tenantId },
        data: { 
          isSuspended: true, 
          suspendedReason: 'Okres próbny wygasł - wybierz plan aby kontynuować' 
        }
      });
      actualSuspended = true;
      actualReason = 'Okres próbny wygasł - wybierz plan aby kontynuować';
    }
    
    if (isActiveSubscription && tenant.isSuspended) {
      // Automatycznie odblokuj konto
      await this.prisma.tenants.update({
        where: { id: tenantId },
        data: { isSuspended: false, suspendedReason: null }
      });
      actualSuspended = false;
      actualReason = null;
    }
    
    return {
      isSuspended: actualSuspended,
      suspendedReason: actualReason,
      subscriptionStatus: subscription?.status || null,
      paymentError: subscription?.lastPaymentError || null,
      currentPeriodEnd: subscription?.currentPeriodEnd || null,
    };
  }

  // Wymaga autoryzacji - tylko właściciel tenanta lub SUPER_ADMIN
  @UseGuards(TenantAccessGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    this.logger.debug(`GET /api/tenants/${id}`);
    const tenant = await this.tenantsService.findOne(id);
    if (!tenant) {
      throw new NotFoundException(`Tenant with id "${id}" not found`);
    }
    return tenant;
  }

  // Wymaga autoryzacji - tylko właściciel tenanta lub SUPER_ADMIN
  @UseGuards(TenantAccessGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() data: any,
  ) {
    this.logger.debug(`PATCH /api/tenants/${id} - keys: ${Object.keys(data).join(', ')}`);
    
    const tenant = await this.tenantsService.findOne(id);
    if (!tenant) {
      throw new NotFoundException(`Tenant with id "${id}" not found`);
    }
    
    const result = await this.tenantsService.update(id, data);
    this.logger.log(`Tenant ${id} updated successfully`);
    
    return result;
  }

  // Wymaga autoryzacji - tylko właściciel tenanta lub SUPER_ADMIN
  @UseGuards(TenantAccessGuard)
  @Put(':id/branding')
  async updateBranding(
    @Param('id') id: string,
    @Body() data: { logo?: string; banner?: string },
  ) {
    this.logger.debug(`PUT /api/tenants/${id}/branding`);
    
    const tenant = await this.tenantsService.findOne(id);
    if (!tenant) {
      throw new NotFoundException(`Tenant with id "${id}" not found`);
    }
    const result = await this.tenantsService.updateBranding(id, data);
    this.logger.log(`Tenant ${id} branding updated`);
    return result;
  }

  // Wymaga autoryzacji - tylko właściciel tenanta lub SUPER_ADMIN
  @UseGuards(TenantAccessGuard)
  @Put(':id/widget-config')
  async updateWidgetConfig(
    @Param('id') id: string,
    @Body() data: { 
      primaryColor?: string; 
      accentColor?: string;
      showServices?: boolean;
      showEmployees?: boolean;
      showPrices?: boolean;
    },
  ) {
    this.logger.debug(`PUT /api/tenants/${id}/widget-config`);
    
    const tenant = await this.tenantsService.findOne(id);
    if (!tenant) {
      throw new NotFoundException(`Tenant with id "${id}" not found`);
    }
    
    const result = await this.tenantsService.updateWidgetConfig(id, data);
    this.logger.log(`Tenant ${id} widget config updated`);
    return result;
  }

  // Wymaga autoryzacji - aktualizacja ustawień strony
  @UseGuards(TenantAccessGuard)
  @Put(':id/page-settings')
  async updatePageSettings(
    @Param('id') id: string,
    @Body() data: {
      servicesLayout?: 'grid' | 'list';
      showServiceImages?: boolean;
      showServicePrices?: boolean;
      showServiceDuration?: boolean;
      showEmployeeSelection?: boolean;
      showOpeningHours?: boolean;
      showSocialMedia?: boolean;
      showDescription?: boolean;
      primaryColor?: string;
      accentColor?: string;
      heroStyle?: 'banner' | 'minimal' | 'none';
      bookingButtonText?: string;
    },
  ) {
    this.logger.debug(`PUT /api/tenants/${id}/page-settings`);
    
    const tenant = await this.tenantsService.findOne(id);
    if (!tenant) {
      throw new NotFoundException(`Tenant with id "${id}" not found`);
    }
    
    const result = await this.tenantsService.updatePageSettings(id, data);
    this.logger.log(`Tenant ${id} page settings updated`);
    return result;
  }

  // Endpoint publiczny - ustawienia strony dla subdomen
  @Public()
  @Get(':id/page-settings')
  async getPageSettings(@Param('id') id: string) {
    const tenant = await this.tenantsService.findOne(id);
    if (!tenant) {
      throw new NotFoundException(`Tenant with id "${id}" not found`);
    }
    
    const defaultSettings = {
      servicesLayout: 'grid',
      showServiceImages: true,
      showServicePrices: true,
      showServiceDuration: true,
      showEmployeeSelection: true,
      showOpeningHours: true,
      showSocialMedia: true,
      showDescription: true,
      primaryColor: '#0F6048',
      accentColor: '#41FFBC',
      heroStyle: 'banner',
      bookingButtonText: 'Zarezerwuj',
      bookingAdvanceDays: 0, // 0 = bez limitu wyprzedzenia
      minCancellationHours: 0, // 0 = bez ograniczeń anulowania
    };
    
    return {
      pageSettings: { ...defaultSettings, ...((tenant as any).pageSettings || {}) },
    };
  }

  // Endpoint publiczny - konfiguracja widgetu dla strony rezerwacji
  @Public()
  @Get(':id/widget-config')
  async getWidgetConfig(@Param('id') id: string) {
    const tenant = await this.tenantsService.findOne(id);
    if (!tenant) {
      throw new NotFoundException(`Tenant with id "${id}" not found`);
    }
    
    return {
      primaryColor: tenant.primaryColor || '#0F6048',
      accentColor: tenant.accentColor || '#10B981',
      widgetConfig: tenant.widgetConfig || {
        showServices: true,
        showEmployees: true,
        showPrices: true,
      },
    };
  }

  /**
   * Pobierz ustawienia zgód marketingowych i RODO
   * Endpoint publiczny - potrzebny dla widgetu rezerwacji
   */
  @Public()
  @Get(':id/consent-settings')
  async getConsentSettings(@Param('id') id: string) {
    const tenant = await this.tenantsService.findOne(id);
    if (!tenant) {
      throw new NotFoundException(`Tenant with id "${id}" not found`);
    }
    
    return {
      marketingConsentEnabled: tenant.marketing_consent_enabled || false,
      marketingConsentText: tenant.marketing_consent_text || '',
      rodoConsentText: tenant.rodo_consent_text || 'Wyrażam zgodę na przetwarzanie moich danych osobowych zgodnie z RODO w celu realizacji rezerwacji.',
    };
  }

  /**
   * Zaktualizuj ustawienia zgód marketingowych i RODO
   * Wymaga autoryzacji - tylko właściciel tenanta lub SUPER_ADMIN
   */
  @UseGuards(TenantAccessGuard)
  @Put(':id/consent-settings')
  async updateConsentSettings(
    @Param('id') id: string,
    @Body() data: {
      marketingConsentEnabled?: boolean;
      marketingConsentText?: string;
      rodoConsentText?: string;
    },
  ) {
    this.logger.debug(`PUT /api/tenants/${id}/consent-settings`);
    
    const tenant = await this.tenantsService.findOne(id);
    if (!tenant) {
      throw new NotFoundException(`Tenant with id "${id}" not found`);
    }
    
    const result = await this.tenantsService.update(id, {
      marketing_consent_enabled: data.marketingConsentEnabled,
      marketing_consent_text: data.marketingConsentText,
      rodo_consent_text: data.rodoConsentText,
    });
    
    this.logger.log(`Tenant ${id} consent settings updated`);
    
    return {
      marketingConsentEnabled: result.marketing_consent_enabled || false,
      marketingConsentText: result.marketing_consent_text || '',
      rodoConsentText: result.rodo_consent_text || '',
    };
  }

  /**
   * Pobierz listę klientów ze zgodą RODO (JSON)
   * Wymaga autoryzacji - tylko właściciel tenanta lub SUPER_ADMIN
   */
  @UseGuards(TenantAccessGuard)
  @Get(':id/customers-rodo')
  async getCustomersWithRodoConsent(@Param('id') id: string) {
    const customers = await this.prisma.customers.findMany({
      where: {
        tenantId: id,
        rodo_consent: true,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        rodo_consent: true,
        rodo_consent_date: true,
        createdAt: true,
      },
      orderBy: { rodo_consent_date: 'desc' },
    });

    return {
      total: customers.length,
      customers,
    };
  }

  /**
   * Pobierz listę klientów ze zgodą marketingową (JSON)
   * Wymaga autoryzacji - tylko właściciel tenanta lub SUPER_ADMIN
   */
  @UseGuards(TenantAccessGuard)
  @Get(':id/customers-marketing')
  async getCustomersWithMarketingConsent(@Param('id') id: string) {
    const customers = await this.prisma.customers.findMany({
      where: {
        tenantId: id,
        marketing_consent: true,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        marketing_consent: true,
        marketing_consent_date: true,
        marketing_consent_text: true,
        createdAt: true,
      },
      orderBy: { marketing_consent_date: 'desc' },
    });

    return {
      total: customers.length,
      customers,
    };
  }

  /**
   * Eksportuj klientów ze zgodą RODO do CSV
   * Wymaga autoryzacji - tylko właściciel tenanta lub SUPER_ADMIN
   */
  @UseGuards(TenantAccessGuard)
  @Get(':id/export-rodo-csv')
  async exportRodoConsentCsv(@Param('id') id: string, @Res() res: Response) {
    const customers = await this.prisma.customers.findMany({
      where: {
        tenantId: id,
        rodo_consent: true,
      },
      select: {
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        rodo_consent_date: true,
        createdAt: true,
      },
      orderBy: { rodo_consent_date: 'desc' },
    });

    // Generuj CSV
    const headers = ['Imię', 'Nazwisko', 'Email', 'Telefon', 'Data zgody RODO', 'Data rejestracji'];
    const rows = customers.map(c => [
      c.firstName || '',
      c.lastName || '',
      c.email || '',
      c.phone || '',
      c.rodo_consent_date ? new Date(c.rodo_consent_date).toLocaleString('pl-PL') : '',
      c.createdAt ? new Date(c.createdAt).toLocaleString('pl-PL') : '',
    ]);

    const csv = [
      headers.join(';'),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(';'))
    ].join('\n');

    const filename = `klienci-rodo-${new Date().toISOString().split('T')[0]}.csv`;
    
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send('\uFEFF' + csv); // BOM dla poprawnego kodowania w Excel
  }

  /**
   * Eksportuj klientów ze zgodą marketingową do CSV
   * Wymaga autoryzacji - tylko właściciel tenanta lub SUPER_ADMIN
   */
  @UseGuards(TenantAccessGuard)
  @Get(':id/export-marketing-csv')
  async exportMarketingConsentCsv(@Param('id') id: string, @Res() res: Response) {
    const customers = await this.prisma.customers.findMany({
      where: {
        tenantId: id,
        marketing_consent: true,
      },
      select: {
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        marketing_consent_date: true,
        createdAt: true,
      },
      orderBy: { marketing_consent_date: 'desc' },
    });

    // Generuj CSV
    const headers = ['Imię', 'Nazwisko', 'Email', 'Telefon', 'Data zgody marketingowej', 'Data rejestracji'];
    const rows = customers.map(c => [
      c.firstName || '',
      c.lastName || '',
      c.email || '',
      c.phone || '',
      c.marketing_consent_date ? new Date(c.marketing_consent_date).toLocaleString('pl-PL') : '',
      c.createdAt ? new Date(c.createdAt).toLocaleString('pl-PL') : '',
    ]);

    const csv = [
      headers.join(';'),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(';'))
    ].join('\n');

    const filename = `klienci-marketing-${new Date().toISOString().split('T')[0]}.csv`;
    
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send('\uFEFF' + csv); // BOM dla poprawnego kodowania w Excel
  }

  // Pobierz dane do faktury
  // Wymaga autoryzacji - tylko właściciel tenanta lub SUPER_ADMIN
  @UseGuards(TenantAccessGuard)
  @Get(':id/billing-data')
  async getBillingData(@Param('id') id: string, @Res({ passthrough: true }) res: Response) {
    // TenantAccessGuard już zweryfikował dostęp przez JWT

    // Użyj raw query dla nowych pól
    const result = await this.prisma.$queryRaw<any[]>`
      SELECT nip, billing_company_name, billing_address, billing_postal_code, 
             billing_city, billing_email, billing_type, billing_first_name, billing_last_name
      FROM tenants WHERE id = ${id}
    `;

    if (!result || result.length === 0) {
      throw new NotFoundException('Tenant nie znaleziony');
    }

    const tenant = result[0];

    return {
      billingType: tenant.billing_type || 'company',
      nip: tenant.nip || '',
      billingCompanyName: tenant.billing_company_name || '',
      billingFirstName: tenant.billing_first_name || '',
      billingLastName: tenant.billing_last_name || '',
      billingAddress: tenant.billing_address || '',
      billingPostalCode: tenant.billing_postal_code || '',
      billingCity: tenant.billing_city || '',
      billingEmail: tenant.billing_email || '',
    };
  }

  // Zapisz dane do faktury
  // Wymaga autoryzacji - tylko właściciel tenanta lub SUPER_ADMIN
  @UseGuards(TenantAccessGuard)
  @Put(':id/billing-data')
  async updateBillingData(
    @Param('id') id: string,
    @Body() body: {
      billingType?: 'company' | 'individual';
      billingCompanyName?: string;
      billingFirstName?: string;
      billingLastName?: string;
      nip?: string;
      billingVatId?: string; // EU VAT ID for bookings24.eu
      billingAddress?: string;
      billingPostalCode?: string;
      billingCity?: string;
      billingCountry?: string;
      billingEmail?: string;
      // Alternative field names from frontend
      billing_company_name?: string;
      billing_vat_id?: string;
      billing_type?: string;
    },
    @Res({ passthrough: true }) res: Response
  ) {
    // TenantAccessGuard już zweryfikował dostęp przez JWT

    const tenant = await this.prisma.tenants.findUnique({
      where: { id },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant nie znaleziony');
    }

    // Normalize field names (support both camelCase and snake_case)
    const billingType = body.billingType || body.billing_type || 'company';
    const companyName = body.billingCompanyName || body.billing_company_name;
    const vatId = body.billingVatId || body.billing_vat_id;

    // Walidacja NIP jeśli podany i typ to firma (dla PL)
    if (billingType === 'company' && body.nip) {
      const cleanNip = body.nip.replace(/[-\s]/g, '');
      if (cleanNip.length !== 10 || !/^\d{10}$/.test(cleanNip)) {
        throw new BadRequestException('Nieprawidłowy format NIP');
      }
    }

    // Użyj raw query dla nowych pól
    await this.prisma.$executeRaw`
      UPDATE tenants SET
        billing_type = ${billingType},
        billing_company_name = ${companyName || null},
        billing_first_name = ${body.billingFirstName || null},
        billing_last_name = ${body.billingLastName || null},
        nip = ${billingType === 'company' ? (body.nip || null) : null},
        billing_vat_id = ${vatId || null},
        billing_address = ${body.billingAddress || null},
        billing_postal_code = ${body.billingPostalCode || null},
        billing_city = ${body.billingCity || null},
        billing_country = ${body.billingCountry || null},
        billing_email = ${body.billingEmail || null},
        "updatedAt" = NOW()
      WHERE id = ${id}
    `;

    this.logger.log(`Zaktualizowano dane do faktury dla tenant ${id} (typ: ${body.billingType})`);

    return {
      success: true,
      message: 'Dane do faktury zostały zapisane',
    };
  }
}
