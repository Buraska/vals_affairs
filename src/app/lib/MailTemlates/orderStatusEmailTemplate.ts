import type { Locale } from '@/app/lib/localization/i18n'
import { getTranslations } from '@/app/lib/localization/translations'
import { mailTemplateHtml, mailTemplateText, type MailTemplateBranding } from './mailTemplate'
import { escapeHtml } from '@/utilities/utility'

export type OrderStatusEmailParams = {
  locale: Locale

  orderRef: string
  statusPrev: string
  statusNext: string
  updatedAt: string

  affairTitle: string

  customerName: string
  customerEmail: string
  customerPhone: string

  items: Array<{ ticketName: string; qty: number; subtotal: number }>
  total: number
  currency: string

  paymentMethod: string
  transactionId?: string | null
  provider?: string | null
  paidAt?: string | null

  branding: MailTemplateBranding
}


export function buildOrderStatusEmailText(p: OrderStatusEmailParams): string {
  const t = getTranslations(p.locale).orderEmail

  const lines: string[] = []
  lines.push(`${t.statusUpdateTitle}`)
  lines.push('')
  lines.push(`${t.order}: ${p.orderRef}`)
  lines.push(`${t.previousStatusLabel}: ${p.statusPrev}`)
  lines.push(`${t.newStatusLabel}: ${p.statusNext}`)
  lines.push(`${t.updatedAtLabel}: ${p.updatedAt}`)
  lines.push('')
  lines.push(`${t.eventLabel}: ${p.affairTitle}`)
  lines.push('')
  lines.push(`${t.contactBlock}`)
  lines.push(`${p.customerName}`)
  lines.push(`${p.customerEmail}`)
  lines.push(`${p.customerPhone}`)
  lines.push('')
  lines.push(`${t.orderDetails}`)
  for (const i of p.items) {
    lines.push(`- ${i.ticketName} × ${i.qty} = ${i.subtotal} ${p.currency}`)
  }
  lines.push(`${t.itemsTotal}: ${p.total} ${p.currency}`)
  lines.push('')
  lines.push(`${t.paymentDetailsTitle}`)
  lines.push(`${t.payment}: ${p.paymentMethod}`)
  if (p.transactionId) lines.push(`transactionId: ${p.transactionId}`)
  if (p.provider) lines.push(`provider: ${p.provider}`)
  if (p.paidAt) lines.push(`paidAt: ${p.paidAt}`)
  lines.push('')

  return mailTemplateText(lines.join('\n'), t.statusUpdateTitle, p.locale, p.branding)
}

export function buildOrderStatusEmailHtml(p: OrderStatusEmailParams): string {
  const t = getTranslations(p.locale).orderEmail
  const total = `${p.total} ${escapeHtml(p.currency)}`

  const content = ` <div class="wrapper">

        <h2 class="section-title">${escapeHtml(t.orderDetails)}</h2>
        <table class="meta-table">
          <tbody>
            <tr><td><strong>${escapeHtml(t.order)}:</strong> ${escapeHtml(p.orderRef)}</td></tr>
            <tr><td><strong>${escapeHtml(t.previousStatusLabel)}:</strong> ${escapeHtml(p.statusPrev)}</td></tr>
            <tr><td><strong>${escapeHtml(t.newStatusLabel)}:</strong> ${escapeHtml(p.statusNext)}</td></tr>
            <tr><td><strong>${escapeHtml(t.updatedAtLabel)}:</strong> ${escapeHtml(p.updatedAt)}</td></tr>
            <tr><td><strong>${escapeHtml(t.eventLabel)}:</strong> ${escapeHtml(p.affairTitle)}</td></tr>
          </tbody>
        </table>

        <h2 class="section-title">${escapeHtml(t.contactBlock)}</h2>
        <div class="contact-card">
          <strong>${escapeHtml(p.customerName)}</strong><br>
          ${escapeHtml(p.customerEmail)}<br>
          ${escapeHtml(p.customerPhone)}
        </div>

        <hr class="divider">
        <table class="items-table">
          <thead>
            <tr>
              <th>${escapeHtml(t.tableProduct)}</th>
              <th>${escapeHtml(t.tableQty)}</th>
              <th>${escapeHtml(t.tableSum)}</th>
            </tr>
          </thead>
          <tbody>
            ${p.items
              .map(
                (r) => `
            <tr>
              <td><strong>${escapeHtml(r.ticketName)}</strong></td>
              <td>${r.qty}</td>
              <td>${r.subtotal} ${escapeHtml(p.currency)}</td>
            </tr>`,
              )
              .join('')}
            <tr class="total-row">
              <td colspan="2" class="total-label">${escapeHtml(t.itemsTotal)}:</td>
              <td class="total-amount">${total}</td>
            </tr>
          </tbody>
        </table>

        <hr class="divider">
        <h2 class="section-title">${escapeHtml(t.paymentDetailsTitle)}</h2>
        <table class="bank-table">
          <tbody>
            <tr><td><strong>${escapeHtml(t.payment)}:</strong> ${escapeHtml(p.paymentMethod)}</td></tr>
            ${p.transactionId ? `<tr><td><strong>transactionId:</strong> ${escapeHtml(p.transactionId)}</td></tr>` : ''}
            ${p.provider ? `<tr><td><strong>provider:</strong> ${escapeHtml(p.provider)}</td></tr>` : ''}
            ${p.paidAt ? `<tr><td><strong>paidAt:</strong> ${escapeHtml(p.paidAt)}</td></tr>` : ''}
          </tbody>
        </table>
      </div>
  `
  return mailTemplateHtml(content, t.statusUpdateTitle, p.locale, p.branding)

}

