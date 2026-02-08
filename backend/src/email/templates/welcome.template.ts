/**
 * Szablon emaila powitalnego po rejestracji
 */
export function getWelcomeTemplate(data: { name: string; companyName: string; subdomain: string }): string {
  return `
    <h2 style="color: #222222; font-size: 22px; font-weight: 600; margin: 0 0 28px 0;">
      Witaj w Rezerwacja24!
    </h2>
    
    <p style="margin: 0 0 24px 0;">
      Cześć ${data.name},
    </p>
    
    <p style="margin: 0 0 24px 0;">
      Dziękujemy za rejestrację w Rezerwacja24! Twoje konto dla firmy <strong>${data.companyName}</strong> zostało pomyślnie utworzone i jest gotowe do użycia. Cieszymy się, że dołączasz do grona przedsiębiorców, którzy usprawniają zarządzanie rezerwacjami w swoich firmach.
    </p>
    
    <p style="margin: 0 0 24px 0;">
      Twoja strona rezerwacji online jest już aktywna i dostępna dla Twoich klientów pod adresem:<br>
      <a href="https://${data.subdomain}.rezerwacja24.pl" style="color: #10b981; font-weight: 600; text-decoration: none;">
        ${data.subdomain}.rezerwacja24.pl
      </a>
    </p>
    
    <p style="margin: 0 0 16px 0;">
      <strong>Pierwsze kroki, które warto wykonać:</strong>
    </p>
    
    <ul style="margin: 0 0 28px 0; padding-left: 20px; color: #444444;">
      <li style="margin-bottom: 10px;">Dodaj swoje usługi wraz z cenami i czasem trwania</li>
      <li style="margin-bottom: 10px;">Ustaw godziny pracy Twojej firmy</li>
      <li style="margin-bottom: 10px;">Dodaj pracowników, jeśli pracujesz w zespole</li>
      <li style="margin-bottom: 10px;">Udostępnij link do rezerwacji swoim klientom</li>
    </ul>
    
    <p style="margin: 0 0 28px 0;">
      Konfiguracja zajmuje tylko kilka minut. Jeśli potrzebujesz pomocy lub masz pytania, zajrzyj do naszego centrum pomocy lub po prostu odpowiedz na tego maila – chętnie pomożemy Ci rozpocząć.
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
