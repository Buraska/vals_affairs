"use client";

import Link from 'next/link'
import type { Lang, TranslationsSchema } from '@/app/lib/localization/translations'

export type navItems =
  { name: string, href: string }



export function NavItems({ items }: { items: navItems[] }) {
  return (
    <>
      {items.map(({ name, href }) => (
        <Link
          key={href}
          href={href}
          className="relative text-sm text-[var(--muted)] hover:text-[var(--dark)] transition-colors after:absolute after:bottom-[-2px] after:left-0 after:h-px after:w-0 after:bg-[var(--rust)] after:transition-[width] after:duration-300 after:ease-out hover:after:w-full"
        >
          {name}
        </Link>
      ))}
    </>
  )
}
