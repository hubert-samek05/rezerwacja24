/**
 * Szablon emaila - trial kończy się DZISIAJ
 */
export function getTrialEndedTodayTemplate(data: { name: string; planName: string }): string {
  return `
    <h2 style="color: #222222; font-size: 22px; font-weight: 600; margin: 0 0 28px 0;">
      Twój okres próbny kończy się dzisiaj
    </h2>
    
    <p style="margin: 0 0 24px 0;">
      Cześć ${data.name},
    </p>
    
    <p style="margin: 0 0 24px 0;">
      To ostatni dzień Twojego bezpłatnego okresu próbnego w Rezerwacja24. Chcieliśmy Ci o tym przypomnieć, bo nie chcemy, żebyś stracił/a dostęp do swojego konta i wszystkich danych, które już skonfigurowałeś/aś.
    </p>
    
    <p style="margin: 0 0 24px 0;">
      Po zakończeniu okresu próbnego Twoja strona rezerwacji przestanie być dostępna dla klientów, ale wszystkie Twoje dane pozostaną bezpieczne przez kolejne 30 dni. W każdej chwili możesz wrócić i aktywować subskrypcję.
    </p>
    
    <p style="margin: 0 0 16px 0;">
      <strong>Aktywując subskrypcję, zachowasz:</strong>
    </p>
    
    <ul style="margin: 0 0 28px 0; padding-left: 20px; color: #444444;">
      <li style="margin-bottom: 10px;">Wszystkie dotychczasowe rezerwacje i dane klientów</li>
      <li style="margin-bottom: 10px;">Skonfigurowane usługi, pracowników i godziny pracy</li>
      <li style="margin-bottom: 10px;">Swoją subdomenę i stronę rezerwacji</li>
      <li style="margin-bottom: 10px;">Pełną historię i statystyki</li>
    </ul>
    
    <p style="margin: 0 0 24px 0;">
      Twój obecny plan to <strong>${data.planName}</strong>. Żeby kontynuować korzystanie z Rezerwacja24, wystarczy dodać metodę płatności w ustawieniach konta. Możesz też wybrać inny plan, jeśli lepiej odpowiada potrzebom Twojej firmy.
    </p>
    
    <p style="margin: 0 0 28px 0;">
      Jeśli masz jakiekolwiek pytania lub potrzebujesz pomocy, chętnie pomożemy – wystarczy odpowiedzieć na tego maila.
    </p>
    
    <p style="margin: 0 0 32px 0;">
      <a href="https://rezerwacja24.pl/dashboard/settings?tab=subscription" style="display: inline-block; background-color: #10b981; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 500;">
        Aktywuj subskrypcję
      </a>
    </p>
    
    <p style="margin: 0; color: #666666;">
      Pozdrawiamy,<br>
      Zespół Rezerwacja24
    </p>
  `.trim();
}
