/**
 * Szablon emaila o rozpoczęciu trialu
 */
export function getTrialStartedTemplate(data: { name: string; trialDays: number; trialEndDate: string }): string {
  return `
    <h2 style="color: #222222; font-size: 22px; font-weight: 600; margin: 0 0 28px 0;">
      Twój okres próbny został aktywowany
    </h2>
    
    <p style="margin: 0 0 24px 0;">
      Cześć ${data.name},
    </p>
    
    <p style="margin: 0 0 24px 0;">
      Świetnie, że jesteś z nami! Właśnie rozpoczął się Twój <strong>${data.trialDays}-dniowy okres próbny</strong>, podczas którego masz pełny dostęp do wszystkich funkcji Rezerwacja24. To doskonała okazja, żeby przekonać się, jak nasze narzędzie może usprawnić zarządzanie rezerwacjami w Twojej firmie.
    </p>
    
    <p style="margin: 0 0 24px 0;">
      Okres próbny kończy się: <strong>${data.trialEndDate}</strong>
    </p>
    
    <p style="margin: 0 0 16px 0;">
      <strong>Co możesz przetestować:</strong>
    </p>
    
    <ul style="margin: 0 0 28px 0; padding-left: 20px; color: #444444;">
      <li style="margin-bottom: 10px;">Przyjmowanie rezerwacji online 24/7 przez Twoją własną stronę</li>
      <li style="margin-bottom: 10px;">Automatyczne powiadomienia SMS i email dla klientów</li>
      <li style="margin-bottom: 10px;">Synchronizacja z Kalendarzem Google</li>
      <li style="margin-bottom: 10px;">Zarządzanie pracownikami, usługami i grafikiem</li>
      <li style="margin-bottom: 10px;">Raporty, statystyki i analizy</li>
    </ul>
    
    <p style="margin: 0 0 24px 0;">
      Podczas okresu próbnego nie pobieramy żadnych opłat i nie musisz podawać karty płatniczej. Jeśli zdecydujesz, że Rezerwacja24 nie jest dla Ciebie – po prostu nie rób nic i konto wygaśnie automatycznie. Bez żadnych zobowiązań.
    </p>
    
    <p style="margin: 0 0 28px 0;">
      Zachęcamy do skonfigurowania konta już teraz, żebyś mógł/mogła w pełni wykorzystać okres próbny i zobaczyć, jak Rezerwacja24 działa w praktyce.
    </p>
    
    <p style="margin: 0 0 32px 0;">
      <a href="https://rezerwacja24.pl/dashboard" style="display: inline-block; background-color: #10b981; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 500;">
        Rozpocznij konfigurację
      </a>
    </p>
    
    <p style="margin: 0; color: #666666;">
      Pozdrawiamy,<br>
      Zespół Rezerwacja24
    </p>
  `.trim();
}
