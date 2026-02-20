export const locales = ['ee', 'ru', 'en', 'fi'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'ee'

export function isValidLocale(value: string): value is Locale {
  return locales.includes(value as Locale)
}
