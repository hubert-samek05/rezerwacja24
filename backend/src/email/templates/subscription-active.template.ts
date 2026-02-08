/**
 * Szablon emaila o aktywnej subskrypcji
 */
export function getSubscriptionActiveTemplate(data: { name: string; planName: string; nextBillingDate: string }): string {
  return `
    <h2 style="color: #222222; font-size: 22px; font-weight: 600; margin: 0 0 28px 0;">
      Dziękujemy za aktywację subskrypcji!
    </h2>
    
    <p style="margin: 0 0 24px 0;">
      Cześć ${data.name},
    </p>
    
    <p style="margin: 0 0 24px 0;">
      Twoja subskrypcja planu <strong>${data.planName}</strong> została pomyślnie aktywowana. Dziękujemy za zaufanie i wybór Rezerwacja24! Cieszymy się, że możemy wspierać rozwój Twojej firmy.
    </p>
    
    <p style="margin: 0 0 24px 0;">
      <strong>Szczegóły subskrypcji:</strong><br>
      Plan: ${data.planName}<br>
      Status: Aktywna<br>
      Następna płatność: ${data.nextBillingDate}
    </p>
    
    <p style="margin: 0 0 24px 0;">
      Od teraz masz pełny dostęp do wszystkich funkcji w ramach wybranego planu. Twoje konto jest w pełni skonfigurowane i gotowe do pracy. Możesz w każdej chwili zmienić plan lub zarządzać subskrypcją w panelu w sekcji Ustawienia.
    </p>
    
    <p style="margin: 0 0 24px 0;">
      Faktura za subskrypcję zostanie wysłana osobnym mailem. Wszystkie faktury znajdziesz również w panelu w sekcji Ustawienia → Płatności, gdzie możesz je pobrać w dowolnym momencie.
    </p>
    
    <p style="margin: 0 0 28px 0;">
      Jeśli masz jakiekolwiek pytania dotyczące Twojej subskrypcji, funkcji lub potrzebujesz pomocy, jesteśmy do Twojej dyspozycji – wystarczy odpowiedzieć na tego maila.
    </p>
    
    <p style="margin: 0 0 32px 0;">
      <a href="https://rezerwacja24.pl/dashboard" style="display: inline-block; background-color: #10b981; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 500;">
        Przejdź do panelu
      </a>
    </p>
    
    <p style="margin: 0; color: #666666;">
      Pozdrawiamy,<br>
      Zespół Rezerwacja24
    </p>
  `.trim();
}
