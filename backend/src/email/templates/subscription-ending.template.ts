/**
 * Szablon emaila o kończącym się abonamencie (dla płacących klientów - nie trial)
 */
export function getSubscriptionEndingTemplate(data: { 
  name: string; 
  daysLeft: number; 
  subscriptionEndDate: string;
  planName: string;
}): string {
  const daysText = data.daysLeft === 1 ? 'dzień' : 'dni';
  
  return `
    <h2 style="color: #222222; font-size: 22px; font-weight: 600; margin: 0 0 28px 0;">
      Twój abonament kończy się za ${data.daysLeft} ${daysText}
    </h2>
    
    <p style="margin: 0 0 24px 0;">
      Cześć ${data.name},
    </p>
    
    <p style="margin: 0 0 24px 0;">
      Chcieliśmy Ci przypomnieć, że Twoja subskrypcja planu <strong>${data.planName}</strong> w Rezerwacja24 kończy się <strong>${data.subscriptionEndDate}</strong>.
    </p>
    
    <p style="margin: 0 0 24px 0;">
      Jeśli nie odnowisz subskrypcji, po tym terminie utracisz dostęp do panelu zarządzania rezerwacjami. Twoi klienci również nie będą mogli dokonywać nowych rezerwacji przez Twoją stronę.
    </p>
    
    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 0 0 24px 0; border-radius: 4px;">
      <p style="margin: 0; color: #92400e;">
        <strong>⚠️ Ważne:</strong> Po wygaśnięciu subskrypcji masz jeszcze 3 dni na jej odnowienie. Po tym czasie Twoje konto zostanie zawieszone.
      </p>
    </div>
    
    <p style="margin: 0 0 16px 0;">
      <strong>Odnawiając subskrypcję, zachowasz:</strong>
    </p>
    
    <ul style="margin: 0 0 28px 0; padding-left: 20px; color: #444444;">
      <li style="margin-bottom: 10px;">Wszystkie dotychczasowe rezerwacje i dane klientów</li>
      <li style="margin-bottom: 10px;">Skonfigurowane usługi, pracowników i godziny pracy</li>
      <li style="margin-bottom: 10px;">Swoją subdomenę i stronę rezerwacji</li>
      <li style="margin-bottom: 10px;">Pełną historię i statystyki</li>
    </ul>
    
    <p style="margin: 0 0 32px 0;">
      <a href="https://rezerwacja24.pl/dashboard/settings?tab=subscription" style="display: inline-block; background-color: #10b981; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 500;">
        Odnów subskrypcję
      </a>
    </p>
    
    <p style="margin: 0 0 24px 0;">
      Jeśli masz jakiekolwiek pytania lub potrzebujesz pomocy, odpowiedz na tego maila – chętnie pomożemy.
    </p>
    
    <p style="margin: 0; color: #666666;">
      Pozdrawiamy,<br>
      Zespół Rezerwacja24
    </p>
  `.trim();
}
