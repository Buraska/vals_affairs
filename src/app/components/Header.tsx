"use client";

import { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/app/contexts/LanguageContext";
import type { Lang } from "@/app/lib/localization/translations";
import { locales } from "@/app/lib/localization/i18n";
import type { Category } from "@/payload-types";
import { NavItems } from "./NavItems";

const navItemsHead = [
  { key: "home", href: "#" },
] as const;


const navItemsTail = [
  { key: "about", href: "/about" },
] as const;

const langLabels: Record<Lang, string> = { ee: "ee", ru: "ru", en: "en", fi: "fi" };

const _unusedSocialLinks = [
  {
    name: "Instagram",
    href: "https://instagram.com/",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
  {
    name: "Facebook",
    href: "https://facebook.com/",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
];

// Instagram icon (rounded square + lens circle, 24×24)
const instagramIcon = (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153.509.509.908 1.07 1.153 1.772.247.637.415 1.363.465 2.428.048 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 0 1-1.153 1.772 4.915 4.915 0 0 1-1.772 1.153c-.637.247-1.363.415-2.428.465C15.056 21.987 14.717 22 12 22c-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 0 1-1.772-1.153 4.904 4.904 0 0 1-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 0 1 1.153-1.772A4.897 4.897 0 0 1 5.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm6.5-.25a1.25 1.25 0 1 0-2.5 0 1.25 1.25 0 0 0 2.5 0zM12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6z" />
  </svg>
)
const facebookIcon = (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
)

export type WebInfoData = {
  siteName?: string | null
  siteDescription?: string | null
  phone?: string | null
  email?: string | null
  instagramUrl?: string | null
  facebookUrl?: string | null
}

export function Header({
  categories = [],
  webInfo,
}: {
  categories?: Category[]
  webInfo?: WebInfoData | null
}) {
  const { lang, t } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);

  const siteName = webInfo?.siteName ?? t.meta.siteName;

  return (
    <header
      className="sticky top-0 z-50 h-[72px] flex items-center justify-between px-4 sm:px-8 lg:px-16 border-b border-[var(--border)]"
      style={{ background: "rgba(245, 240, 232, 0.92)", backdropFilter: "blur(12px)" }}
    >
      <div className="flex items-center gap-4 min-w-0">
        <button
          type="button"
          onClick={() => setMobileOpen((o) => !o)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded border border-[var(--border)] text-[var(--muted)] lg:hidden"
          aria-label={t.common.menu}
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
        <Link href={`/${lang}`} className="shrink-0">
          <span className="font-serif italic text-4xl  tracking-tight text-[var(--dark)]" style={{ fontFamily: "var(--font-playfair)" }}>
            {siteName}
          </span>
        </Link>
        <div className="hidden lg:flex items-center gap-3 ml-4">
          {webInfo?.instagramUrl ? (
            <a href={webInfo.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-[var(--muted)] hover:text-[var(--dark)] transition" aria-label="Instagram">
              {instagramIcon}
            </a>
          ) : null}
          {webInfo?.facebookUrl ? (
            <a href={webInfo.facebookUrl} target="_blank" rel="noopener noreferrer" className="text-[var(--muted)] hover:text-[var(--dark)] transition" aria-label="Facebook">
              {facebookIcon}
            </a>
          ) : null}
        </div>
      </div>

      <nav className="hidden lg:flex items-center gap-8">
        <NavItems items={navItemsHead.map(({ key, href }) => ({ name: t.nav[key], href: `/${lang}${href}` }))} />
        <NavItems items={categories.map(({ id, title }) => ({ name: title, href: `/${lang}/category/${id}` }))} />
        <NavItems items={navItemsTail.map(({ key, href }) => ({ name: t.nav[key], href: `/${lang}${href}` }))} />
        <div className="flex items-center gap-3 pl-2">
          {webInfo?.phone ? (
            <a href={`tel:${webInfo.phone.replace(/\s/g, "")}`} className="text-sm text-[var(--muted)] hover:text-[var(--dark)] transition">
              {webInfo.phone}
            </a>
          ) : null}
          {webInfo?.email ? (
            <a href={`mailto:${webInfo.email}`} className="text-sm text-[var(--muted)] hover:text-[var(--dark)] transition">
              {webInfo.email}
            </a>
          ) : null}
          <div className="hidden lg:flex flex rounded border border-[var(--border)] p-0.5">
            {locales.map((l) => (
              <Link
                key={l}
                href={`/${l}`}
                className={`rounded px-2.5 py-1 text-xs font-medium transition ${lang === l ? "bg-[var(--dark)] text-[var(--cream)]" : "text-[var(--muted)] hover:text-[var(--dark)]"}`}
                prefetch={false}
              >
                {langLabels[l]}
              </Link>
            ))}
          </div>
        </div>
      </nav>


      

      {mobileOpen && (
        <div className="absolute top-full left-0 right-0 border-t border-[var(--border)] bg-[var(--card-bg)] px-4 py-4 lg:hidden shadow-lg">
          <nav className="flex flex-col gap-1">
            {navItemsHead.map(({ key, href }) => (
              <Link key={key} href={`/${lang}${href}`} onClick={() => setMobileOpen(false)} className="nav-link-mobile py-2.5 text-sm text-[var(--muted)] hover:text-[var(--dark)]">
                {t.nav[key]}
              </Link>
            ))}
            {categories.map((cat) => (
              <Link key={cat.id} href={`/${lang}/category/${cat.id}`} onClick={() => setMobileOpen(false)} className="py-2.5 text-sm text-[var(--muted)] hover:text-[var(--dark)]">
                {cat.title}
              </Link>
            ))}
            {navItemsTail.map(({ key, href }) => (
              <Link key={key} href={`/${lang}${href}`} onClick={() => setMobileOpen(false)} className="py-2.5 text-sm text-[var(--muted)] hover:text-[var(--dark)]">
                {t.nav[key]}
              </Link>
            ))}
            <div className="mt-3 pt-3 border-t border-[var(--border)] flex flex-wrap gap-2">
              {locales.map((l) => (
                <Link
                  key={l}
                  href={`/${l}`}
                  onClick={() => setMobileOpen(false)}
                  className={`rounded border border-[var(--border)] px-2.5 py-1.5 text-xs font-medium transition ${lang === l ? "bg-[var(--dark)] text-[var(--cream)]" : "text-[var(--muted)] hover:text-[var(--dark)]"}`}
                  prefetch={false}
                >
                  {langLabels[l]}
                </Link>
              ))}
            </div>
            {webInfo?.phone ? (
              <a href={`tel:${webInfo.phone.replace(/\s/g, "")}`} onClick={() => setMobileOpen(false)} className="mt-2 py-2 text-sm text-[var(--rust)]">
                {webInfo.phone}
              </a>
            ) : null}
            {webInfo?.email ? (
              <a href={`mailto:${webInfo.email}`} onClick={() => setMobileOpen(false)} className="py-2 text-sm text-[var(--rust)]">
                {webInfo.email}
              </a>
            ) : null}
            {(webInfo?.facebookUrl || webInfo?.instagramUrl) && (
              <div className="mt-3 pt-3 border-t border-[var(--border)] flex gap-3">
                {webInfo?.instagramUrl ? (
                  <a href={webInfo.instagramUrl} target="_blank" rel="noopener noreferrer" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 text-sm text-[var(--muted)]" aria-label="Instagram">
                    {instagramIcon}
                    Instagram
                  </a>
                ) : null}
                {webInfo?.facebookUrl ? (
                  <a href={webInfo.facebookUrl} target="_blank" rel="noopener noreferrer" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 text-sm text-[var(--muted)]" aria-label="Facebook">
                    {facebookIcon}
                    Facebook
                  </a>
                ) : null}
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
