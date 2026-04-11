import type { Locale } from '@/app/lib/localization/i18n'
import { getTranslations } from '@/app/lib/localization/translations'

/** Values from the `web-info` global (passed in so this module never imports Payload at load time). */
export type MailTemplateBranding = {
  siteName?: string | null
  email?: string | null
  phone?: string | null
}

/** Shared email layout CSS; kept at top of module for stable init order. */
export const ORDER_EMAIL_CSS = `
    /* ── Palette ─────────────────────────────────────────── */
    /*
      --sunset-deep:   #c0392b  (deep red-orange)
      --sunset-orange: #e8541a  (core orange)
      --sunset-amber:  #f5820d  (amber)
      --sunset-gold:   #f7b731  (warm gold)
      --sunset-sky:    #fde8cc  (pale peach sky)
      --ink:           #2b1a0e  (warm near-black)
    */

    /* ── Reset ───────────────────────────────────────────── */
    body, table, td, p { margin: 0; padding: 0; }
    body {
      background-color: #fde8cc;
      font-family: Georgia, 'Times New Roman', serif;
      color: #2b1a0e;
      -webkit-font-smoothing: antialiased;
    }

    /* ── Outer wrapper ───────────────────────────────────── */
    .wrapper {
      width: 100%;
      background-color: #fde8cc;
      padding: 40px 16px;
    }

    /* ── Card ────────────────────────────────────────────── */
    .card {
      max-width: 580px;
      margin: 0 auto;
      background-color: #fff8f2;
      border-radius: 4px;
      overflow: hidden;
      box-shadow: 0 4px 32px rgba(192, 57, 43, 0.13);
    }

    /* ── Header band [FIX 4] — deep/muted, not bright ────── */
    .header {
      background: linear-gradient(135deg, #7a1f14 0%, #a83418 50%, #c05a10 100%);
      padding: 36px 40px 30px;
      position: relative;
    }
    .header-label {
      font-family: 'Courier New', Courier, monospace;
      font-size: 15px;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.55);
      margin-bottom: 8px;
    }
    .header-title {
      font-size: 29px;
      font-weight: normal;
      color: #ffe8d0;
      line-height: 1.3;
      text-shadow: 0 1px 4px rgba(0,0,0,0.3);
    }
    /* decorative circle — evokes a setting sun */
    .header::after {
      content: '';
      position: absolute;
      right: -30px;
      bottom: -40px;
      width: 130px;
      height: 130px;
      border-radius: 50%;
      background: rgba(180, 80, 20, 0.2);
      pointer-events: none;
    }

    /* ── Body ────────────────────────────────────────────── */
    .body {
      padding: 36px 40px 40px;
    }

    /* ── Greeting ────────────────────────────────────────── */
    .greeting {
      font-size: 22px;
      line-height: 1.6;
      color: #2b1a0e;
      margin-bottom: 14px;
    }
    .thanks {
      font-size: 20px;
      line-height: 1.7;
      color: #5a3a22;
      margin-bottom: 32px;
    }

    /* ── Section title [FIX 1 + 3] ──────────────────────── */
    /* Big bold serif — looks like a proper heading          */
    .section-title {
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 24px;
      font-weight: bold;
      color: #c0392b;
      margin: 0 0 16px 0;
      padding-bottom: 10px;
      border-bottom: 2px solid #f5820d;
      text-transform: none;
      letter-spacing: 0;
    }

    /* ── Meta rows (order #, payment) [FIX 1] ───────────── */
    .meta-table {
      width: 100%;
      margin-bottom: 28px;
    }
    .meta-table td {
      padding: 6px 0;
      font-size: 20px;
      color: #6b4226;
      line-height: 1.6;
    }
    .meta-table strong {
      font-size: 21px;
      color: #2b1a0e;
    }
    /* ── Items table ─────────────────────────────────────── */
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 8px;
    }
    .items-table thead tr {
      border-bottom: 2px solid #e8541a;
    }
    .items-table thead th {
      font-family: 'Courier New', Courier, monospace;
      font-size: 15px;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: #e8541a;
      padding: 0 0 10px;
      text-align: left;
      font-weight: normal;
    }
    .items-table thead th:not(:first-child) {
      text-align: right;
    }
    .items-table tbody tr {
      border-bottom: 1px solid #fddbb8;
    }
    .items-table tbody td {
      padding: 12px 0;
      font-size: 19px;
      color: #3d2010;
      vertical-align: top;
    }
    .items-table tbody td:not(:first-child) {
      text-align: right;
    }
    .items-table .total-row td {
      border-bottom: none;
      padding-top: 14px;
      font-size: 20px;
    }
    .items-table .total-row .total-label {
      text-align: right;
      font-style: italic;
      color: #a0603a;
    }
    .items-table .total-row .total-amount {
      font-weight: bold;
      color: #c0392b;
      white-space: nowrap;
    }

    /* ── Divider ─────────────────────────────────────────── */
    .divider {
      border: none;
      border-top: 1px solid #fddbb8;
      margin: 28px 0;
    }

    /* ── Contact block ───────────────────────────────────── */
    .contact-card {
      background-color: #fff2e8;
      border: 1px solid #ffd3b8;
      border-radius: 4px;
      padding: 16px 18px;
      font-size: 18px;
      line-height: 1.6;
      color: #3d2010;
      margin-bottom: 26px;
    }

    /* ── Bank table ──────────────────────────────────────── */
    .bank-table {
      width: 100%;
      border-collapse: collapse;
    }
    .bank-table td {
      padding: 12px 0;
      font-size: 19px;
      color: #3d2010;
      line-height: 1.6;
    }
    .bank-credentials {
      font-family: 'Courier New', Courier, monospace;
      font-size: 16px;
      color: #6b4226;
      line-height: 1.6;
    }

    /* ── Footer ──────────────────────────────────────────── */
    .footer {
      padding: 18px 40px 22px;
      background: #fff2e8;
      border-top: 1px solid #ffd3b8;
      font-size: 14px;
      color: rgba(43, 26, 14, 0.65);
      text-align: center;
    }

    /* ── Small screens ───────────────────────────────────── */
    @media (max-width: 520px) {
      .header, .body, .footer { padding-left: 22px !important; padding-right: 22px !important; }
      .header-title { font-size: 25px !important; }
      .greeting { font-size: 20px !important; }
      .thanks { font-size: 18px !important; }
      .section-title { font-size: 22px !important; }
      .meta-table td, .meta-table strong { font-size: 18px !important; }
      .items-table tbody td { font-size: 17px !important; }
    }
`

