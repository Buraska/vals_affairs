import type { GlobalConfig } from 'payload'
import { locales } from '@/app/lib/localization/i18n'
import { afterChangeHookBankCredentials } from '@/app/lib/hooks/payloadHooks'

export const BankCredentials: GlobalConfig = {
  slug: 'bank-credentials',
  label: 'Bank credentials',
  hooks: { afterChange: [afterChangeHookBankCredentials] },
  admin: {
    description: 'Account details and payment instructions for bank transfers.',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'accountNumber',
      type: 'text',
      label: 'Account number',
      admin: {
        description: 'IBAN or domestic account number.',
      },
    },
    {
      name: 'credentials',
      type: 'textarea',
      label: 'Credentials',
      admin: {
        description: 'Bank name, recipient name, BIC/SWIFT, or other transfer details.',
      },
    },
    {
      type: 'group',
      name: 'instruction',
      label: 'Instruction',
      fields: locales.map((locale) => ({
        name: locale,
        type: 'richText',
        label: locale,
      })),
      admin: {
        description: 'Payment instructions (rich text), per language.',
      },
    },
  ],
}
