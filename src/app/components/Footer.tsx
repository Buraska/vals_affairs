"use client";

import Link from "next/link";
import { useLanguage } from "@/app/contexts/LanguageContext";
import type { WebInfoData } from "@/app/components/Header";

const BRAND = "Waltz & Vals Voyage Capital";

const facebookIcon = (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const instagramIcon = (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153.509.509.908 1.07 1.153 1.772.247.637.415 1.363.465 2.428.048 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 0 1-1.153 1.772 4.915 4.915 0 0 1-1.772 1.153c-.637.247-1.363.415-2.428.465C15.056 21.987 14.717 22 12 22c-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 0 1-1.772-1.153 4.904 4.904 0 0 1-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 0 1 1.153-1.772A4.897 4.897 0 0 1 5.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm6.5-.25a1.25 1.25 0 1 0-2.5 0 1.25 1.25 0 0 0 2.5 0zM12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6z" />
  </svg>
);

export function Footer({ webInfo }: { webInfo?: WebInfoData | null }) {
  const { t, lang } = useLanguage();

  const linkClass =
    "text-sm text-[var(--muted)] tracking-wide hover:text-[var(--dark)] transition-colors";

  return (
    <footer className="border-t border-[var(--border)] bg-[var(--card-bg)] px-4 sm:px-8 lg:px-16 py-12">
      <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-10 text-left sm:flex-row sm:gap-16">
          <nav className="flex flex-col gap-3">
            <Link href={`/${lang}/about`} className={linkClass}>
              {t.footer.aboutUs}
            </Link>
            <Link href={`/${lang}/terms`} className={linkClass}>
              {t.footer.contract}
            </Link>
          </nav>

          {(webInfo?.phone || webInfo?.email || webInfo?.facebookUrl || webInfo?.instagramUrl) && (
            <div className="flex flex-col gap-3">
              <span className="text-xs font-medium uppercase tracking-widest text-[var(--muted)]">
                {t.contact.title}
              </span>
              {webInfo?.phone && (
                <Link href={`tel:${webInfo.phone.replace(/\s/g, "")}`} className={linkClass}>
                  {webInfo.phone}
                </Link>
              )}
              {webInfo?.email && (
                <Link href={`mailto:${webInfo.email}`} className={linkClass}>
                  {webInfo.email}
                </Link>
              )}

              {(webInfo?.facebookUrl || webInfo?.instagramUrl) && (
                <div className="mt-1 flex items-center gap-4">
                  {webInfo?.facebookUrl && (
                    <Link
                      href={webInfo.facebookUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Facebook"
                      className="text-[var(--muted)] hover:text-[var(--rust)] transition-colors"
                    >
                      {facebookIcon}
                    </Link>
                  )}
                  {webInfo?.instagramUrl && (
                    <Link
                      href={webInfo.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Instagram"
                      className="text-[var(--muted)] hover:text-[var(--rust)] transition-colors"
                    >
                      {instagramIcon}
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 sm:items-end sm:text-right">
          <span className="text-xs text-[var(--muted)] font-light tracking-wide">
            © {new Date().getFullYear()} {BRAND}
          </span>
          <span className="text-xs text-[var(--muted)] font-light tracking-wide">
            {t.footer.websiteDevelopment}{" "}
            <Link
              href="https://www.linkedin.com/in/vadim-buraska/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--rust)] hover:underline"
            >
              Vadim Zolotarenko
            </Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
