import { isValidLocale, Locale } from '@/app/lib/localization/i18n'
import { getTranslations, type Lang } from '@/app/lib/localization/translations'
import { lexicalToPlainText } from '@/utilities/lexicalToPlainText'
import { TicketOrderDTO } from '@/app/components/AffairOrderForm'

export type BankInstructionLexical = Parameters<typeof lexicalToPlainText>[0]


export type AffairOrderEmailParams = {
  customerName: string,
  affairTitle: string,
  email: string,
  phone: string,
  locale: Locale,
  ticketDTOs: TicketOrderDTO[],

  orderRef: string
  placedAt: string
  bankAccountNumber: string
  bankCredentials: string
  bankInstructionHtml: string
  bankInstructionLexical: BankInstructionLexical
  siteName: string
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

  export function buildAffairOrderEmailText(p: AffairOrderEmailParams): string {
    const t = getTranslations(p.locale).orderEmail;
    const site = p.siteName ?? 'Vals'
    const lines = [
      `${t.hello}, ${p.customerName}`,
      '',
      t.thanksPlain.replace(/\{site\}/g, site),
      '',
      `=== ${t.orderDetails} ===`,
      `${t.order}: TEST-1001`,
      `${t.placed}: ${new Date().toISOString().slice(0, 19).replace('T', ' ')}`,
      `${t.payment}: ${t.paymentValue}`,
      '',
      t.testLineItemsNote,
      `${t.eventLabel}: ${p.affairTitle}`,
      `${t.eventIdLabel}`,
      '',
      `=== ${t.contactBlock} ===`,
      p.customerName,
      p.email,
      p.phone,
      '',
    ].filter(Boolean) as string[]
  
    if (p.bankAccountNumber) {
      lines.push(`=== ${t.bankTitle} ===`, `${t.accountLabel}: ${p.bankAccountNumber}`)
    }
    if (p.bankCredentials) {
      lines.push(`${t.credentialsLabel}:`, p.bankCredentials)
    }
    const plainInstr = p.bankInstructionLexical
      ? lexicalToPlainText(p.bankInstructionLexical)
      : ''
    if (plainInstr) {
      lines.push(`${t.instructionsLabel}:`, plainInstr)
    }
  
    return lines.join('\n')
  }
  

export function buildAffairOrderEmailHtml(p: AffairOrderEmailParams): string {
  const t = getTranslations(p.locale).orderEmail
  const site = escapeHtml(p.siteName ?? 'Vals')
  const firstName = escapeHtml(p.customerName.split(/\s+/).filter(Boolean)[0] ?? p.customerName)
  const thanksHtml = t.thanksHtml.replace(/\{site\}/g, site)
  const placedAt = new Date().toISOString().slice(0, 19).replace('T', ' ')
  const totalPrice = p.ticketDTOs.reduce((sum, t) => sum += t.subtotal, 0)
  const bankAccountNumber = escapeHtml(p.bankAccountNumber ?? '')
  const bankCredentials = escapeHtml(p.bankCredentials ?? '').replace(/\r?\n/g, '<br/>')
  const bankInstructionHtml = (p.bankInstructionHtml ?? '').trim()

  const bankBlock =
    bankAccountNumber || bankCredentials || bankInstructionHtml
      ? `

`
      : ''

  return `
 
  <!DOCTYPE html>
<html lang="${escapeHtml(p.locale)}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(p.affairTitle)}</title>
  <style>
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
      background-color: #fff1e3;
      border-left: 4px solid #f5820d;
      padding: 14px 18px;
      font-size: 19px;
      line-height: 1.8;
      color: #3d2010;
    }
    .contact-card strong {
      color: #c0392b;
      font-size: 20px;
    }

    /* ── Bank block ──────────────────────────────────────── */
    .bank-table {
      width: 100%;
    }
    .bank-table td {
      padding: 8px 0;
      font-size: 19px;
      color: #3d2010;
      line-height: 1.7;
    }
    .bank-table strong {
      color: #2b1a0e;
    }
    /* [FIX 2] No box — plain inline text */
    .bank-credentials {
      font-size: 19px;
      color: #3d2010;
    }

    /* ── Footer ──────────────────────────────────────────── */
    .footer {
      background: linear-gradient(135deg, #7a1f14 0%, #a83418 50%, #c05a10 100%);
      padding: 18px 40px;
      text-align: center;
      font-family: 'Courier New', Courier, monospace;
      font-size: 16px;
      letter-spacing: 0.1em;
      color: rgba(255,220,190,0.7);
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">

      <!-- Header -->
      <div class="header">
        <p class="header-label">Order Confirmation</p>
        <h1 class="header-title">${escapeHtml(p.affairTitle)}</h1>
      </div>

      <!-- Body -->
      <div class="body">

        <!-- Greeting -->
        <p class="greeting">${t.hello}, ${firstName}</p>
        <p class="thanks">${thanksHtml}</p>

        <!-- Order details -->
        <h2 class="section-title">${t.orderDetails}</h2>

        <table class="meta-table">
          <tbody>
            <tr>
              <td>
                <strong>${t.order}</strong> &nbsp;·&nbsp;
                <strong>${t.placed}:</strong> ${escapeHtml(placedAt)}
              </td>
            </tr>
            <tr>
              <td>
                <strong>${t.payment}:</strong> ${t.paymentValue}
              </td>
            </tr>
          </tbody>
        </table>


        <!-- Contact block -->
        <h2 class="section-title">${t.contactBlock}</h2>
        <div class="contact-card">
          <strong>${escapeHtml(p.customerName)}</strong><br>
          ${escapeHtml(p.email)}<br>
          ${escapeHtml(p.phone)}
        </div>

        <hr class="divider">
        <!-- Items -->
        <table class="items-table">
          <thead>
            <tr>
              <th>${t.tableProduct}</th>
              <th>${t.tableQty}</th>
              <th>${t.tableSum}</th>
            </tr>
          </thead>
          <tbody>
            ${p.ticketDTOs.map((r) => `
            <tr>
              <td><strong>${p.affairTitle}: ${escapeHtml(r.name)}</strong></td>
              <td>${r.qty}</td>
              <td>${r.subtotal}</td>
            </tr>`).join('')}
            <tr class="total-row">
              <td colspan="2" class="total-label">${t.itemsTotal}: ${totalPrice}</td>
            </tr>
          </tbody>
        </table>


        <hr class="divider">

        <!-- Bank details -->
        <h2 class="section-title">${t.bankTitle}</h2>
        <table class="bank-table">
          <tbody>
            ${bankAccountNumber ? `
            <tr>
              <td>
                <strong>${t.accountLabel}:</strong> ${bankAccountNumber}
              </td>
            </tr>` : ''}
            ${bankCredentials ? `
            <tr>
              <td>
                <strong>${t.credentialsLabel}:</strong><br>
                <span class="bank-credentials">${bankCredentials}</span>
              </td>
            </tr>` : ''}
            ${bankInstructionHtml ? `
            <tr>
              <td>
                <strong>${t.instructionsLabel}:</strong><br>
                <div>${bankInstructionHtml}</div>
              </td>
            </tr>` : ''}
          </tbody>
        </table>

      </div><!-- /body -->

      <!-- Footer -->
      <div class="footer">
        &copy; ${escapeHtml(p.siteName)}
      </div>

    </div><!-- /card -->
  </div>
</body>
</html>
  `
}
