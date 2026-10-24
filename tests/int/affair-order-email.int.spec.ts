import { beforeEach, describe, expect, it, vi } from 'vitest'

const { getPayload, contactCreate, contactPersonCreate, invoiceCreate, invoiceSentEmail, sendEmail } = vi.hoisted(() => ({
  getPayload: vi.fn(),
  contactCreate: vi.fn(),
  contactPersonCreate: vi.fn(),
  invoiceCreate: vi.fn(),
  invoiceSentEmail: vi.fn(),
  sendEmail: vi.fn(),
}))

vi.mock('payload', () => ({
  getPayload,
}))

vi.mock('@payload-config', () => ({ default: {} }))

vi.mock('@/app/lib/ZohoClient/ZohoClient', () => ({
  invoiceService: {
    contact: { create: contactCreate },
    contactperson: { create: contactPersonCreate },
    invoice: { create: invoiceCreate, sentEmail: invoiceSentEmail },
  },
}))

vi.mock('@/app/lib/mail/mailService', () => ({
  MailServce: { subscribeUser: vi.fn() },
}))

import { POST } from '@/app/api/affair-order/route'

describe('affair order notification email', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getPayload.mockResolvedValue({
      find: vi.fn().mockResolvedValue({ docs: [{ archived: false }] }),
      sendEmail,
    })
    contactCreate.mockResolvedValue({ contact_id: 'contact-1' })
    contactPersonCreate.mockResolvedValue({ contact_person_id: 'person-1' })
    invoiceCreate.mockResolvedValue({ invoice_id: 'invoice-1' })
    invoiceSentEmail.mockResolvedValue(undefined)
    sendEmail.mockResolvedValue(undefined)
  })

  it('sends the submission details to both requested inboxes after order creation', async () => {
    const response = await POST(
      new Request('http://localhost/api/affair-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          affairId: 'affair-1',
          affairTitle: 'Spring Concert',
          customerName: 'Alex Example',
          email: 'alex@example.com',
          phone: '+3725550100',
          age: '32',
          notes: 'Please call after 5pm',
          agree: true,
          locale: 'en',
          ticketDTOs: [{ name: 'Adult', qty: 2, price: 25, subtotal: 50 }],
        }),
      }),
    )

    expect(response.status).toBe(200)
    expect(invoiceSentEmail).toHaveBeenCalledWith('invoice-1')
    expect(sendEmail).toHaveBeenCalledTimes(1)
    const email = sendEmail.mock.calls[0][0]
    expect(email.to).toBe('valseAffairs@gmail.com, gulnaravals@gmail.com')
    expect(email.text).toContain('Alex Example')
    expect(email.text).toContain('alex@example.com')
    expect(email.text).toContain('Please call after 5pm')
    expect(email.text).toContain('Spring Concert: Adult')
    expect(email.text).toContain('Количество: 2')
  })
})
