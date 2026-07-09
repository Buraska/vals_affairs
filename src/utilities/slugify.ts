const CYRILLIC_MAP: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh',
  з: 'z', и: 'i', й: 'i', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o',
  п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'ts',
  ч: 'ch', ш: 'sh', щ: 'shch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu',
  я: 'ya',
}

/**
 * Convert an arbitrary title into a URL-safe slug.
 *
 * Handles Estonian/Latin diacritics (via Unicode normalization) and Cyrillic
 * (via an explicit transliteration map). Returns an empty string when nothing
 * usable remains.
 */
export function slugify(input: string | null | undefined): string {
  if (!input) return ''

  const transliterated = input
    .toLowerCase()
    .split('')
    .map((char) => (char in CYRILLIC_MAP ? CYRILLIC_MAP[char] : char))
    .join('')

  return transliterated
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
}
