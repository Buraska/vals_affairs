"use client";

import { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/app/contexts/LanguageContext";

export function Footer() {
  const { t } = useLanguage();
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
            <h3 className="font-semibold text-stone-900">{t.footer.more}</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link href="#" className="hover:text-amber-700">{t.footer.schoolProjects}</Link></li>
              <li><Link href="#" className="hover:text-amber-700">Mys Resto</Link></li>
              <li><Link href="#" className="hover:text-amber-700">{t.footer.giftCards}</Link></li>
              <li><Link href="#" className="hover:text-amber-700">{t.footer.charity}</Link></li>
              <li><Link href="#" className="hover:text-amber-700">{t.footer.merch}</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-stone-900">{t.footer.documents}</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link href="#" className="hover:text-amber-700">{t.footer.contract}</Link></li>
              <li><Link href="#" className="hover:text-amber-700">{t.footer.privacy}</Link></li>
              <li><Link href="#" className="hover:text-amber-700">{t.footer.reportError}</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-stone-900">{t.footer.aboutUs}</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link href="#" className="hover:text-amber-700">{t.footer.philosophy}</Link></li>
              <li><Link href="#" className="hover:text-amber-700">{t.footer.contacts}</Link></li>
              <li><Link href="#" className="hover:text-amber-700">{t.footer.reviews}</Link></li>
              <li><Link href="#" className="hover:text-amber-700">{t.footer.partners}</Link></li>
              <li><Link href="#" className="hover:text-amber-700">{t.footer.press}</Link></li>
              <li><Link href="#" className="hover:text-amber-700">{t.footer.account}</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-stone-900">{t.footer.tours}</h3>
            <p className="mt-2 text-sm text-stone-600">{t.footer.subscribeCta}</p>
            <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-2 sm:flex-row">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E-mail"
                required
                className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <button
                type="submit"
                className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-700"
              >
                {t.footer.subscribe}
              </button>
            </form>
            {submitted && (
              <p className="mt-2 text-sm text-green-700">{t.footer.subscribeSuccess}</p>
            )}
          </div>
        </div>
        <div className="mt-12 border-t border-stone-200 pt-8 text-center text-sm text-stone-500">
          © {new Date().getFullYear()} Vals
        </div>
      </div>
    </footer>
  );
}
