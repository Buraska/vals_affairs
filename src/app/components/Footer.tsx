"use client";

import { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/app/contexts/LanguageContext";

export function Footer() {
  const { t, lang } = useLanguage();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  return (
    <footer className="border-t border-stone-200 bg-stone-100 text-stone-700">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-4">
          <div>
            <h3 className="font-semibold text-stone-900">{t.footer.documents}</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href={`/${lang}/terms`} className="hover:text-amber-700">
                  {t.footer.contract}
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-stone-200 pt-8 text-center text-sm text-stone-500">
          © {new Date().getFullYear()} Vals
        </div>
      </div>
    </footer>
  );
}
