/**
 * Szablon emaila przypominającego o wizycie dla klienta
 * Profesjonalny design bez emotikon
 */
export function getBookingReminderTemplate(data: {
  customerName: string;
  serviceName: string;
  employeeName: string;
  date: string;
  time: string;
  duration: number;
  businessName: string;
  businessAddress?: string;
  businessPhone?: string;
  hoursUntil: number;
  cancelUrl?: string;
}): string {
  const reminderText = data.hoursUntil <= 24 
    ? `Przypominamy, że <strong>jutro</strong> masz zaplanowaną wizytę.`
    : `Przypominamy o Twojej nadchodzącej wizycie.`;

  return `
    <h1 style="color: #0f172a; font-size: 28px; font-weight: 700; margin: 0 0 8px 0; letter-spacing: -0.5px;">
      Przypomnienie o wizycie
    </h1>
    <div style="width: 60px; height: 4px; background-color: #f59e0b; margin: 0 0 32px 0;"></div>
    
    <p style="margin: 0 0 24px 0; font-size: 16px; color: #334155;">
      Szanowny/a <strong>${data.customerName}</strong>,
    </p>
    
    <p style="margin: 0 0 32px 0; font-size: 16px; color: #334155;">
      ${reminderText}
    </p>
    
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #fffbeb; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 0 0 32px 0;">
      <tr>
        <td style="padding: 24px;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #fef3c7;">
                <span style="color: #92400e; font-size: 14px; display: inline-block; width: 140px;">Data</span>
                <span style="color: #0f172a; font-size: 16px; font-weight: 600;">${data.date}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #fef3c7;">
                <span style="color: #92400e; font-size: 14px; display: inline-block; width: 140px;">Godzina</span>
                <span style="color: #0f172a; font-size: 16px; font-weight: 600;">${data.time}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #fef3c7;">
                <span style="color: #92400e; font-size: 14px; display: inline-block; width: 140px;">Usługa</span>
                <span style="color: #0f172a; font-size: 16px; font-weight: 600;">${data.serviceName}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #fef3c7;">
                <span style="color: #92400e; font-size: 14px; display: inline-block; width: 140px;">Specjalista</span>
                <span style="color: #0f172a; font-size: 16px;">${data.employeeName}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 0;">
                <span style="color: #92400e; font-size: 14px; display: inline-block; width: 140px;">Czas trwania</span>
                <span style="color: #0f172a; font-size: 16px;">${data.duration} minut</span>
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
    
    ${data.cancelUrl ? `
    <p style="margin: 0 0 32px 0; color: #64748b; font-size: 14px;">
      Jeśli nie możesz przyjść, prosimy o <a href="${data.cancelUrl}" style="color: #dc2626; text-decoration: underline;">anulowanie rezerwacji</a>.
    </p>
    ` : ''}
    
    <p style="margin: 0; color: #334155; font-size: 16px;">
      Z poważaniem,<br>
      <strong>${data.businessName}</strong>
    </p>
  `;
}
