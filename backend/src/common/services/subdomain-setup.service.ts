import { Injectable, Logger } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

@Injectable()
export class SubdomainSetupService {
  private readonly logger = new Logger(SubdomainSetupService.name);
  private readonly scriptPath = '/root/CascadeProjects/rezerwacja24-saas/scripts/setup-new-subdomain.sh';
  private readonly removeScriptPath = '/root/CascadeProjects/rezerwacja24-saas/scripts/remove-subdomain.sh';

  /**
   * Automatycznie konfiguruje nginx i SSL dla nowej subdomeny
   * @param subdomain - nazwa subdomeny (bez .rezerwacja24.pl)
   */
  async setupSubdomain(subdomain: string): Promise<void> {
    try {
      this.logger.log(`🚀 Rozpoczynam konfigurację subdomeny: ${subdomain}.rezerwacja24.pl`);
      
      // Uruchom skrypt w tle (nie blokuj rejestracji)
      const command = `${this.scriptPath} ${subdomain} >> /var/log/subdomain-setup.log 2>&1 &`;
      
      await execAsync(command);
      
      this.logger.log(`✅ Skrypt konfiguracji subdomeny ${subdomain} uruchomiony w tle`);
    } catch (error) {
      // Loguj błąd ale nie przerywaj procesu rejestracji
      this.logger.error(`❌ Błąd podczas uruchamiania skryptu dla subdomeny ${subdomain}:`, error);
    }
  }

  /**
   * Usuwa konfigurację nginx i certyfikat SSL dla starej subdomeny
   * @param subdomain - nazwa subdomeny (bez .rezerwacja24.pl)
   */
  async removeSubdomain(subdomain: string): Promise<void> {
    try {
      this.logger.log(`🗑️ Usuwam konfigurację subdomeny: ${subdomain}.rezerwacja24.pl`);
      
      const command = `${this.removeScriptPath} ${subdomain} >> /var/log/subdomain-setup.log 2>&1 &`;
      
      await execAsync(command);
      
      this.logger.log(`✅ Skrypt usuwania subdomeny ${subdomain} uruchomiony w tle`);
    } catch (error) {
      this.logger.error(`❌ Błąd podczas usuwania subdomeny ${subdomain}:`, error);
    }
  }

  /**
   * Zmienia subdomenę - usuwa starą i tworzy nową
   * @param oldSubdomain - stara subdomena
   * @param newSubdomain - nowa subdomena
   */
  async changeSubdomain(oldSubdomain: string, newSubdomain: string): Promise<void> {
    this.logger.log(`🔄 Zmiana subdomeny: ${oldSubdomain} → ${newSubdomain}`);
    
    // Najpierw usuń starą (w tle)
    await this.removeSubdomain(oldSubdomain);
    
    // Poczekaj chwilę i utwórz nową
    setTimeout(() => {
      this.setupSubdomain(newSubdomain).catch(err => {
        this.logger.error(`Błąd podczas tworzenia nowej subdomeny ${newSubdomain}:`, err);
      });
    }, 2000);
  }

  /**
   * Sprawdza czy subdomena ma już skonfigurowany SSL
   */
  async hasSSL(subdomain: string): Promise<boolean> {
    try {
      const fullDomain = `${subdomain}.rezerwacja24.pl`;
      const { stdout } = await execAsync(`test -d /etc/letsencrypt/live/${fullDomain} && echo "exists" || echo "not-exists"`);
      return stdout.trim() === 'exists';
    } catch (error) {
      return false;
    }
  }
}
