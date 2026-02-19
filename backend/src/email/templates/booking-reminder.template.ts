/**
 * Szablon emaila przypominającego o wizycie dla klienta
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
    ? `Przypominamy, że <strong>jutro</strong> masz zaplanowaną wizytę!`
    : `Przypominamy o Twojej wizycie za <strong>${Math.round(data.hoursUntil / 24)} dni</strong>.`;

  return `
    <h2 style="color: #f59e0b; font-size: 22px; font-weight: 600; margin: 0 0 28px 0;">
      ⏰ Przypomnienie o wizycie
    </h2>
    
    <p style="margin: 0 0 24px 0;">
      Cześć <strong>${data.customerName}</strong>,
    </p>
    
    <p style="margin: 0 0 24px 0;">
      ${reminderText}
    </p>
    
    <div style="background-color: #fffbeb; border: 1px solid #f59e0b; border-radius: 12px; padding: 24px; margin: 0 0 24px 0;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px 0; color: #6b7280; width: 120px; vertical-align: top;">📅 Data:</td>
          <td style="padding: 10px 0; font-weight: 600; color: #111827;">${data.date}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #6b7280; vertical-align: top;">🕐 Godzina:</td>
          <td style="padding: 10px 0; font-weight: 600; color: #111827;">${data.time}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #6b7280; vertical-align: top;">💇 Usługa:</td>
          <td style="padding: 10px 0; font-weight: 600; color: #111827;">${data.serviceName}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #6b7280; vertical-align: top;">👤 Specjalista:</td>
          <td style="padding: 10px 0; font-weight: 600; color: #111827;">${data.employeeName}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #6b7280; vertical-align: top;">⏱️ Czas trwania:</td>
          <td style="padding: 10px 0; color: #111827;">${data.duration} min</td>
        </tr>
      </table>
    </div>
    
    ${data.businessAddress || data.businessPhone ? `
    <div style="background-color: #f8fafc; border-radius: 8px; padding: 16px; margin: 0 0 24px 0;">
      <p style="margin: 0 0 8px 0; font-weight: 600; color: #374151;">📍 Gdzie nas znajdziesz:</p>
      ${data.businessAddress ? `<p style="margin: 0 0 4px 0; color: #6b7280;">${data.businessAddress}</p>` : ''}
      ${data.businessPhone ? `<p style="margin: 0; color: #6b7280;">Tel: ${data.businessPhone}</p>` : ''}
    </div>
    ` : ''}
    
    ${data.cancelUrl ? `
    <p style="margin: 0 0 24px 0; color: #6b7280; font-size: 14px;">
      Nie możesz przyjść? <a href="${data.cancelUrl}" style="color: #ef4444;">Anuluj rezerwację</a>
    </p>
    ` : ''}
    
    <p style="margin: 0; color: #666666;">
      Do zobaczenia!<br>
      <strong>${data.businessName}</strong>
    </p>
  `;
}
