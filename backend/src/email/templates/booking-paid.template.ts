/**
 * Szablon emaila o opłaceniu rezerwacji dla klienta
 * Profesjonalny design bez emotikon
 */
export function getBookingPaidTemplate(data: {
  customerName: string;
  serviceName: string;
  date: string;
  time: string;
  amount: string;
  businessName: string;
  paymentMethod?: string;
  bookingId: string;
}): string {
  return `
    <h1 style="color: #0f172a; font-size: 28px; font-weight: 700; margin: 0 0 8px 0; letter-spacing: -0.5px;">
      Płatność potwierdzona
    </h1>
    <div style="width: 60px; height: 4px; background-color: #10b981; margin: 0 0 32px 0;"></div>
    
    <p style="margin: 0 0 24px 0; font-size: 16px; color: #334155;">
      Szanowny/a <strong>${data.customerName}</strong>,
    </p>
    
    <p style="margin: 0 0 32px 0; font-size: 16px; color: #334155;">
      Potwierdzamy otrzymanie płatności za rezerwację w <strong>${data.businessName}</strong>.
    </p>
    
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f0fdf4; border-radius: 8px; border-left: 4px solid #10b981; margin: 0 0 32px 0;">
      <tr>
        <td style="padding: 24px;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #bbf7d0;">
                <span style="color: #166534; font-size: 14px; display: inline-block; width: 140px;">Kwota</span>
                <span style="color: #0f172a; font-size: 20px; font-weight: 700;">${data.amount} zł</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #bbf7d0;">
                <span style="color: #166534; font-size: 14px; display: inline-block; width: 140px;">Usługa</span>
                <span style="color: #0f172a; font-size: 16px; font-weight: 600;">${data.serviceName}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #bbf7d0;">
                <span style="color: #166534; font-size: 14px; display: inline-block; width: 140px;">Data wizyty</span>
                <span style="color: #0f172a; font-size: 16px;">${data.date}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 0;">
                <span style="color: #166534; font-size: 14px; display: inline-block; width: 140px;">Godzina</span>
                <span style="color: #0f172a; font-size: 16px;">${data.time}</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    
    ${data.paymentMethod ? `
    <p style="margin: 0 0 16px 0; color: #64748b; font-size: 14px;">
      Metoda płatności: <strong style="color: #334155;">${data.paymentMethod}</strong>
    </p>
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
