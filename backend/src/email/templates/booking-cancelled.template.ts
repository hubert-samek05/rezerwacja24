/**
 * Szablon emaila o anulowaniu rezerwacji dla klienta
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
    <h2 style="color: #ef4444; font-size: 22px; font-weight: 600; margin: 0 0 28px 0;">
      ❌ Rezerwacja anulowana
    </h2>
    
    <p style="margin: 0 0 24px 0;">
      Cześć <strong>${data.customerName}</strong>,
    </p>
    
    <p style="margin: 0 0 24px 0;">
      Informujemy, że Twoja rezerwacja w <strong>${data.businessName}</strong> została anulowana.
    </p>
    
    <div style="background-color: #fef2f2; border: 1px solid #ef4444; border-radius: 12px; padding: 24px; margin: 0 0 24px 0;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px 0; color: #6b7280; width: 120px; vertical-align: top;">📅 Data:</td>
          <td style="padding: 10px 0; color: #111827; text-decoration: line-through;">${data.date}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #6b7280; vertical-align: top;">🕐 Godzina:</td>
          <td style="padding: 10px 0; color: #111827; text-decoration: line-through;">${data.time}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #6b7280; vertical-align: top;">💇 Usługa:</td>
          <td style="padding: 10px 0; color: #111827;">${data.serviceName}</td>
        </tr>
      </table>
    </div>
    
    ${data.reason ? `
    <p style="margin: 0 0 24px 0; color: #6b7280;">
      <strong>Powód:</strong> ${data.reason}
    </p>
    ` : ''}
    
    ${data.rebookUrl ? `
    <p style="margin: 0 0 32px 0;">
      <a href="${data.rebookUrl}" style="display: inline-block; background-color: #10b981; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 500;">
        📅 Umów nową wizytę
      </a>
    </p>
    ` : ''}
    
    <p style="margin: 0; color: #666666;">
      Pozdrawiamy,<br>
      <strong>${data.businessName}</strong>
    </p>
  `;
}
