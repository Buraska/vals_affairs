export const locales = ['ee', 'ru', 'en', 'fi'] as const
export const OG_LOCALES: Record<string, string> = {
  ee: 'et_EE',
  ru: 'ru_RU',
  en: 'en_US',
  fi: 'fi_FI',
}

/**
 * BCP-47 language codes for each locale slug. Note the Estonian slug `ee` maps
 * to the real language code `et`. Used for `<html lang>` and hreflang.
 */
export const HTML_LANG: Record<string, string> = {
  ee: 'et',
  ru: 'ru',
  en: 'en',
  fi: 'fi',
}

export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'ru'

export function isValidLocale(value: string): value is Locale {
  return locales.includes(value as Locale)
}
