/**
 * Szablon emaila potwierdzającego rezerwację dla klienta
 */
export function getBookingConfirmationTemplate(data: {
  customerName: string;
  serviceName: string;
  employeeName: string;
  date: string;
  time: string;
  duration: number;
  price: string;
  businessName: string;
  businessAddress?: string;
  businessPhone?: string;
  bookingId: string;
  cancelUrl?: string;
}): string {
  return `
    <h2 style="color: #10b981; font-size: 22px; font-weight: 600; margin: 0 0 28px 0;">
      ✅ Rezerwacja potwierdzona!
    </h2>
    
    <p style="margin: 0 0 24px 0;">
      Cześć <strong>${data.customerName}</strong>,
    </p>
    
    <p style="margin: 0 0 24px 0;">
      Twoja rezerwacja w <strong>${data.businessName}</strong> została potwierdzona. Poniżej znajdziesz szczegóły wizyty.
    </p>
    
    <div style="background-color: #f0fdf4; border: 1px solid #10b981; border-radius: 12px; padding: 24px; margin: 0 0 24px 0;">
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
        <tr>
          <td style="padding: 10px 0; color: #6b7280; vertical-align: top;">💰 Cena:</td>
          <td style="padding: 10px 0; font-weight: 600; color: #111827;">${data.price} zł</td>
        </tr>
      </table>
    </div>
    
    ${data.businessAddress || data.businessPhone ? `
    <div style="background-color: #f8fafc; border-radius: 8px; padding: 16px; margin: 0 0 24px 0;">
      <p style="margin: 0 0 8px 0; font-weight: 600; color: #374151;">📍 Lokalizacja:</p>
      ${data.businessAddress ? `<p style="margin: 0 0 4px 0; color: #6b7280;">${data.businessAddress}</p>` : ''}
      ${data.businessPhone ? `<p style="margin: 0; color: #6b7280;">Tel: ${data.businessPhone}</p>` : ''}
    </div>
    ` : ''}
    
    <p style="margin: 0 0 24px 0; color: #6b7280; font-size: 14px;">
      Numer rezerwacji: <code style="background: #e2e8f0; padding: 2px 8px; border-radius: 4px;">${data.bookingId.slice(-8).toUpperCase()}</code>
    </p>
    
    ${data.cancelUrl ? `
    <p style="margin: 0 0 24px 0; color: #6b7280; font-size: 14px;">
      Jeśli chcesz anulować rezerwację, <a href="${data.cancelUrl}" style="color: #ef4444;">kliknij tutaj</a>.
    </p>
    ` : ''}
    
    <p style="margin: 0; color: #666666;">
      Do zobaczenia!<br>
      <strong>${data.businessName}</strong>
    </p>
  `;
}
