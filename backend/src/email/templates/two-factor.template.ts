/**
 * Szablon emaila z kodem weryfikacyjnym 2FA
 */
export function getTwoFactorTemplate(data: { firstName?: string; code: string }): string {
  return `
    <!-- Title -->
    <h1 style="color: #FFFFFF; font-size: 28px; font-weight: 700; margin: 0 0 8px 0; text-align: center;">
      🔐 Kod weryfikacyjny
    </h1>
    <p style="color: #888888; font-size: 16px; margin: 0 0 32px 0; text-align: center;">
      Weryfikacja dwuskładnikowa
    </p>
    
    <!-- Greeting -->
    <p style="color: #CCCCCC; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
      Cześć${data.firstName ? ` <strong style="color: #FFFFFF;">${data.firstName}</strong>` : ''}! 👋
    </p>
    
    <p style="color: #CCCCCC; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
      Otrzymaliśmy prośbę o zalogowanie się na Twoje konto. Użyj poniższego kodu, aby potwierdzić swoją tożsamość:
    </p>
    
    <!-- Code Box -->
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 32px 0;">
      <tr>
        <td align="center">
          <table role="presentation" cellspacing="0" cellpadding="0" style="background: linear-gradient(135deg, #0F6048 0%, #0A4A38 100%); border-radius: 12px; border: 2px solid #41FFBC;">
            <tr>
              <td style="padding: 24px 48px;">
                <span style="color: #41FFBC; font-size: 42px; font-weight: 700; letter-spacing: 12px; font-family: 'Courier New', monospace;">
                  ${data.code}
                </span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    
    <!-- Timer Info -->
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" cellspacing="0" cellpadding="0" style="background: #1F1F1F; border-radius: 8px; border: 1px solid #333333;">
            <tr>
              <td style="padding: 12px 20px;">
                <span style="color: #888888; font-size: 14px;">
                  ⏱️ Kod wygasa za <strong style="color: #FFFFFF;">10 minut</strong>
                </span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    
    <!-- Security Notice -->
    <div style="background: #1A1A1A; border-radius: 8px; padding: 16px; margin-top: 24px; border-left: 3px solid #41FFBC;">
      <p style="color: #888888; font-size: 14px; margin: 0; line-height: 1.5;">
        🛡️ <strong style="color: #CCCCCC;">Wskazówka bezpieczeństwa:</strong><br>
        Jeśli nie próbujesz się zalogować, zignoruj tę wiadomość. Nigdy nie udostępniaj tego kodu nikomu.
      </p>
    </div>
  `.trim();
}
