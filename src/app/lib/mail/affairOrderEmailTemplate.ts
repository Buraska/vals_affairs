import { isValidLocale, Locale } from '@/app/lib/localization/i18n'
import { getTranslations, type Lang } from '@/app/lib/localization/translations'
import { lexicalToPlainText } from '@/utilities/lexicalToPlainText'
import type { TicketOrderDTO } from '@/app/lib/affairOrderTypes'
import {
  getMailTemplateSiteName,
  mailTemplateHtml,
  mailTemplateText,
  type MailTemplateBranding,
} from '@/app/lib/mail/mailTemplate'
import { escapeHtml } from '@/utilities/utility'

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

  branding: MailTemplateBranding
}


export function buildAffairOrderEmailText(p: AffairOrderEmailParams): string {
  const t = getTranslations(p.locale).orderEmail
  const placedAt = new Date().toISOString().slice(0, 19).replace('T', ' ')
  const totalPrice = p.ticketDTOs.reduce((sum, r) => sum + (r.subtotal ?? 0), 0)

  const lines: string[] = []
  lines.push(`${t.hello} ${p.customerName}`)
  lines.push('')
  lines.push(t.thanksPlain.replace(/\{site\}/g, getMailTemplateSiteName(p.branding)))
  lines.push('')
  lines.push(`${t.orderDetails}`)
  lines.push(`${t.order}: ${p.orderRef}`)
  lines.push(`${t.placed}: ${placedAt}`)
  lines.push(`${t.payment}: ${t.paymentValue}`)
  lines.push('')
  lines.push(`${t.contactBlock}`)
  lines.push(`${p.customerName}`)
  lines.push(`${p.email}`)
  lines.push(`${p.phone}`)
  lines.push('')
  lines.push(`${t.itemsTotal}: ${totalPrice}`)
  lines.push('')

  if (p.bankAccountNumber || p.bankCredentials || p.bankInstructionLexical) {
    lines.push(t.bankTitle)
    if (p.bankAccountNumber) lines.push(`${t.accountLabel}: ${p.bankAccountNumber}`)
    if (p.bankCredentials) lines.push(`${t.credentialsLabel}: ${p.bankCredentials}`)
    const instruction = lexicalToPlainText(p.bankInstructionLexical)
    if (instruction) lines.push(`${t.instructionsLabel}: ${instruction}`)
    lines.push('')
  }

  return mailTemplateText(lines.join('\n'), t.orderDetails, p.locale, p.branding)
}

export async function buildAffairOrderEmailHtml(p: AffairOrderEmailParams): Promise<string> {
  const t = getTranslations(p.locale).orderEmail
  const site = escapeHtml(getMailTemplateSiteName(p.branding))
  const firstName = escapeHtml(p.customerName.split(/\s+/).filter(Boolean)[0] ?? p.customerName)
  const thanksHtml = t.thanksHtml.replace(/\{site\}/g, site)
  const placedAt = new Date().toISOString().slice(0, 19).replace('T', ' ')
  const totalPrice = p.ticketDTOs.reduce((sum, t) => sum += t.subtotal, 0)
  const bankAccountNumber = escapeHtml(p.bankAccountNumber ?? '')
  const bankCredentials = escapeHtml(p.bankCredentials ?? '').replace(/\r?\n/g, '<br/>')
  const bankInstructionHtml = (p.bankInstructionHtml ?? '').trim()


  const content = `
        <p class="greeting">${t.hello}, ${firstName}</p>
        <p class="thanks">${thanksHtml}</p>

        <h2 class="section-title">${t.orderDetails}</h2>
        <table class="meta-table">
          <tbody>
            <tr>
              <td>
                <strong>${t.order}:</strong> ${escapeHtml(p.orderRef)} &nbsp;·&nbsp;
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

        <h2 class="section-title">${t.contactBlock}</h2>
        <div class="contact-card">
          <strong>${escapeHtml(p.customerName)}</strong><br>
          ${escapeHtml(p.email)}<br>
          ${escapeHtml(p.phone)}
        </div>

        <hr class="divider">
        <table class="items-table">
          <thead>
            <tr>
              <th>${t.tableProduct}</th>
              <th>${t.tableQty}</th>
              <th>${t.tableSum}</th>
            </tr>
          </thead>
          <tbody>
            ${p.ticketDTOs
              .map(
                (r) => `
            <tr>
              <td><strong>${escapeHtml(p.affairTitle)}: ${escapeHtml(r.name)}</strong></td>
              <td>${r.qty}</td>
              <td>${r.subtotal}</td>
            </tr>`,
              )
              .join('')}
            <tr class="total-row">
              <td colspan="2" class="total-label">${t.itemsTotal}: ${totalPrice}</td>
            </tr>
          </tbody>
        </table>

        <hr class="divider">
        <h2 class="section-title">${t.bankTitle}</h2>
        <table class="bank-table">
          <tbody>
            ${bankAccountNumber ? `
            <tr>
              <td><strong>${t.accountLabel}:</strong> ${bankAccountNumber}</td>
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
  `

  return mailTemplateHtml(content, t.orderDetails, p.locale, p.branding)
}
