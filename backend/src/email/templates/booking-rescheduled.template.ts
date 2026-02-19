/**
 * Szablon emaila o przeniesieniu rezerwacji dla klienta
 * Profesjonalny design bez emotikon
 */
export function getBookingRescheduledTemplate(data: {
  customerName: string;
  serviceName: string;
  oldDate: string;
  oldTime: string;
  newDate: string;
  newTime: string;
  employeeName: string;
  businessName: string;
  businessAddress?: string;
  businessPhone?: string;
  bookingId: string;
}): string {
  return `
    <h1 style="color: #0f172a; font-size: 28px; font-weight: 700; margin: 0 0 8px 0; letter-spacing: -0.5px;">
      Zmiana terminu wizyty
    </h1>
    <div style="width: 60px; height: 4px; background-color: #3b82f6; margin: 0 0 32px 0;"></div>
    
    <p style="margin: 0 0 24px 0; font-size: 16px; color: #334155;">
      Szanowny/a <strong>${data.customerName}</strong>,
    </p>
    
    <p style="margin: 0 0 32px 0; font-size: 16px; color: #334155;">
      Informujemy, że termin Twojej wizyty w <strong>${data.businessName}</strong> został zmieniony.
    </p>
    
    <!-- Stary termin -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #fef2f2; border-radius: 8px; margin: 0 0 16px 0;">
      <tr>
        <td style="padding: 20px;">
          <p style="margin: 0 0 12px 0; font-weight: 600; color: #991b1b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Poprzedni termin</p>
          <p style="margin: 0; color: #0f172a; font-size: 16px; text-decoration: line-through;">
            ${data.oldDate}, godz. ${data.oldTime}
          </p>
        </td>
      </tr>
    </table>
    
    <!-- Nowy termin -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f0fdf4; border-radius: 8px; border-left: 4px solid #10b981; margin: 0 0 32px 0;">
      <tr>
        <td style="padding: 24px;">
          <p style="margin: 0 0 16px 0; font-weight: 600; color: #166534; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Nowy termin</p>
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #bbf7d0;">
                <span style="color: #166534; font-size: 14px; display: inline-block; width: 140px;">Data</span>
                <span style="color: #0f172a; font-size: 16px; font-weight: 600;">${data.newDate}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #bbf7d0;">
                <span style="color: #166534; font-size: 14px; display: inline-block; width: 140px;">Godzina</span>
                <span style="color: #0f172a; font-size: 16px; font-weight: 600;">${data.newTime}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #bbf7d0;">
                <span style="color: #166534; font-size: 14px; display: inline-block; width: 140px;">Usługa</span>
                <span style="color: #0f172a; font-size: 16px;">${data.serviceName}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0;">
                <span style="color: #166534; font-size: 14px; display: inline-block; width: 140px;">Specjalista</span>
                <span style="color: #0f172a; font-size: 16px;">${data.employeeName}</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    
    ${data.businessAddress || data.businessPhone ? `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 0 0 32px 0;">
      <tr>
        <td style="padding: 20px; background-color: #f1f5f9; border-left: 4px solid #0f766e; border-radius: 0 8px 8px 0;">
          <p style="margin: 0 0 8px 0; font-weight: 600; color: #0f172a; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Lokalizacja</p>
          ${data.businessAddress ? `<p style="margin: 0 0 4px 0; color: #334155; font-size: 15px;">${data.businessAddress}</p>` : ''}
          ${data.businessPhone ? `<p style="margin: 0; color: #334155; font-size: 15px;">Tel: ${data.businessPhone}</p>` : ''}
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