/** Site label from global web-info (for `{site}` in order email copy). */
export function getMailTemplateSiteName(branding: MailTemplateBranding): string {
  return String(branding.siteName ?? 'Vals')
}

export function mailTemplateHtml(
  content: string,
  title: string,
  locale: Locale,
  branding: MailTemplateBranding,
): string {
  const t = getTranslations(locale).orderEmail

  return `

  <!DOCTYPE html>
<html lang="${(locale)}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${(branding.siteName)}</title>
  <style>
  ${ORDER_EMAIL_CSS}
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
          <!-- Header -->
      <div class="header">
        <p class="header-label">${title}</p>
        <h1 class="header-title">${(branding.siteName)}</h1>
      </div>

      <!-- Body -->
      <div class="body">
      ${content}

      </div><!-- /body -->

      <!-- Footer -->
      <div class="footer">
        <div>&copy; ${(branding.siteName)}</div>
        <div style="margin-top: 10px;">
              <div>${(t.questionsLabel)}</div>
             <div>${(branding.email)}</div>
              <div>${(t.phoneLabel)}: ${(branding.phone)}</div>
            </div>
      </div>

    </div><!-- /card -->
  </div><!-- /wrapper -->
</body>
</html>
  `
}

/** Plain-text wrapper matching {@link mailTemplateHtml} header/footer. */
export function mailTemplateText(
  content: string,
  title: string,
  locale: Locale,
  branding: MailTemplateBranding,
): string {
  const t = getTranslations(locale).orderEmail
  const site = branding.siteName ?? ''
  const lines: string[] = [title, site, '', content.trim(), '', `© ${site}`, t.questionsLabel]
  lines.push(String(branding.email ?? ''))
  lines.push(`${t.phoneLabel}: ${String(branding.phone ?? '')}`)
  return lines.join('\n')
}