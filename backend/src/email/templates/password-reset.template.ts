/**
 * Szablon emaila do resetu hasła
 */
export function getPasswordResetTemplate(data: { name: string; resetLink: string; expiresIn: string }): string {
  return `
    <h2 style="color: #222222; font-size: 22px; font-weight: 600; margin: 0 0 28px 0;">
      Resetowanie hasła
    </h2>
    
    <p style="margin: 0 0 24px 0;">
      Cześć ${data.name},
    </p>
    
    <p style="margin: 0 0 24px 0;">
      Otrzymaliśmy prośbę o zresetowanie hasła do Twojego konta w Rezerwacja24. Jeśli to Ty wysłałeś/aś tę prośbę, kliknij poniższy przycisk, aby ustawić nowe hasło.
    </p>
    
    <p style="margin: 0 0 28px 0;">
      <a href="${data.resetLink}" style="display: inline-block; background-color: #10b981; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 500;">
        Ustaw nowe hasło
      </a>
    </p>
    
    <p style="margin: 0 0 24px 0;">
      Link jest ważny przez <strong>${data.expiresIn}</strong>. Po tym czasie będziesz musiał/a ponownie poprosić o reset hasła.
    </p>
    
    <p style="margin: 0 0 24px 0; color: #666666; font-size: 14px;">
      Jeśli przycisk nie działa, skopiuj i wklej poniższy link do przeglądarki:<br>
      <span style="word-break: break-all;">${data.resetLink}</span>
    </p>
    
    <p style="margin: 0 0 24px 0; color: #996600;">
      <strong>Ważne:</strong> Jeśli nie prosiłeś/aś o reset hasła, zignoruj tę wiadomość. Twoje konto jest bezpieczne i hasło nie zostanie zmienione bez Twojej zgody.
    </p>
    
    <p style="margin: 0; color: #666666;">
      Pozdrawiamy,<br>
      Zespół Rezerwacja24
    </p>
  `.trim();
}
