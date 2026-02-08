/**
 * Skrypt do utworzenia użytkownika l.grubicki@dobrcz.pl
 * i wysłania linku do resetu hasła
 * 
 * Uruchom: npx ts-node scripts/create-user-dobrcz.ts
 */

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

async function main() {
  const email = 'l.grubicki@dobrcz.pl';
  const firstName = 'Łukasz';
  const lastName = 'Grubicki';
  const businessName = 'Dobrcz';
  
  console.log(`\n🔧 Tworzenie użytkownika: ${email}\n`);

  // Sprawdź czy użytkownik już istnieje
  const existingUser = await prisma.users.findUnique({
    where: { email },
    include: {
      tenant_users: {
        include: {
          tenants: true,
        },
      },
    },
  });

  if (existingUser) {
    console.log(`⚠️  Użytkownik ${email} już istnieje!`);
    console.log(`   ID: ${existingUser.id}`);
    console.log(`   Rola: ${existingUser.role}`);
    
    if (existingUser.tenant_users.length > 0) {
      console.log(`   Tenant: ${existingUser.tenant_users[0].tenants.name}`);
      console.log(`   Subdomena: ${existingUser.tenant_users[0].tenants.subdomain}`);
    }
    
    // Generuj link do resetu hasła
    const jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
    const resetToken = jwt.sign(
      { sub: existingUser.id, email: existingUser.email, type: 'password-reset' },
      jwtSecret,
      { expiresIn: '24h' }
    );
    
    const resetLink = `https://app.rezerwacja24.pl/reset-password?token=${resetToken}`;
    
    console.log(`\n📧 Link do resetu hasła (ważny 24h):`);
    console.log(`   ${resetLink}\n`);
    
    return;
  }

  // Utwórz tymczasowe hasło (użytkownik je zresetuje)
  const tempPassword = `Temp${Date.now().toString().slice(-6)}!`;
  const passwordHash = await bcrypt.hash(tempPassword, 10);

  // Utwórz subdomenę
  const subdomain = businessName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50) + '-' + Date.now().toString().substring(8);

  // Utwórz użytkownika i tenant w transakcji
  const result = await prisma.$transaction(async (tx) => {
    // 1. Utwórz użytkownika
    const user = await tx.users.create({
      data: {
        id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        email,
        passwordHash,
        firstName,
        lastName,
        role: 'TENANT_OWNER',
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // 2. Utwórz tenant (firmę)
    const defaultOpeningHours = {
      monday: { open: '09:00', close: '18:00', closed: false },
      tuesday: { open: '09:00', close: '18:00', closed: false },
      wednesday: { open: '09:00', close: '18:00', closed: false },
      thursday: { open: '09:00', close: '18:00', closed: false },
      friday: { open: '09:00', close: '18:00', closed: false },
      saturday: { open: '10:00', close: '16:00', closed: false },
      sunday: { closed: true }
    };

    const tenant = await tx.tenants.create({
      data: {
        id: `tenant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: businessName,
        subdomain,
        email,
        ownerId: user.id,
        isActive: true,
        isSuspended: false,
        openingHours: defaultOpeningHours,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // 3. Połącz użytkownika z tenantem
    await tx.tenant_users.create({
      data: {
        id: `tu-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        tenantId: tenant.id,
        userId: user.id,
        role: 'TENANT_OWNER',
        createdAt: new Date(),
      },
    });

    // 4. Utwórz subskrypcję TRIAL (14 dni)
    const trialDays = 14;
    const now = new Date();
    const trialEnd = new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000);
    
    // Pobierz domyślny plan (Starter)
    const defaultPlan = await tx.subscription_plans.findFirst({
      where: { isActive: true },
      orderBy: { priceMonthly: 'asc' },
    });

    if (defaultPlan) {
      await tx.subscriptions.create({
        data: {
          id: `sub-trial-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          tenantId: tenant.id,
          planId: defaultPlan.id,
          status: 'TRIALING',
          stripeCustomerId: `pending-${tenant.id}`,
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

    return { user, tenant };
  });

  console.log(`✅ Utworzono użytkownika:`);
  console.log(`   ID: ${result.user.id}`);
  console.log(`   Email: ${result.user.email}`);
  console.log(`   Rola: ${result.user.role}`);
  console.log(`\n✅ Utworzono firmę:`);
  console.log(`   ID: ${result.tenant.id}`);
  console.log(`   Nazwa: ${result.tenant.name}`);
  console.log(`   Subdomena: ${result.tenant.subdomain}`);

  // Generuj link do resetu hasła
  const jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
  const resetToken = jwt.sign(
    { sub: result.user.id, email: result.user.email, type: 'password-reset' },
    jwtSecret,
    { expiresIn: '24h' }
  );
  
  const resetLink = `https://app.rezerwacja24.pl/reset-password?token=${resetToken}`;
  
  console.log(`\n📧 Link do resetu hasła (ważny 24h):`);
  console.log(`   ${resetLink}\n`);
  
  console.log(`📌 Wyślij ten link do użytkownika ${email}`);
}

main()
  .catch((e) => {
    console.error('❌ Błąd:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
