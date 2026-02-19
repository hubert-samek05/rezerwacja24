/**
 * Szablon emaila o niepowodzeniu płatności dla klienta
 * Profesjonalny design bez emotikon
 */
export function getPaymentFailedTemplate(data: {
  customerName: string;
  serviceName: string;
  date: string;
  time: string;
  amount: string;
  businessName: string;
  retryUrl?: string;
  bookingId: string;
}): string {
  return `
    <h1 style="color: #0f172a; font-size: 28px; font-weight: 700; margin: 0 0 8px 0; letter-spacing: -0.5px;">
      Płatność nieudana
    </h1>
    <div style="width: 60px; height: 4px; background-color: #dc2626; margin: 0 0 32px 0;"></div>
    
    <p style="margin: 0 0 24px 0; font-size: 16px; color: #334155;">
      Szanowny/a <strong>${data.customerName}</strong>,
    </p>
    
    <p style="margin: 0 0 32px 0; font-size: 16px; color: #334155;">
      Niestety, płatność za rezerwację w <strong>${data.businessName}</strong> nie powiodła się.
    </p>
    
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #fef2f2; border-radius: 8px; border-left: 4px solid #dc2626; margin: 0 0 32px 0;">
      <tr>
        <td style="padding: 24px;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #fecaca;">
                <span style="color: #991b1b; font-size: 14px; display: inline-block; width: 140px;">Kwota</span>
                <span style="color: #0f172a; font-size: 18px; font-weight: 700;">${data.amount} zł</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #fecaca;">
                <span style="color: #991b1b; font-size: 14px; display: inline-block; width: 140px;">Usługa</span>
                <span style="color: #0f172a; font-size: 16px;">${data.serviceName}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #fecaca;">
                <span style="color: #991b1b; font-size: 14px; display: inline-block; width: 140px;">Data wizyty</span>
                <span style="color: #0f172a; font-size: 16px;">${data.date}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 0;">
                <span style="color: #991b1b; font-size: 14px; display: inline-block; width: 140px;">Godzina</span>
                <span style="color: #0f172a; font-size: 16px;">${data.time}</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    
    <p style="margin: 0 0 24px 0; font-size: 16px; color: #334155;">
      Prosimy o ponowienie płatności lub skontaktowanie się z nami w celu wyjaśnienia sytuacji.
    </p>
    
    ${data.retryUrl ? `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 0 32px 0;">
      <tr>
        <td style="border-radius: 8px; background-color: #0f766e;">
          <a href="${data.retryUrl}" target="_blank" style="display: inline-block; padding: 16px 32px; font-size: 16px; font-weight: 600; color: #ffffff; text-decoration: none;">
            Ponów płatność
          </a>
        </td>
      </tr>
    </table>
    ` : ''}
    
    <p style="margin: 0 0 32px 0; color: #64748b; font-size: 14px;">
      Numer rezerwacji: <code style="background: #e2e8f0; padding: 4px 12px; border-radius: 4px; font-family: monospace; font-size: 13px; color: #334155;">${data.bookingId.slice(-8).toUpperCase()}</code>
    </p>
    
    <p style="margin: 0; color: #334155; font-size: 16px;">
      Z poważaniem,<br>
      <strong>${data.businessName}</strong>
    </p>
  `;
}
