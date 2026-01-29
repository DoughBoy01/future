/**
 * Base Email Template
 *
 * Provides consistent layout and styling for all transactional emails.
 * Design inspired by Airbnb's email aesthetic with FutureEdge branding.
 *
 * Features:
 * - Responsive 600px max-width
 * - Pink gradient header (#FF385C → #fe4d39)
 * - System font stack for cross-platform consistency
 * - Accessible color contrast (WCAG AA compliant)
 */

export interface BaseLayoutOptions {
  previewText?: string;
  showLogo?: boolean;
}

export function renderBaseLayout(
  content: string,
  options: BaseLayoutOptions = {}
): string {
  const { previewText, showLogo = true } = options;
  const currentYear = new Date().getFullYear();

  return `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  ${previewText ? `<meta name="preview" content="${previewText}">` : ''}
  <title>FutureEdge</title>

  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->

  <style type="text/css">
    /* Reset styles */
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }

    /* Base styles */
    body {
      margin: 0 !important;
      padding: 0 !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #222222;
      background-color: #f7f7f7;
      width: 100% !important;
      height: 100% !important;
    }

    /* Container */
    .email-wrapper {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }

    .email-container {
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
    }

    /* Header */
    .header {
      background: linear-gradient(135deg, #FF385C 0%, #fe4d39 100%);
      color: white;
      padding: 40px 30px;
      text-align: center;
      border-radius: 12px 12px 0 0;
    }

    .header h1 {
      margin: 0 0 10px 0;
      font-size: 32px;
      font-weight: 700;
      line-height: 1.2;
    }

    .header p {
      margin: 0;
      font-size: 16px;
      opacity: 0.95;
    }

    .logo {
      font-size: 28px;
      font-weight: 700;
      color: white;
      text-decoration: none;
      letter-spacing: -0.5px;
    }

    /* Content */
    .content {
      padding: 40px 30px;
      font-size: 16px;
      line-height: 1.6;
      color: #222222;
    }

    .content p {
      margin: 0 0 16px 0;
    }

    .content h2 {
      font-size: 22px;
      font-weight: 600;
      margin: 24px 0 16px 0;
      color: #222222;
    }

    .content h3 {
      font-size: 18px;
      font-weight: 600;
      margin: 20px 0 12px 0;
      color: #222222;
    }

    .content ul {
      margin: 16px 0;
      padding-left: 20px;
    }

    .content li {
      margin: 8px 0;
    }

    /* Buttons */
    .button {
      display: inline-block;
      background: #FF385C;
      color: white !important;
      padding: 14px 28px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      text-align: center;
      margin: 16px 0;
      transition: background 0.2s ease;
    }

    .button:hover {
      background: #fe4d39;
    }

    .button-secondary {
      background: #FFFFFF;
      color: #222222 !important;
      border: 2px solid #222222;
    }

    .button-secondary:hover {
      background: #F7F7F7;
    }

    /* Info boxes */
    .info-box {
      background: #EBF4FF;
      border: 2px solid #3B82F6;
      border-radius: 12px;
      padding: 24px;
      margin: 24px 0;
    }

    .info-box h3 {
      color: #1E40AF;
      margin-top: 0;
    }

    .success-box {
      background: #D1FAE5;
      border: 2px solid #059669;
      border-radius: 12px;
      padding: 24px;
      margin: 24px 0;
    }

    .success-box h3 {
      color: #047857;
      margin-top: 0;
    }

    .warning-box {
      background: linear-gradient(135deg, #F97316 0%, #DC2626 100%);
      color: white;
      border-radius: 12px;
      padding: 24px;
      margin: 24px 0;
      text-align: center;
    }

    .warning-box h3 {
      color: white;
      margin-top: 0;
    }

    .warning-box .button {
      background: white;
      color: #DC2626 !important;
    }

    /* Tables */
    .details-table {
      width: 100%;
      margin: 16px 0;
      border-collapse: collapse;
    }

    .details-table tr {
      border-bottom: 1px solid #DDDDDD;
    }

    .details-table tr:last-child {
      border-bottom: none;
    }

    .details-table td {
      padding: 12px 0;
      font-size: 15px;
    }

    .details-table td:first-child {
      font-weight: 600;
      color: #484848;
    }

    .details-table td:last-child {
      text-align: right;
    }

    /* Footer */
    .footer {
      background: #F7F7F7;
      padding: 30px;
      text-align: center;
      font-size: 12px;
      color: #717171;
      line-height: 1.5;
      border-radius: 0 0 12px 12px;
    }

    .footer a {
      color: #FF385C;
      text-decoration: none;
    }

    .footer a:hover {
      text-decoration: underline;
    }

    .footer p {
      margin: 8px 0;
    }

    .social-links {
      margin: 16px 0;
    }

    .social-links a {
      display: inline-block;
      margin: 0 8px;
      color: #717171;
      text-decoration: none;
    }

    /* Divider */
    .divider {
      height: 1px;
      background: #DDDDDD;
      margin: 24px 0;
      border: none;
    }

    /* Responsive */
    @media only screen and (max-width: 600px) {
      .email-wrapper {
        width: 100% !important;
        border-radius: 0 !important;
      }

      .header {
        padding: 30px 20px !important;
        border-radius: 0 !important;
      }

      .header h1 {
        font-size: 26px !important;
      }

      .content {
        padding: 30px 20px !important;
      }

      .button {
        display: block !important;
        width: 100% !important;
        box-sizing: border-box !important;
      }

      .footer {
        padding: 20px !important;
        border-radius: 0 !important;
      }
    }

    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      .email-wrapper {
        background-color: #1a1a1a !important;
      }

      .content {
        color: #e5e5e5 !important;
      }

      .content h2,
      .content h3 {
        color: #ffffff !important;
      }
    }
  </style>
</head>
<body>
  ${previewText ? `
  <!-- Preview text (hidden) -->
  <div style="display:none;font-size:1px;color:#ffffff;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    ${previewText}
  </div>
  ` : ''}

  <!-- Email wrapper -->
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f7f7f7; margin: 0; padding: 40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" class="email-container">
          <tr>
            <td class="email-wrapper">
              ${content}

              <!-- Footer -->
              <div class="footer">
                ${showLogo ? `<p class="logo">FutureEdge</p>` : ''}
                <p>Empowering children through enriching camp experiences</p>
                <hr class="divider" style="margin: 16px 0; opacity: 0.3;">
                <p>© ${currentYear} FutureEdge. All rights reserved.</p>
                <p>
                  <a href="mailto:support@futureedge.com">Contact Support</a> ·
                  <a href="https://futureedge.com/help">Help Center</a>
                </p>
                <p style="margin-top: 16px; font-size: 11px; color: #999999;">
                  You received this email because you have an account with FutureEdge.<br>
                  If you have questions, please contact us at
                  <a href="mailto:support@futureedge.com" style="color: #999999;">support@futureedge.com</a>
                </p>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
