/**
 * Szablon emaila o kończącym się trialu
 */
export function getTrialEndingTemplate(data: { name: string; daysLeft: number; trialEndDate: string }): string {
  const daysText = data.daysLeft === 1 ? 'dzień' : 'dni';
  
  return `
    <h2 style="color: #222222; font-size: 22px; font-weight: 600; margin: 0 0 28px 0;">
      Twój okres próbny kończy się za ${data.daysLeft} ${daysText}
    </h2>
    
    <p style="margin: 0 0 24px 0;">
      Cześć ${data.name},
    </p>
    
    <p style="margin: 0 0 24px 0;">
      Chcieliśmy Ci przypomnieć, że Twój bezpłatny okres próbny w Rezerwacja24 kończy się <strong>${data.trialEndDate}</strong>. Mamy nadzieję, że miałeś/aś okazję przetestować nasze narzędzie i przekonać się, jak może usprawnić zarządzanie rezerwacjami w Twojej firmie.
    </p>
    
    <p style="margin: 0 0 24px 0;">
      Nie chcemy, żebyś stracił/a dostęp do swoich danych i konfiguracji. Jeśli zdecydujesz się kontynuować korzystanie z Rezerwacja24, wszystko pozostanie dokładnie tak, jak skonfigurowałeś/aś.
    </p>
    
    <p style="margin: 0 0 16px 0;">
      <strong>Kontynuując subskrypcję, zachowasz:</strong>
    </p>
    
    <ul style="margin: 0 0 28px 0; padding-left: 20px; color: #444444;">
      <li style="margin-bottom: 10px;">Wszystkie dotychczasowe rezerwacje i dane klientów</li>
      <li style="margin-bottom: 10px;">Skonfigurowane usługi, pracowników i godziny pracy</li>
      <li style="margin-bottom: 10px;">Swoją subdomenę i stronę rezerwacji</li>
      <li style="margin-bottom: 10px;">Pełną historię i statystyki</li>
    </ul>
    
    <p style="margin: 0 0 24px 0;">
      Oferujemy różne plany dopasowane do potrzeb Twojej firmy – od małych jednoosobowych działalności po większe zespoły. Możesz wybrać ten, który najlepiej odpowiada Twoim wymaganiom i budżetowi.
    </p>
    
    <p style="margin: 0 0 28px 0;">
      Jeśli masz jakiekolwiek pytania dotyczące planów, funkcji lub potrzebujesz pomocy w podjęciu decyzji, chętnie pomożemy – wystarczy odpowiedzieć na tego maila.
    </p>
    
    <p style="margin: 0 0 32px 0;">
      <a href="https://rezerwacja24.pl/dashboard/subscription" style="display: inline-block; background-color: #10b981; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 500;">
        Zobacz plany i aktywuj subskrypcję
      </a>
    </p>
    
    <p style="margin: 0; color: #666666;">
      Pozdrawiamy,<br>
      Zespół Rezerwacja24
    </p>
  `.trim();
}
