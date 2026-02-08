import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { SubscriptionGuard } from './common/guards/subscription.guard';
import { ActivityTrackerInterceptor } from './common/interceptors/activity-tracker.interceptor';

/**
 * Global application providers
 * 
 * UWAGA: WSZYSTKIE GUARDY WYŁĄCZONE!
 * 
 * JwtAuthGuard i SubscriptionGuard zostały wyłączone bo blokowały panel biznesowy.
 * System działa BEZ globalnych guardów - każdy kontroler musi sam zarządzać autoryzacją.
 * 
 * Guardy są nadal dostępne i można ich używać lokalnie w kontrolerach:
 * - @UseGuards(JwtAuthGuard) - dla endpointów wymagających autentykacji
 * - @UseGuards(SubscriptionGuard) - dla endpointów wymagających subskrypcji
 */
export const appProviders = [
  // JwtAuthGuard WYŁĄCZONY - blokował panel
  // {
  //   provide: APP_GUARD,
  //   useClass: JwtAuthGuard,
  // },
  // SubscriptionGuard WYŁĄCZONY - blokował cały panel
  // {
  //   provide: APP_GUARD,
  //   useClass: SubscriptionGuard,
  // },
  
  // ActivityTrackerInterceptor - śledzi aktywność użytkowników dla statusu "online" (in-memory, bez migracji DB)
  {
    provide: APP_INTERCEPTOR,
    useClass: ActivityTrackerInterceptor,
  },
];
