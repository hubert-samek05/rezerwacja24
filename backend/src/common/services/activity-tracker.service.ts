import { Injectable, Logger } from '@nestjs/common';

/**
 * Serwis do śledzenia aktywności użytkowników w pamięci.
 * Nie wymaga zmian w bazie danych - przechowuje dane w pamięci RAM.
 * 
 * UWAGA: Dane są tracone przy restarcie serwera, ale to akceptowalne
 * dla funkcji "kto jest online" - po restarcie użytkownicy po prostu
 * będą musieli wykonać jakąś akcję, żeby być widoczni jako online.
 */
@Injectable()
export class ActivityTrackerService {
  private readonly logger = new Logger(ActivityTrackerService.name);
  
  // Mapa userId -> timestamp ostatniej aktywności
  private activityMap = new Map<string, Date>();
  
  // Czas po którym użytkownik jest uznawany za offline (5 minut)
  private readonly ONLINE_THRESHOLD_MS = 5 * 60 * 1000;
  
  // Maksymalny rozmiar cache (czyścimy stare wpisy)
  private readonly MAX_CACHE_SIZE = 10000;

  /**
   * Aktualizuje czas ostatniej aktywności użytkownika
   */
  trackActivity(userId: string): void {
    if (!userId) return;
    
    this.activityMap.set(userId, new Date());
    
    // Czyść stare wpisy jeśli cache jest za duży
    if (this.activityMap.size > this.MAX_CACHE_SIZE) {
      this.cleanupOldEntries();
    }
  }

  /**
   * Sprawdza czy użytkownik jest online (aktywny w ciągu ostatnich 5 minut)
   */
  isUserOnline(userId: string): boolean {
    const lastActivity = this.activityMap.get(userId);
    if (!lastActivity) return false;
    
    const now = Date.now();
    return (now - lastActivity.getTime()) < this.ONLINE_THRESHOLD_MS;
  }

  /**
   * Pobiera czas ostatniej aktywności użytkownika
   */
  getLastActivity(userId: string): Date | null {
    return this.activityMap.get(userId) || null;
  }

  /**
   * Sprawdza czy którykolwiek z podanych użytkowników jest online
   * i zwraca czas ostatniej aktywności
   */
  getOnlineStatusForUsers(userIds: string[]): { isOnline: boolean; lastActivity: Date | null } {
    let latestActivity: Date | null = null;
    
    for (const userId of userIds) {
      const activity = this.activityMap.get(userId);
      if (activity) {
        if (!latestActivity || activity > latestActivity) {
          latestActivity = activity;
        }
      }
    }
    
    if (!latestActivity) {
      return { isOnline: false, lastActivity: null };
    }
    
    const now = Date.now();
    const isOnline = (now - latestActivity.getTime()) < this.ONLINE_THRESHOLD_MS;
    
    return { isOnline, lastActivity: latestActivity };
  }

  /**
   * Czyści stare wpisy z cache (starsze niż 1 godzina)
   */
  private cleanupOldEntries(): void {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    let cleaned = 0;
    
    for (const [userId, timestamp] of this.activityMap.entries()) {
      if (timestamp.getTime() < oneHourAgo) {
        this.activityMap.delete(userId);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      this.logger.debug(`Cleaned ${cleaned} old activity entries`);
    }
  }

  /**
   * Zwraca statystyki cache (do debugowania)
   */
  getStats(): { totalTracked: number; onlineCount: number } {
    const now = Date.now();
    let onlineCount = 0;
    
    for (const timestamp of this.activityMap.values()) {
      if ((now - timestamp.getTime()) < this.ONLINE_THRESHOLD_MS) {
        onlineCount++;
      }
    }
    
    return {
      totalTracked: this.activityMap.size,
      onlineCount,
    };
  }
}
