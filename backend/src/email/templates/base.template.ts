/**
 * Bazowy szablon emaila w stylu Rezerwacja24
 * Elegancki, nowoczesny design - kompatybilny z Outlook, iCloud, Gmail
 */
export function getBaseTemplate(title: string, content: string): string {
  const logoUrl = 'https://rezerwacja24.pl/logo.png';
  const year = new Date().getFullYear();
  
  return `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="pl">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="x-apple-disable-message-reformatting" />
  <meta name="format-detection" content="telephone=no, address=no, email=no, date=no" />
  <title>${title}</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
  </style>
  <![endif]-->
  <style type="text/css">
    /* Reset styles */
    body { margin: 0 !important; padding: 0 !important; }
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
    table { border-collapse: collapse !important; }
    /* iOS blue links */
    a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; font-size: inherit !important; font-family: inherit !important; font-weight: inherit !important; line-height: inherit !important; }
    /* Gmail blue links */
    u + #body a { color: inherit; text-decoration: none; font-size: inherit; font-family: inherit; font-weight: inherit; line-height: inherit; }
    /* Samsung Mail */
    #MessageViewBody a { color: inherit; text-decoration: none; font-size: inherit; font-family: inherit; font-weight: inherit; line-height: inherit; }
  </style>
</head>
<body id="body" style="margin: 0 !important; padding: 0 !important; background-color: #f5f5f5; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
  
  <!-- Preheader text (hidden) -->
  <div style="display: none; font-size: 1px; color: #f5f5f5; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    ${title}
  </div>

  <!-- Wrapper table for Outlook -->
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        
        <!--[if mso]>
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" align="center">
        <tr>
        <td>
        <![endif]-->
        
        <!-- Email container -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 8px;">
          
          <!-- Logo -->
          <tr>
            <td style="padding: 40px 40px 32px 40px; text-align: left;">
              <a href="https://rezerwacja24.pl" target="_blank" style="text-decoration: none;">
                <img src="${logoUrl}" alt="Rezerwacja24" width="180" height="auto" style="display: block; max-width: 180px; height: auto; border: 0;" />
              </a>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 0 40px 40px 40px; color: #333333; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; font-size: 16px; line-height: 26px;">
              ${content}
            </td>
          </tr>
          
        </table>
        
        <!-- Footer (outside main container) -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px;">
          <tr>
            <td style="padding: 32px 40px 0 40px;">
              <p style="margin: 0 0 16px 0; color: #666666; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; font-size: 14px; line-height: 22px;">
                Masz pytania? Odpowiedz na tego maila lub napisz do nas na 
                <a href="mailto:kontakt@rezerwacja24.pl" style="color: #10b981; text-decoration: none;">kontakt@rezerwacja24.pl</a>
              </p>
              <p style="margin: 0 0 8px 0; color: #999999; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; font-size: 13px; line-height: 20px;">
                <a href="https://rezerwacja24.pl" style="color: #10b981; text-decoration: none;">rezerwacja24.pl</a>
                <span style="color: #cccccc;">&nbsp;&nbsp;·&nbsp;&nbsp;</span>
                <a href="https://rezerwacja24.pl/privacy" style="color: #999999; text-decoration: none;">Polityka prywatności</a>
                <span style="color: #cccccc;">&nbsp;&nbsp;·&nbsp;&nbsp;</span>
                <a href="https://rezerwacja24.pl/terms" style="color: #999999; text-decoration: none;">Regulamin</a>
              </p>
              <p style="margin: 16px 0 0 0; color: #bbbbbb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; font-size: 12px; line-height: 18px;">
                © ${year} Rezerwacja24. Wszelkie prawa zastrzeżone.
              </p>
            </td>
          </tr>
        </table>
        
        <!--[if mso]>
        </td>
        </tr>
        </table>
        <![endif]-->
        
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
