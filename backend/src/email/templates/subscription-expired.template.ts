/**
 * Szablon emaila o wygasłym abonamencie (dla płacących klientów - nie trial)
 */
export function getSubscriptionExpiredTemplate(data: { 
  name: string; 
  planName: string;
  daysUntilSuspension?: number;
}): string {
  const hasDaysLeft = data.daysUntilSuspension && data.daysUntilSuspension > 0;
  const daysText = data.daysUntilSuspension === 1 ? 'dzień' : 'dni';
  
  return `
    <h2 style="color: #dc2626; font-size: 22px; font-weight: 600; margin: 0 0 28px 0;">
      Twój abonament wygasł
    </h2>
    
    <p style="margin: 0 0 24px 0;">
      Cześć ${data.name},
    </p>
    
    <p style="margin: 0 0 24px 0;">
      Twoja subskrypcja planu <strong>${data.planName}</strong> w Rezerwacja24 właśnie wygasła. Aktualnie nie masz aktywnej subskrypcji.
    </p>
    
    ${hasDaysLeft ? `
    <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; margin: 0 0 24px 0; border-radius: 4px;">
      <p style="margin: 0; color: #991b1b;">
        <strong>⚠️ Uwaga:</strong> Za ${data.daysUntilSuspension} ${daysText} Twoje konto zostanie zawieszone i utracisz dostęp do wszystkich funkcji.
      </p>
    </div>
    ` : `
    <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; margin: 0 0 24px 0; border-radius: 4px;">
      <p style="margin: 0; color: #991b1b;">
        <strong>⚠️ Uwaga:</strong> Twoje konto zostanie wkrótce zawieszone. Odnów subskrypcję jak najszybciej, aby nie utracić dostępu.
      </p>
    </div>
    `}
    
    <p style="margin: 0 0 24px 0;">
      <strong>Co się stanie po zawieszeniu konta?</strong>
    </p>
    
    <ul style="margin: 0 0 28px 0; padding-left: 20px; color: #444444;">
      <li style="margin-bottom: 10px;">Twoi klienci nie będą mogli dokonywać nowych rezerwacji</li>
      <li style="margin-bottom: 10px;">Nie będziesz mieć dostępu do panelu zarządzania</li>
      <li style="margin-bottom: 10px;">Twoja strona rezerwacji będzie niedostępna</li>
    </ul>
    
    <p style="margin: 0 0 24px 0;">
      <strong>Dobra wiadomość:</strong> Twoje dane (rezerwacje, klienci, ustawienia) pozostaną bezpieczne. Po odnowieniu subskrypcji wszystko wróci do normy.
    </p>
    
    <p style="margin: 0 0 32px 0;">
      <a href="https://rezerwacja24.pl/dashboard/settings?tab=subscription" style="display: inline-block; background-color: #dc2626; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 500;">
        Odnów subskrypcję teraz
      </a>
    </p>
    
    <p style="margin: 0 0 24px 0;">
      Jeśli masz jakiekolwiek pytania lub napotkałeś problemy z płatnością, odpowiedz na tego maila – pomożemy Ci jak najszybciej.
    </p>
    
    <p style="margin: 0; color: #666666;">
      Pozdrawiamy,<br>
      Zespół Rezerwacja24
    </p>
  `.trim();
}
