#!/usr/bin/env npx ts-node
/**
 * Skrypt dodający kolumny dla systemu zaliczek
 * Bezpieczny - używa IF NOT EXISTS, nie usuwa żadnych danych
 * 
 * Uruchomienie: npx ts-node scripts/add-deposit-columns.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addDepositColumns() {
  console.log('🔧 Rozpoczynam dodawanie kolumn dla systemu zaliczek...\n');

  try {
    // ========================================
    // KOLUMNY W TABELI TENANTS (ustawienia firmy)
    // ========================================
    console.log('📦 Dodaję kolumny do tabeli TENANTS...');

    await prisma.$executeRawUnsafe(`
      ALTER TABLE tenants ADD COLUMN IF NOT EXISTS deposit_enabled BOOLEAN DEFAULT false
    `);
    console.log('  ✓ deposit_enabled');

    await prisma.$executeRawUnsafe(`
      ALTER TABLE tenants ADD COLUMN IF NOT EXISTS deposit_mode VARCHAR(30) DEFAULT 'always'
    `);
    console.log('  ✓ deposit_mode');

    await prisma.$executeRawUnsafe(`
      ALTER TABLE tenants ADD COLUMN IF NOT EXISTS deposit_type VARCHAR(20) DEFAULT 'percentage'
    `);
    console.log('  ✓ deposit_type');

    await prisma.$executeRawUnsafe(`
      ALTER TABLE tenants ADD COLUMN IF NOT EXISTS deposit_value DECIMAL(10,2) DEFAULT 30
    `);
    console.log('  ✓ deposit_value');

    await prisma.$executeRawUnsafe(`
      ALTER TABLE tenants ADD COLUMN IF NOT EXISTS deposit_min_amount DECIMAL(10,2)
    `);
    console.log('  ✓ deposit_min_amount');

    await prisma.$executeRawUnsafe(`
      ALTER TABLE tenants ADD COLUMN IF NOT EXISTS deposit_max_amount DECIMAL(10,2)
    `);
    console.log('  ✓ deposit_max_amount');

    await prisma.$executeRawUnsafe(`
      ALTER TABLE tenants ADD COLUMN IF NOT EXISTS deposit_exempt_after_visits INT
    `);
    console.log('  ✓ deposit_exempt_after_visits');

    await prisma.$executeRawUnsafe(`
      ALTER TABLE tenants ADD COLUMN IF NOT EXISTS deposit_exempt_after_spent DECIMAL(10,2)
    `);
    console.log('  ✓ deposit_exempt_after_spent');

    await prisma.$executeRawUnsafe(`
      ALTER TABLE tenants ADD COLUMN IF NOT EXISTS deposit_refund_policy VARCHAR(30) DEFAULT 'non_refundable'
    `);
    console.log('  ✓ deposit_refund_policy');

    await prisma.$executeRawUnsafe(`
      ALTER TABLE tenants ADD COLUMN IF NOT EXISTS deposit_refund_hours_before INT DEFAULT 24
    `);
    console.log('  ✓ deposit_refund_hours_before');

    await prisma.$executeRawUnsafe(`
      ALTER TABLE tenants ADD COLUMN IF NOT EXISTS deposit_payment_deadline_hours INT DEFAULT 24
    `);
    console.log('  ✓ deposit_payment_deadline_hours');

    console.log('✅ Kolumny TENANTS dodane!\n');

    // ========================================
    // KOLUMNY W TABELI BOOKINGS (dane rezerwacji)
    // ========================================
    console.log('📦 Dodaję kolumny do tabeli BOOKINGS...');

    await prisma.$executeRawUnsafe(`
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS deposit_required BOOLEAN DEFAULT false
    `);
    console.log('  ✓ deposit_required');

    await prisma.$executeRawUnsafe(`
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS deposit_amount DECIMAL(10,2)
    `);
    console.log('  ✓ deposit_amount');

    await prisma.$executeRawUnsafe(`
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS deposit_status VARCHAR(30) DEFAULT 'not_required'
    `);
    console.log('  ✓ deposit_status');

    await prisma.$executeRawUnsafe(`
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS deposit_paid_at TIMESTAMP
    `);
    console.log('  ✓ deposit_paid_at');

    await prisma.$executeRawUnsafe(`
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS deposit_payment_id VARCHAR(255)
    `);
    console.log('  ✓ deposit_payment_id');

    await prisma.$executeRawUnsafe(`
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS deposit_payment_method VARCHAR(50)
    `);
    console.log('  ✓ deposit_payment_method');

    await prisma.$executeRawUnsafe(`
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS deposit_deadline TIMESTAMP
    `);
    console.log('  ✓ deposit_deadline');

    await prisma.$executeRawUnsafe(`
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS deposit_refunded_at TIMESTAMP
    `);
    console.log('  ✓ deposit_refunded_at');

    await prisma.$executeRawUnsafe(`
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS deposit_refund_amount DECIMAL(10,2)
    `);
    console.log('  ✓ deposit_refund_amount');

    console.log('✅ Kolumny BOOKINGS dodane!\n');

    // ========================================
    // WERYFIKACJA
    // ========================================
    console.log('🔍 Weryfikuję dodane kolumny...\n');

    const tenantColumns = await prisma.$queryRawUnsafe(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'tenants' AND column_name LIKE 'deposit_%'
      ORDER BY column_name
    `) as any[];

    console.log('Kolumny deposit_* w TENANTS:');
    tenantColumns.forEach((col: any) => console.log(`  - ${col.column_name}`));

    const bookingColumns = await prisma.$queryRawUnsafe(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'bookings' AND column_name LIKE 'deposit_%'
      ORDER BY column_name
    `) as any[];

    console.log('\nKolumny deposit_* w BOOKINGS:');
    bookingColumns.forEach((col: any) => console.log(`  - ${col.column_name}`));

    console.log('\n✅ SUKCES! Wszystkie kolumny zostały dodane.');
    console.log('ℹ️  Kolumny są NULLABLE i mają wartości domyślne - istniejące dane są bezpieczne.');
    console.log('ℹ️  deposit_enabled = false dla wszystkich firm (funkcja wyłączona domyślnie).');

  } catch (error) {
    console.error('\n❌ BŁĄD:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

addDepositColumns();
