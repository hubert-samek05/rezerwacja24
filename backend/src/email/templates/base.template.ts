/**
 * Bazowy szablon emaila w stylu Rezerwacja24
 * Profesjonalny, pełna szerokość, bez emotikon
 * Kompatybilny z Outlook, iCloud, Gmail
 */
export function getBaseTemplate(title: string, content: string, businessName?: string): string {
  const logoUrl = 'https://rezerwacja24.pl/logo-dark.png';
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
    body { margin: 0 !important; padding: 0 !important; }
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
    table { border-collapse: collapse !important; }
    a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; font-size: inherit !important; font-family: inherit !important; font-weight: inherit !important; line-height: inherit !important; }
    u + #body a { color: inherit; text-decoration: none; font-size: inherit; font-family: inherit; font-weight: inherit; line-height: inherit; }
    #MessageViewBody a { color: inherit; text-decoration: none; font-size: inherit; font-family: inherit; font-weight: inherit; line-height: inherit; }
  </style>
</head>
<body id="body" style="margin: 0 !important; padding: 0 !important; background-color: #f8fafc; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
  
  <div style="display: none; font-size: 1px; color: #f8fafc; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    ${title}
  </div>

  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8fafc;">
    <tr>
      <td align="center" style="padding: 0;">
        
        <!--[if mso]>
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="700" align="center">
        <tr>
        <td>
        <![endif]-->
        
        <!-- Header with logo - full width dark -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 700px; background-color: #0f172a;">
          <tr>
            <td style="padding: 24px 40px;">
              <a href="https://rezerwacja24.pl" target="_blank" style="text-decoration: none;">
                <img src="${logoUrl}" alt="Rezerwacja24" width="200" height="auto" style="display: block; max-width: 200px; height: auto; border: 0;" />
              </a>
            </td>
          </tr>
        </table>
        
        <!-- Main content container -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 700px; background-color: #ffffff;">
          <tr>
            <td style="padding: 48px 40px; color: #1e293b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; font-size: 16px; line-height: 28px;">
              ${content}
            </td>
          </tr>
        </table>
        
        <!-- Footer -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 700px; background-color: #f1f5f9;">
          <tr>
            <td style="padding: 32px 40px; border-top: 1px solid #e2e8f0;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                    <p style="margin: 0 0 12px 0; color: #64748b; font-size: 14px; line-height: 22px;">
                      Ta wiadomość została wysłana automatycznie przez system Rezerwacja24.
                    </p>
                    <p style="margin: 0 0 16px 0; color: #64748b; font-size: 14px; line-height: 22px;">
                      W razie pytań prosimy o kontakt: <a href="mailto:kontakt@rezerwacja24.pl" style="color: #0f766e; text-decoration: none; font-weight: 500;">kontakt@rezerwacja24.pl</a>
                    </p>
                    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                    <p style="margin: 0; color: #94a3b8; font-size: 12px; line-height: 18px;">
                      <a href="https://rezerwacja24.pl" style="color: #64748b; text-decoration: none;">rezerwacja24.pl</a>
                      &nbsp;&nbsp;|&nbsp;&nbsp;
                      <a href="https://rezerwacja24.pl/privacy" style="color: #64748b; text-decoration: none;">Polityka prywatności</a>
                      &nbsp;&nbsp;|&nbsp;&nbsp;
                      <a href="https://rezerwacja24.pl/terms" style="color: #64748b; text-decoration: none;">Regulamin</a>
                    </p>
                    <p style="margin: 12px 0 0 0; color: #94a3b8; font-size: 12px; line-height: 18px;">
                      © ${year} Rezerwacja24. Wszelkie prawa zastrzeżone.
                    </p>
                  </td>
                </tr>
              </table>
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
