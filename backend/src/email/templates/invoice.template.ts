/**
 * Szablon emaila z fakturą
 */
export function getInvoiceTemplate(data: { 
  name: string; 
  invoiceNumber: string; 
  amount: string; 
  invoiceDate: string;
  downloadLink?: string;
}): string {
  return `
    <h2 style="color: #222222; font-size: 22px; font-weight: 600; margin: 0 0 28px 0;">
      Faktura za usługi Rezerwacja24
    </h2>
    
    <p style="margin: 0 0 24px 0;">
      Cześć ${data.name},
    </p>
    
    <p style="margin: 0 0 24px 0;">
      Przesyłamy fakturę za korzystanie z usług Rezerwacja24. Dziękujemy za terminowe płatności i zaufanie, jakim nas obdarzasz.
    </p>
    
    <p style="margin: 0 0 24px 0;">
      <strong>Szczegóły faktury:</strong><br>
      Numer faktury: ${data.invoiceNumber}<br>
      Data wystawienia: ${data.invoiceDate}<br>
      Kwota: <strong>${data.amount}</strong>
    </p>
    
    ${data.downloadLink ? `
    <p style="margin: 0 0 28px 0;">
      <a href="${data.downloadLink}" style="display: inline-block; background-color: #10b981; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 500;">
        Pobierz fakturę PDF
      </a>
    </p>
    ` : ''}
    
    <p style="margin: 0 0 24px 0;">
      Faktura jest również dostępna w Twoim panelu w sekcji Ustawienia → Płatności, gdzie znajdziesz pełną historię wszystkich dokumentów rozliczeniowych. Możesz je pobrać w dowolnym momencie.
    </p>
    
    <p style="margin: 0 0 24px 0;">
      Jeśli masz pytania dotyczące faktury, płatności lub potrzebujesz korekty danych, odpowiedz na tego maila – chętnie pomożemy.
    </p>
    
    <p style="margin: 0; color: #666666;">
      Pozdrawiamy,<br>
      Zespół Rezerwacja24
    </p>
  `.trim();
}
