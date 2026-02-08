import { Injectable, UnauthorizedException, ConflictException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../common/prisma/prisma.service';
import { SubdomainSetupService } from '../common/services/subdomain-setup.service';
import { EmailService } from '../email/email.service';
import { TwoFactorService } from './two-factor.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private subdomainSetup: SubdomainSetupService,
    private emailService: EmailService,
    private twoFactorService: TwoFactorService,
  ) {}

  async login(email: string, password: string, twoFactorCode?: string, profileType?: 'owner' | 'employee') {
    this.logger.log(`🔐 Login attempt for: ${email}, profileType: ${profileType || 'auto'}`);
    
    // Znajdź użytkownika (właściciela firmy)
    const user = await this.prisma.users.findUnique({
      where: { email },
      include: {
        tenant_users: {
          include: {
            tenants: true,
          },
        },
      },
    });

    // Znajdź konto pracownika
    const employeeAccount = await this.prisma.employee_accounts.findFirst({
      where: { email: email.toLowerCase(), isActive: true },
      include: {
        employee: true,
        tenant: true,
        permissions: true,
      },
    });

    // Jeśli nie znaleziono żadnego konta
    if (!user && !employeeAccount) {
      throw new UnauthorizedException('Nieprawidłowy email lub hasło');
    }

    this.logger.log(`Found user: ${!!user}, Found employee account: ${!!employeeAccount}`);

    // Jeśli oba konta istnieją i nie wybrano profilu - sprawdź hasła i pokaż wybór
    if (user && employeeAccount && !profileType) {
      this.logger.log(`Both accounts exist for ${email}, checking passwords...`);
      // Sprawdź hasła obu kont
      let ownerPasswordValid = false;
      let employeePasswordValid = false;

      if (user.passwordHash) {
        try {
          ownerPasswordValid = await bcrypt.compare(password, user.passwordHash);
        } catch (e) {
          ownerPasswordValid = user.passwordHash === password;
        }
      }

      if (employeeAccount.passwordHash) {
        try {
          employeePasswordValid = await bcrypt.compare(password, employeeAccount.passwordHash);
        } catch (e) {
          employeePasswordValid = employeeAccount.passwordHash === password;
        }
      }

      this.logger.log(`Owner password valid: ${ownerPasswordValid}, Employee password valid: ${employeePasswordValid}`);

      // Jeśli przynajmniej jedno hasło jest poprawne - pokaż wybór profilu
      // (użytkownik ma oba konta, niech sam wybierze)
      if (ownerPasswordValid || employeePasswordValid) {
        this.logger.log(`At least one password valid - showing profile selection`);
        return {
          requiresProfileSelection: true,
          profiles: [
            {
              type: 'owner',
              label: 'Właściciel firmy',
              businessName: user.tenant_users[0]?.tenants?.name || 'Twoja firma',
              email: user.email,
              passwordValid: ownerPasswordValid,
            },
            {
              type: 'employee',
              label: 'Pracownik',
              businessName: employeeAccount.tenant?.name || 'Firma',
              employeeName: `${employeeAccount.employee?.firstName} ${employeeAccount.employee?.lastName}`,
              email: employeeAccount.email,
              passwordValid: employeePasswordValid,
            },
          ],
        };
      }

      // Żadne hasło nie pasuje
      throw new UnauthorizedException('Nieprawidłowy email lub hasło');
    }

    // Jeśli tylko konto właściciela istnieje
    if (user && !employeeAccount && !profileType) {
      // Sprawdź hasło właściciela
      let ownerPasswordValid = false;
      if (user.passwordHash) {
        try {
          ownerPasswordValid = await bcrypt.compare(password, user.passwordHash);
        } catch (e) {
          ownerPasswordValid = user.passwordHash === password;
        }
      }
      if (!ownerPasswordValid) {
        throw new UnauthorizedException('Nieprawidłowy email lub hasło');
      }
      profileType = 'owner';
    }

    // Jeśli tylko konto pracownika istnieje
    if (!user && employeeAccount && !profileType) {
      profileType = 'employee';
    }

    // Logowanie jako pracownik
    if (profileType === 'employee' || (!user && employeeAccount)) {
      return this.loginAsEmployee(employeeAccount!, password);
    }

    // Logowanie jako właściciel (domyślne)
    if (!user) {
      throw new UnauthorizedException('Nieprawidłowy email lub hasło');
    }

    // Sprawdź hasło
    let isPasswordValid = false;
    if (user.passwordHash) {
      try {
        isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      } catch (error) {
        this.logger.error(`Bcrypt error: ${error.message}`);
        isPasswordValid = user.passwordHash === password;
      }
    } else {
      throw new UnauthorizedException('Nieprawidłowy email lub hasło');
    }

    if (!isPasswordValid) {
      throw new UnauthorizedException('Nieprawidłowy email lub hasło');
    }

    // Sprawdź czy użytkownik ma włączone 2FA
    if (user.twoFactorEnabled) {
      // Jeśli nie podano kodu 2FA, wyślij kod na email i zwróć tymczasowy token
      if (!twoFactorCode) {
        // Wyślij kod na email
        await this.twoFactorService.sendVerificationCode(user.id);
        
        const tempPayload = {
          sub: user.id,
          email: user.email,
          type: '2fa_pending',
        };
        const tempToken = this.jwtService.sign(tempPayload, { expiresIn: '10m' });
        
        return {
          requiresTwoFactor: true,
          tempToken,
          message: 'Kod weryfikacyjny został wysłany na email',
        };
      }

      // Weryfikuj kod 2FA
      const isValidCode = await this.twoFactorService.verifyCode(user.id, twoFactorCode);
      if (!isValidCode) {
        throw new UnauthorizedException('Nieprawidłowy kod weryfikacyjny');
      }
    }

    // Pobierz tenant użytkownika
    const userTenant = user.tenant_users[0];
    const tenantId = userTenant?.tenantId || null;
    
    if (!userTenant && user.role !== 'SUPER_ADMIN') {
      throw new UnauthorizedException('Użytkownik nie ma przypisanego salonu');
    }

    // Aktualizuj lastLoginAt
    await this.prisma.users.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generuj token JWT
    const payload = {
      sub: user.id,
      email: user.email,
      tenantId: tenantId,
      role: user.role,
    };

    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        tenantId: tenantId,
        tenant: userTenant?.tenants || null,
        twoFactorEnabled: user.twoFactorEnabled,
      },
    };
  }

  /**
   * Logowanie jako pracownik
   */
  private async loginAsEmployee(account: any, password: string) {
    // Sprawdź hasło
    let isPasswordValid = false;
    if (account.passwordHash) {
      try {
        isPasswordValid = await bcrypt.compare(password, account.passwordHash);
      } catch (error) {
        this.logger.error(`Bcrypt error: ${error.message}`);
        isPasswordValid = account.passwordHash === password;
      }
    }

    if (!isPasswordValid) {
      throw new UnauthorizedException('Nieprawidłowy email lub hasło');
    }

    // Aktualizuj lastLoginAt
    await this.prisma.employee_accounts.update({
      where: { id: account.id },
      data: { lastLoginAt: new Date() },
    });

    // Generuj token JWT dla pracownika
    const payload = {
      sub: account.id,
      email: account.email,
      tenantId: account.tenantId,
      role: 'EMPLOYEE',
      employeeId: account.employeeId,
      type: 'employee',
    };

    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: account.id,
        email: account.email,
        firstName: account.employee?.firstName,
        lastName: account.employee?.lastName,
        role: 'EMPLOYEE',
        tenantId: account.tenantId,
        employeeId: account.employeeId,
        tenant: account.tenant,
        permissions: account.permissions,
        type: 'employee',
      },
    };
  }

  /**
   * Weryfikacja kodu 2FA podczas logowania (drugi krok)
   */
  async verifyTwoFactorLogin(tempToken: string, code: string) {
    try {
      // Weryfikuj tymczasowy token
      const decoded = this.jwtService.verify(tempToken);
      
      if (decoded.type !== '2fa_pending') {
        throw new UnauthorizedException('Nieprawidłowy token');
      }

      // Weryfikuj kod 2FA
      const isValidCode = await this.twoFactorService.verifyCode(decoded.sub, code);
      if (!isValidCode) {
        throw new UnauthorizedException('Nieprawidłowy kod weryfikacyjny');
      }

      // Pobierz użytkownika
      const user = await this.prisma.users.findUnique({
        where: { id: decoded.sub },
        include: {
          tenant_users: {
            include: {
              tenants: true,
            },
          },
        },
      });

      if (!user) {
        throw new UnauthorizedException('Użytkownik nie znaleziony');
      }

      const userTenant = user.tenant_users[0];
      const tenantId = userTenant?.tenantId || null;

      // Generuj pełny token JWT
      const payload = {
        sub: user.id,
        email: user.email,
        tenantId: tenantId,
        role: user.role,
      };

      const access_token = this.jwtService.sign(payload);

      return {
        access_token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          tenantId: tenantId,
          tenant: userTenant?.tenants || null,
          twoFactorEnabled: user.twoFactorEnabled,
        },
      };
    } catch (error) {
      this.logger.error('2FA verification error:', error);
      throw new UnauthorizedException('Weryfikacja 2FA nie powiodła się');
    }
  }

  async register(data: {
    firstName: string;
    lastName: string;
    email: string;
    businessName: string;
    password: string;
    plan?: string; // starter, standard, pro
    referralCode?: string; // Kod partnera polecającego
  }) {
    this.logger.log(`📝 Registration attempt for: ${data.email}`);

    // Sprawdź czy użytkownik już istnieje
    const existingUser = await this.prisma.users.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictException('Użytkownik z tym adresem email już istnieje');
    }

    // Hashuj hasło
    const passwordHash = await bcrypt.hash(data.password, 10);

    // Utwórz subdomenę z nazwy firmy
    const subdomain = data.businessName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 50) + '-' + Date.now().toString().substring(8);

    // Sprawdź kod partnerski (jeśli podany)
    let partnerData: { id: string; referralDiscount: any; discountMonths: number } | null = null;
    if (data.referralCode) {
      const partner = await this.prisma.partners.findUnique({
        where: { referralCode: data.referralCode },
      });
      if (partner && partner.status === 'ACTIVE') {
        partnerData = {
          id: partner.id,
          referralDiscount: partner.referralDiscount,
          discountMonths: partner.discountMonths,
        };
        this.logger.log(`🤝 Registration with partner referral: ${data.referralCode}`);
      }
    }

    // Utwórz użytkownika i tenant w transakcji
    const result = await this.prisma.$transaction(async (prisma) => {
      // 1. Utwórz użytkownika
      const user = await prisma.users.create({
        data: {
          id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          email: data.email,
          passwordHash,
          firstName: data.firstName,
          lastName: data.lastName,
          role: 'TENANT_OWNER',
          emailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      // 2. Utwórz tenant (firmę) z domyślnymi godzinami otwarcia
      const defaultOpeningHours = {
        monday: { open: '09:00', close: '18:00', closed: false },
        tuesday: { open: '09:00', close: '18:00', closed: false },
        wednesday: { open: '09:00', close: '18:00', closed: false },
        thursday: { open: '09:00', close: '18:00', closed: false },
        friday: { open: '09:00', close: '18:00', closed: false },
        saturday: { open: '10:00', close: '16:00', closed: false },
        sunday: { closed: true }
      };

      // Oblicz datę końca rabatu partnerskiego
      const referralDiscountEndsAt = partnerData 
        ? new Date(Date.now() + partnerData.discountMonths * 30 * 24 * 60 * 60 * 1000)
        : null;

      const tenant = await prisma.tenants.create({
        data: {
          id: `tenant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: data.businessName,
          subdomain,
          email: data.email,
          ownerId: user.id,
          isActive: true,
          isSuspended: false,
          openingHours: defaultOpeningHours,
          // Dane partnera polecającego
          referredByPartnerId: partnerData?.id || null,
          referralDiscountPercent: partnerData?.referralDiscount || null,
          referralDiscountEndsAt: referralDiscountEndsAt,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      // 3. Połącz użytkownika z tenantem
      await prisma.tenant_users.create({
        data: {
          id: `tu-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          tenantId: tenant.id,
          userId: user.id,
          role: 'TENANT_OWNER',
          createdAt: new Date(),
        },
      });

      // 4. Utwórz subskrypcję TRIAL (7 dni bez karty)
      const trialDays = 7;
      const now = new Date();
      const trialEnd = new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000);
      
      // Pobierz plan na podstawie parametru lub domyślny (Starter)
      let selectedPlan = null;
      
      if (data.plan) {
        // Mapowanie nazw planów z URL na slug w bazie
        const planSlugMap: Record<string, string> = {
          'starter': 'starter',
          'standard': 'standard',
          'professional': 'standard', // alias
          'pro': 'pro',
          'business': 'pro', // alias
        };
        
        const planSlug = planSlugMap[data.plan.toLowerCase()];
        if (planSlug) {
          selectedPlan = await prisma.subscription_plans.findFirst({
            where: { slug: planSlug, isActive: true },
          });
        }
      }
      
      // Jeśli nie znaleziono planu z parametru, użyj domyślnego (najtańszego)
      if (!selectedPlan) {
        selectedPlan = await prisma.subscription_plans.findFirst({
          where: { isActive: true },
          orderBy: { priceMonthly: 'asc' },
        });
      }

      if (selectedPlan) {
        await prisma.subscriptions.create({
          data: {
            id: `sub-trial-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            tenantId: tenant.id,
            planId: selectedPlan.id,
            status: 'TRIALING',
            stripeCustomerId: `pending-${tenant.id}`, // Placeholder - zostanie zaktualizowany przy dodaniu karty
            stripeSubscriptionId: null,
            currentPeriodStart: now,
            currentPeriodEnd: trialEnd,
            trialStart: now,
            trialEnd: trialEnd,
            cancelAtPeriodEnd: false,
            createdAt: now,
            updatedAt: now,
          },
        });
        
        this.logger.log(`📋 Assigned plan: ${selectedPlan.name} (${selectedPlan.slug}) to tenant ${tenant.id}`);
      }

      return { user, tenant };
    });

    this.logger.log(`✅ Created user ${result.user.id} and tenant ${result.tenant.id}`);

    // 🤝 Utwórz konwersję partnerską (jeśli był kod polecający)
    if (partnerData) {
      this.prisma.partner_conversions.create({
        data: {
          partnerId: partnerData.id,
          tenantId: result.tenant.id,
          status: 'REGISTERED',
        },
      }).then(() => {
        // Zwiększ licznik rejestracji partnera
        return this.prisma.partners.update({
          where: { id: partnerData.id },
          data: { totalRegistrations: { increment: 1 } },
        });
      }).catch(err => {
        this.logger.error(`Failed to create partner conversion:`, err);
      });
    }

    // Automatycznie skonfiguruj subdomenę (nginx + SSL) w tle
    this.subdomainSetup.setupSubdomain(subdomain).catch(err => {
      this.logger.error(`Failed to setup subdomain ${subdomain}:`, err);
    });

    // 📧 Wyślij email powitalny
    this.emailService.sendWelcomeEmail(data.email, {
      name: data.firstName,
      companyName: data.businessName,
      subdomain: subdomain,
    }).catch(err => {
      this.logger.error(`Failed to send welcome email:`, err);
    });

    // 📧 Powiadom admina o nowej rejestracji
    this.emailService.sendAdminNewUserNotification({
      userEmail: data.email,
      userName: `${data.firstName} ${data.lastName}`,
      businessName: data.businessName,
      subdomain: subdomain,
      registeredAt: new Date(),
    }).catch(err => {
      this.logger.error(`Failed to send admin notification:`, err);
    });

    // Generuj token JWT
    const payload = {
      sub: result.user.id,
      email: result.user.email,
      tenantId: result.tenant.id,
    };

    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: result.user.id,
        email: result.user.email,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        tenantId: result.tenant.id,
        tenant: result.tenant,
      },
    };
  }

  async googleLogin(googleUser: any) {
    this.logger.log(`🔐 Google OAuth login for: ${googleUser.email}`);

    // Sprawdź czy użytkownik już istnieje (po email lub googleId)
    let user = await this.prisma.users.findFirst({
      where: {
        OR: [
          { email: googleUser.email },
          { googleId: googleUser.googleId },
        ],
      },
      include: {
        tenant_users: {
          include: {
            tenants: true,
          },
        },
      },
    });

    // Jeśli użytkownik istnieje ale nie ma googleId, połącz konta
    if (user && !user.googleId && googleUser.googleId) {
      this.logger.log(`🔗 Linking Google account to existing user: ${user.email}`);
      await this.prisma.users.update({
        where: { id: user.id },
        data: { 
          googleId: googleUser.googleId,
          updatedAt: new Date(),
        },
      });
    }

    // Jeśli użytkownik nie istnieje, utwórz nowe konto
    if (!user) {
      this.logger.log(`Creating new user from Google OAuth: ${googleUser.email}`);

      // Utwórz subdomenę z email (przed @)
      const emailPrefix = googleUser.email.split('@')[0];
      const subdomain = emailPrefix
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 50) + '-' + Date.now().toString().substring(8);

      // Utwórz użytkownika i tenant w transakcji
      const result = await this.prisma.$transaction(async (prisma) => {
        // 1. Utwórz użytkownika
        const newUser = await prisma.users.create({
          data: {
            id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            email: googleUser.email,
            firstName: googleUser.firstName,
            lastName: googleUser.lastName,
            googleId: googleUser.googleId,
            role: 'TENANT_OWNER',
            emailVerified: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });

        // 2. Utwórz tenant (firmę) z domyślnymi godzinami otwarcia
        const defaultOpeningHours = {
          monday: { open: '09:00', close: '18:00', closed: false },
          tuesday: { open: '09:00', close: '18:00', closed: false },
          wednesday: { open: '09:00', close: '18:00', closed: false },
          thursday: { open: '09:00', close: '18:00', closed: false },
          friday: { open: '09:00', close: '18:00', closed: false },
          saturday: { open: '10:00', close: '16:00', closed: false },
          sunday: { closed: true }
        };

        const businessName = `${googleUser.firstName} ${googleUser.lastName}`;
        const tenant = await prisma.tenants.create({
          data: {
            id: `tenant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: businessName,
            subdomain,
            email: googleUser.email,
            ownerId: newUser.id,
            isActive: true,
            isSuspended: false,
            openingHours: defaultOpeningHours,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });

        // 3. Połącz użytkownika z tenantem
        await prisma.tenant_users.create({
          data: {
            id: `tu-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            tenantId: tenant.id,
            userId: newUser.id,
            role: 'TENANT_OWNER',
            createdAt: new Date(),
          },
        });

        // 4. Utwórz subskrypcję TRIAL (7 dni bez karty)
        const trialDays = 7;
        const now = new Date();
        const trialEnd = new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000);
        
        // Pobierz domyślny plan (Starter lub pierwszy aktywny)
        const defaultPlan = await prisma.subscription_plans.findFirst({
          where: { isActive: true },
          orderBy: { priceMonthly: 'asc' },
        });

        if (defaultPlan) {
          await prisma.subscriptions.create({
            data: {
              id: `sub-trial-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              tenantId: tenant.id,
              planId: defaultPlan.id,
              status: 'TRIALING',
              stripeCustomerId: `pending-${tenant.id}`, // Placeholder - zostanie zaktualizowany przy dodaniu karty
              stripeSubscriptionId: null,
              currentPeriodStart: now,
              currentPeriodEnd: trialEnd,
              trialStart: now,
              trialEnd: trialEnd,
              cancelAtPeriodEnd: false,
              createdAt: now,
              updatedAt: now,
            },
          });
        }

        return { user: newUser, tenant };
      });

      this.logger.log(`✅ Created user ${result.user.id} and tenant ${result.tenant.id} from Google OAuth`);

      // Automatycznie skonfiguruj subdomenę (nginx + SSL) w tle
      this.subdomainSetup.setupSubdomain(subdomain).catch(err => {
        this.logger.error(`Failed to setup subdomain ${subdomain}:`, err);
      });

      // 📧 Wyślij email powitalny
      this.emailService.sendWelcomeEmail(googleUser.email, {
        name: googleUser.firstName,
        companyName: result.tenant.name,
        subdomain: subdomain,
      }).catch(err => {
        this.logger.error(`Failed to send welcome email:`, err);
      });

      // Pobierz pełne dane użytkownika z relacjami
      user = await this.prisma.users.findUnique({
        where: { id: result.user.id },
        include: {
          tenant_users: {
            include: {
              tenants: true,
            },
          },
        },
      });
    }

    // Pobierz tenant użytkownika
    const userTenant = user.tenant_users[0];
    if (!userTenant && user.role !== 'SUPER_ADMIN') {
      throw new UnauthorizedException('Użytkownik nie ma przypisanego salonu');
    }

    const tenantId = userTenant?.tenantId || null;

    // Generuj token JWT
    const payload = {
      sub: user.id,
      email: user.email,
      tenantId: tenantId,
      role: user.role,
    };

    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        tenantId: tenantId,
        tenant: userTenant?.tenants || null,
      },
    };
  }

  /**
   * Wysyła email z linkiem do resetu hasła
   * Używa JWT token (bez zmian w bazie danych)
   */
  async forgotPassword(email: string) {
    this.logger.log(`🔐 Password reset request for: ${email}`);

    const user = await this.prisma.users.findUnique({
      where: { email },
    });

    // Zawsze zwracamy sukces (bezpieczeństwo - nie ujawniamy czy email istnieje)
    if (!user) {
      this.logger.warn(`Password reset requested for non-existent email: ${email}`);
      return { message: 'Jeśli konto istnieje, wysłaliśmy link do resetu hasła.' };
    }

    // Generuj JWT token resetu (ważny 1 godzinę)
    const resetToken = this.jwtService.sign(
      { sub: user.id, email: user.email, type: 'password-reset' },
      { expiresIn: '1h' }
    );

    // Wyślij email z linkiem
    const frontendUrl = process.env.FRONTEND_URL || 'https://rezerwacja24.pl';
    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

    await this.emailService.sendPasswordResetEmail(email, {
      name: user.firstName || 'Użytkowniku',
      resetLink,
      expiresIn: '1 godzinę',
    });

    this.logger.log(`✅ Password reset email sent to: ${email}`);

    return { message: 'Jeśli konto istnieje, wysłaliśmy link do resetu hasła.' };
  }

  /**
   * Resetuje hasło użytkownika
   * Weryfikuje JWT token
   */
  async resetPassword(token: string, newPassword: string) {
    this.logger.log(`🔐 Password reset attempt with token`);

    try {
      // Weryfikuj JWT token
      const payload = this.jwtService.verify(token);
      
      if (payload.type !== 'password-reset') {
        throw new UnauthorizedException('Nieprawidłowy token');
      }

      const user = await this.prisma.users.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('Użytkownik nie istnieje');
      }

      // Hashuj nowe hasło
      const passwordHash = await bcrypt.hash(newPassword, 10);

      // Zaktualizuj hasło
      await this.prisma.users.update({
        where: { id: user.id },
        data: {
          passwordHash,
          updatedAt: new Date(),
        },
      });

      this.logger.log(`✅ Password reset successful for user: ${user.id}`);

      return { message: 'Hasło zostało zmienione. Możesz się teraz zalogować.' };
    } catch (error) {
      this.logger.error(`Password reset failed: ${error.message}`);
      throw new UnauthorizedException('Token jest nieprawidłowy lub wygasł');
    }
  }
}
