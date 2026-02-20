"use client";

import Link from 'next/link'
import type { Lang, TranslationsSchema } from '@/app/lib/localization/translations'

export type navItems = 
    { name: string, href: string}



export function NavItems({ items }: {items: navItems[]},) {
    return (
        <>
            {items.map(({ name, href }) => (
                <Link key={name} href={`${href}`} className="rounded px-3 py-2 text-sm font-medium text-stone-700 transition hover:bg-amber-50 hover:text-amber-800">
                    {name}
                </Link>
            ))}
        </>
    )
}
