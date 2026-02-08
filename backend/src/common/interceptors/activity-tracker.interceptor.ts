import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ActivityTrackerService } from '../services/activity-tracker.service';

/**
 * Interceptor do śledzenia aktywności użytkownika.
 * Aktualizuje cache aktywności przy każdym żądaniu API.
 * Nie wymaga zmian w bazie danych.
 */
@Injectable()
export class ActivityTrackerInterceptor implements NestInterceptor {
  constructor(private readonly activityTracker: ActivityTrackerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    // Jeśli użytkownik jest zalogowany, śledź jego aktywność
    if (user?.userId || user?.sub || user?.id) {
      const userId = user.userId || user.sub || user.id;
      this.activityTracker.trackActivity(userId);
    }

    return next.handle();
  }
}
