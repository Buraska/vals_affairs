import { beforeEach, describe, expect, it, vi } from 'vitest'

const { getPayload, sendEmail, subscribeUser } = vi.hoisted(() => ({
  getPayload: vi.fn(),
  sendEmail: vi.fn(),
  subscribeUser: vi.fn(),
}))

vi.mock('payload', () => ({ getPayload }))
vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('@/app/lib/mail/mailService', () => ({
  MailServce: { subscribeUser },
}))

import { POST } from '@/app/api/affair-order/route'

const translations = {
  ee: {
    subject: 'Saime teie avalduse kätte',
    body: 'Oleme teie avalduse kätte saanud. Võtame teiega peagi ühendust.',
    phoneLabel: 'Telefon',
  },
  ru: {
    subject: 'Заявка получена',
    body: 'Мы получили вашу заявку. Мы свяжемся с вами.',
    phoneLabel: 'Телефон',
  },
  en: {
    subject: 'Application received',
    body: 'We’ve received your application. We’ll be in touch.',
    phoneLabel: 'Phone',
  },
  fi: {
    subject: 'Hakemus vastaanotettu',
    body: 'Olemme vastaanottaneet hakemuksesi. Otamme sinuun yhteyttä.',
    phoneLabel: 'Puhelin',
  },
} as const

function request(locale: string) {
  return new Request('http://localhost/api/affair-order', {
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
      locale,
      ticketDTOs: [{ name: 'Adult', qty: 2, price: 25, subtotal: 50 }],
    }),
  })
}

describe('affair order notification email', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getPayload.mockResolvedValue({
      find: vi.fn().mockResolvedValue({ docs: [{ archived: false }] }),
      findGlobal: vi.fn().mockResolvedValue({
        siteName: 'Waltz & Vals',
        email: 'team@example.com',
        phone: '+3726000000',
      }),
      sendEmail,
    })
    sendEmail.mockResolvedValue(undefined)
  })

  it.each(Object.entries(translations))(
    'sends a localized customer confirmation and unchanged team alert (%s)',
    async (locale, expected) => {
      const response = await POST(request(locale))

      expect(response.status).toBe(200)
      const result = await response.json()
      expect(result).toEqual({ ok: true, orderRef: expect.any(String) })
      expect(sendEmail).toHaveBeenCalledTimes(2)

      const [confirmation, internal] = sendEmail.mock.calls.map(([email]) => email)
      expect(confirmation.to).toBe('alex@example.com')
      expect(confirmation.subject).toBe(expected.subject)
      expect(confirmation.text).toContain(expected.body)
      expect(confirmation.text).toContain('team@example.com')
      expect(confirmation.text).toContain('+3726000000')
      expect(confirmation.text).not.toMatch(/payment|invoice|total|€|pank|оплат|maks/i)

      expect(internal.to).toBe('valseAffairs@gmail.com, gulnaravals@gmail.com')
      expect(internal.text).toContain('Alex Example')
      expect(internal.text).toContain('alex@example.com')
      expect(internal.text).toContain('Please call after 5pm')
      expect(internal.text).toContain('Spring Concert: Adult')
      expect(internal.text).toContain('Количество: 2')
      expect(subscribeUser).toHaveBeenCalledOnce()
      expect(subscribeUser).toHaveBeenCalledWith('alex@example.com', 'Alex Example')
    },
  )

  it('rejects archived affairs before email or subscription side effects', async () => {
    getPayload.mockResolvedValue({
      find: vi.fn().mockResolvedValue({
        docs: [{ archived: false, 'start date': '2020-01-01', 'end date': '2020-01-02' }],
      }),
      findGlobal: vi.fn(),
      sendEmail,
    })

    const response = await POST(request('en'))

    expect(response.status).toBe(409)
    expect(subscribeUser).not.toHaveBeenCalled()
    expect(sendEmail).not.toHaveBeenCalled()
  })
})
