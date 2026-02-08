#!/usr/bin/env node
import * as fs from 'fs';
import * as path from 'path';

const MAINTENANCE_FILE = path.join(process.cwd(), 'maintenance.flag');

function enableMaintenance() {
  try {
    fs.writeFileSync(MAINTENANCE_FILE, new Date().toISOString());
    console.log('🛠️  Tryb konserwacji WŁĄCZONY');
    console.log('Strona jest teraz niedostępna dla użytkowników.');
  } catch (error) {
    console.error('❌ Błąd podczas włączania trybu konserwacji:', error.message);
    process.exit(1);
  }
}

function disableMaintenance() {
  try {
    if (fs.existsSync(MAINTENANCE_FILE)) {
      fs.unlinkSync(MAINTENANCE_FILE);
      console.log('✅ Tryb konserwacji WYŁĄCZONY');
      console.log('Strona jest teraz dostępna dla użytkowników.');
    } else {
      console.log('ℹ️  Tryb konserwacji nie był włączony.');
    }
  } catch (error) {
    console.error('❌ Błąd podczas wyłączania trybu konserwacji:', error.message);
    process.exit(1);
  }
}

function checkStatus() {
  const isMaintenance = fs.existsSync(MAINTENANCE_FILE);
  console.log(isMaintenance 
    ? '🛑 Tryb konserwacji AKTYWNY - strona jest niedostępna'
    : '✅ Tryb konserwacji NIEAKTYWNY - strona działa normalnie'
  );
  if (isMaintenance) {
    const stats = fs.statSync(MAINTENANCE_FILE);
    console.log(`   Włączono: ${stats.mtime}`);
  }
}

// Handle command line arguments
const command = process.argv[2];

switch (command) {
  case 'on':
    enableMaintenance();
    break;
  case 'off':
    disableMaintenance();
    break;
  case 'status':
  default:
    checkStatus();
    break;
}
