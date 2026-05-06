"use client";

import Link from "next/link";
import { useLanguage } from "@/app/contexts/LanguageContext";

export function Footer() {
  const { t, lang } = useLanguage();

  return (
    <footer className="border-t border-[var(--border)] bg-[var(--card-bg)] px-4 sm:px-8 lg:px-16 py-10 flex flex-col sm:flex-row items-center justify-between gap-6 flex-wrap">
      <span className="font-serif italic text-lg text-[var(--muted)]" style={{ fontFamily: "var(--font-playfair)" }}>
        {t.meta.siteName}
      </span>
      <div className="flex gap-8">
        <Link href={`/${lang}/terms`} className="text-xs text-[var(--muted)] tracking-wide hover:text-[var(--dark)] transition-colors">
          {t.footer.contract}
        </Link>
      </div>
      <span className="text-xs text-[var(--muted)] font-light tracking-wide">
        © {new Date().getFullYear()} {t.meta.siteName}
      </span>
      <span className="text-xs text-[var(--muted)] font-light tracking-wide sm:ml-auto">
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
    </footer>
  );
}
