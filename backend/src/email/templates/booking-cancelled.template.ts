/**
 * Szablon emaila o anulowaniu rezerwacji dla klienta
 * Profesjonalny design bez emotikon
 */
export function getBookingCancelledTemplate(data: {
  customerName: string;
  serviceName: string;
  date: string;
  time: string;
  businessName: string;
  reason?: string;
  rebookUrl?: string;
}): string {
  return `
    <h1 style="color: #0f172a; font-size: 28px; font-weight: 700; margin: 0 0 8px 0; letter-spacing: -0.5px;">
      Rezerwacja anulowana
    </h1>
    <div style="width: 60px; height: 4px; background-color: #dc2626; margin: 0 0 32px 0;"></div>
    
    <p style="margin: 0 0 24px 0; font-size: 16px; color: #334155;">
      Szanowny/a <strong>${data.customerName}</strong>,
    </p>
    
    <p style="margin: 0 0 32px 0; font-size: 16px; color: #334155;">
      Informujemy, że Twoja rezerwacja w <strong>${data.businessName}</strong> została anulowana.
    </p>
    
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #fef2f2; border-radius: 8px; border-left: 4px solid #dc2626; margin: 0 0 32px 0;">
      <tr>
        <td style="padding: 24px;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #fecaca;">
                <span style="color: #991b1b; font-size: 14px; display: inline-block; width: 140px;">Data</span>
                <span style="color: #0f172a; font-size: 16px; text-decoration: line-through;">${data.date}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #fecaca;">
                <span style="color: #991b1b; font-size: 14px; display: inline-block; width: 140px;">Godzina</span>
                <span style="color: #0f172a; font-size: 16px; text-decoration: line-through;">${data.time}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 0;">
                <span style="color: #991b1b; font-size: 14px; display: inline-block; width: 140px;">Usługa</span>
                <span style="color: #0f172a; font-size: 16px;">${data.serviceName}</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    
    ${data.reason ? `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 0 0 32px 0;">
      <tr>
        <td style="padding: 16px 20px; background-color: #f1f5f9; border-radius: 8px;">
          <p style="margin: 0 0 4px 0; font-weight: 600; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Powód anulowania</p>
          <p style="margin: 0; color: #334155; font-size: 15px;">${data.reason}</p>
        </td>
      </tr>
    </table>
    ` : ''}
    
    ${data.rebookUrl ? `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 0 32px 0;">
      <tr>
        <td style="border-radius: 8px; background-color: #0f766e;">
          <a href="${data.rebookUrl}" target="_blank" style="display: inline-block; padding: 16px 32px; font-size: 16px; font-weight: 600; color: #ffffff; text-decoration: none;">
            Umów nową wizytę
          </a>
        </td>
      </tr>
    </table>
    ` : ''}
    
    <p style="margin: 0; color: #334155; font-size: 16px;">
      Z poważaniem,<br>
      <strong>${data.businessName}</strong>
    </p>
  `;
}
