import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { SubdomainSetupService } from '../common/services/subdomain-setup.service';

@Injectable()
export class TenantsService {
  private readonly logger = new Logger(TenantsService.name);

  constructor(
    private prisma: PrismaService,
    private subdomainSetup: SubdomainSetupService,
  ) {}

  async subdomainExists(subdomain: string): Promise<boolean> {
    const tenant = await this.prisma.tenants.findUnique({
      where: { subdomain },
      select: { id: true },
    });
    return !!tenant;
  }

  async findBySubdomain(subdomain: string) {
    return this.prisma.tenants.findUnique({
      where: { subdomain },
      include: {
        tenant_users: {
          take: 1,
          select: {
            id: true,
            userId: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.tenants.findUnique({
      where: { id },
      include: {
        tenant_users: {
          take: 1,
          select: {
            id: true,
            userId: true,
          },
        },
      },
    });
  }

  async update(id: string, data: any) {
    // Jeśli zmienia się subdomena, sprawdź czy jest dostępna
    if (data.subdomain) {
      const currentTenant = await this.prisma.tenants.findUnique({
        where: { id },
        select: { subdomain: true, subdomainLocked: true },
      });

      if (!currentTenant) {
        throw new BadRequestException('Firma nie znaleziona');
      }

      // Sprawdź czy subdomena jest zablokowana
      if (currentTenant.subdomainLocked && currentTenant.subdomain !== data.subdomain) {
        throw new BadRequestException('Subdomena jest zablokowana i nie może być zmieniona');
      }

      // Jeśli subdomena się zmienia
      if (currentTenant.subdomain !== data.subdomain) {
        // Sprawdź czy nowa subdomena jest zajęta
        const exists = await this.subdomainExists(data.subdomain);
        if (exists) {
          throw new BadRequestException('Ta subdomena jest już zajęta');
        }

        this.logger.log(`🔄 Zmiana subdomeny: ${currentTenant.subdomain} → ${data.subdomain}`);
        
        // Zablokuj subdomenę po pierwszej zmianie
        data.subdomainLocked = true;
        
        // Usuń starą subdomenę i utwórz nową (w tle)
        this.subdomainSetup.changeSubdomain(currentTenant.subdomain, data.subdomain).catch(err => {
          this.logger.error(`Błąd podczas zmiany subdomeny ${currentTenant.subdomain} → ${data.subdomain}:`, err);
        });
      }
    }

    this.logger.debug(`Updating tenant ${id} with data keys: ${Object.keys(data).join(', ')}`);
    this.logger.debug(`pageSettings value: ${JSON.stringify(data.pageSettings)}`);
    
    const result = await this.prisma.tenants.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
    
    this.logger.debug(`Updated tenant pageSettings: ${JSON.stringify((result as any).pageSettings)}`);
    return result;
  }

  async updateBranding(id: string, data: { logo?: string; banner?: string }) {
    return this.prisma.tenants.update({
      where: { id },
      data: {
        logo: data.logo,
        banner: data.banner,
      },
    });
  }

  async updateWidgetConfig(id: string, data: { 
    primaryColor?: string; 
    accentColor?: string;
    showServices?: boolean;
    showEmployees?: boolean;
    showPrices?: boolean;
  }) {
    // Pobierz aktualną konfigurację widgetu
    const tenant = await this.prisma.tenants.findUnique({
      where: { id },
      select: { widgetConfig: true },
    });

    const currentConfig = (tenant?.widgetConfig as any) || {};
    
    // Połącz z nowymi ustawieniami
    const newWidgetConfig = {
      showServices: data.showServices ?? currentConfig.showServices ?? true,
      showEmployees: data.showEmployees ?? currentConfig.showEmployees ?? true,
      showPrices: data.showPrices ?? currentConfig.showPrices ?? true,
    };

    return this.prisma.tenants.update({
      where: { id },
      data: {
        primaryColor: data.primaryColor,
        accentColor: data.accentColor,
        widgetConfig: newWidgetConfig,
        updatedAt: new Date(),
      },
    });
  }

  async updatePageSettings(id: string, pageSettings: {
    servicesLayout?: 'grid' | 'list';
    showServiceImages?: boolean;
    showServicePrices?: boolean;
    showServiceDuration?: boolean;
    showEmployeeSelection?: boolean;
    showOpeningHours?: boolean;
    showSocialMedia?: boolean;
    showDescription?: boolean;
    showAddress?: boolean;
    showPhone?: boolean;
    showEmail?: boolean;
    primaryColor?: string;
    accentColor?: string;
    heroStyle?: 'banner' | 'minimal' | 'none';
    bookingButtonText?: string;
    buttonStyle?: 'rounded' | 'pill' | 'square';
    cardStyle?: 'shadow' | 'border' | 'flat';
    pageBuilder?: any;
    bookingAdvanceDays?: number; // Maksymalne wyprzedzenie rezerwacji (0 = bez limitu)
    minCancellationHours?: number; // Minimalny czas przed anulowaniem/przesunięciem (0 = bez ograniczeń)
  }) {
    // Pobierz aktualne ustawienia
    const tenant = await this.prisma.tenants.findUnique({
      where: { id },
      select: { pageSettings: true },
    });

    const currentSettings = (tenant?.pageSettings as any) || {};
    
    // Połącz z nowymi ustawieniami (zachowaj istniejące wartości jeśli nie podano nowych)
    const newPageSettings = {
      servicesLayout: pageSettings.servicesLayout ?? currentSettings.servicesLayout ?? 'grid',
      showServiceImages: pageSettings.showServiceImages ?? currentSettings.showServiceImages ?? true,
      showServicePrices: pageSettings.showServicePrices ?? currentSettings.showServicePrices ?? true,
      showServiceDuration: pageSettings.showServiceDuration ?? currentSettings.showServiceDuration ?? true,
      showEmployeeSelection: pageSettings.showEmployeeSelection ?? currentSettings.showEmployeeSelection ?? true,
      showOpeningHours: pageSettings.showOpeningHours ?? currentSettings.showOpeningHours ?? true,
      showSocialMedia: pageSettings.showSocialMedia ?? currentSettings.showSocialMedia ?? true,
      showDescription: pageSettings.showDescription ?? currentSettings.showDescription ?? true,
      showAddress: pageSettings.showAddress ?? currentSettings.showAddress ?? true,
      showPhone: pageSettings.showPhone ?? currentSettings.showPhone ?? true,
      showEmail: pageSettings.showEmail ?? currentSettings.showEmail ?? true,
      primaryColor: pageSettings.primaryColor ?? currentSettings.primaryColor ?? '#0F6048',
      accentColor: pageSettings.accentColor ?? currentSettings.accentColor ?? '#41FFBC',
      heroStyle: pageSettings.heroStyle ?? currentSettings.heroStyle ?? 'banner',
      bookingButtonText: pageSettings.bookingButtonText ?? currentSettings.bookingButtonText ?? 'Zarezerwuj',
      buttonStyle: pageSettings.buttonStyle ?? currentSettings.buttonStyle ?? 'rounded',
      cardStyle: pageSettings.cardStyle ?? currentSettings.cardStyle ?? 'shadow',
      pageBuilder: pageSettings.pageBuilder ?? currentSettings.pageBuilder ?? null,
      bookingAdvanceDays: pageSettings.bookingAdvanceDays ?? currentSettings.bookingAdvanceDays ?? 0,
      minCancellationHours: pageSettings.minCancellationHours ?? currentSettings.minCancellationHours ?? 0,
    };

    return this.prisma.tenants.update({
      where: { id },
      data: {
        pageSettings: newPageSettings,
        updatedAt: new Date(),
      },
    });
  }
}
