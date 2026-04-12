import { afterChangeHookOrder } from '@/app/lib/hooks/payloadHooks'
import type { Access, CollectionConfig } from 'payload'

const adminOnly: Access = ({ req }) => Boolean(req.user)

export const Order: CollectionConfig = {
  slug: 'order',
  access: {
    read: adminOnly,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  hooks: {
    afterChange: [afterChangeHookOrder],
  },
  admin: {
    useAsTitle: 'orderRef',
    defaultColumns: ['orderRef', 'status', 'affair', 'createdAt', 'updatedAt'],
  },
  fields: [
    {
      name: 'orderRef',
      type: 'text',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending_payment',
      options: [
        { label: 'Pending payment', value: 'pending_payment' },
        { label: 'Paid', value: 'paid' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
    },
    {
      name: 'locale',
      type: 'select',
      required: true,
      options: [
        { label: 'Eesti', value: 'ee' },
        { label: 'Русский', value: 'ru' },
        { label: 'English', value: 'en' },
        { label: 'Suomi', value: 'fi' },
      ],
    },
    {
      name: 'affair',
      type: 'relationship',
      relationTo: 'Affair',
      required: true,
    },
    {
      type: 'group',
      name: 'customer',
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'text', required: true },
        { name: 'age', type: 'text' },
      ],
    },
    { name: 'notes', type: 'textarea' },
    {
      name: 'items',
      type: 'array',
      fields: [
        { name: 'ticketName', type: 'text', required: true },
        { name: 'qty', type: 'number', required: true },
        { name: 'unitPrice', type: 'number', required: true },
        { name: 'subtotal', type: 'number', required: true },
      ],
    },
    {
      type: 'group',
      name: 'amounts',
      fields: [
        { name: 'total', type: 'number', required: true },
        { name: 'currency', type: 'text', required: true, defaultValue: 'EUR' },
      ],
    },
    {
      type: 'group',
      name: 'payment',
      fields: [
        {
          name: 'method',
          type: 'select',
          required: true,
          defaultValue: 'bank_transfer',
          options: [{ label: 'Bank transfer', value: 'bank_transfer' }],
        },
        { name: 'transactionId', type: 'text' },
        { name: 'provider', type: 'text' },
        { name: 'paidAt', type: 'date' },
      ],
    },
    {
      type: 'group',
      name: 'email',
      fields: [
        { name: 'sent', type: 'checkbox', defaultValue: false },
        { name: 'error', type: 'textarea' },
      ],
    },
    {
      type: 'group',
      name: 'statusEmail',
      fields: [
        { name: 'lastStatus', type: 'text' },
        { name: 'lastSentAt', type: 'date' },
        { name: 'lastError', type: 'textarea' },
      ],
    },
  ],
  timestamps: true,
}

