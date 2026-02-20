"use client";

import { useLanguage } from "@/app/contexts/LanguageContext";

type ContactEntry = {
  titleKey: "nonProfit" | "forBusiness";
  org: string;
  reg: string;
  tax?: string;
  email: string;
  phone: string;
  address: string;
  iban: string;
};

const contacts: ContactEntry[] = [
  {
    titleKey: "nonProfit",
    org: "MTÜ OleLukoe",
    reg: "reg nr. 80322752",
    email: "info@olelukoe.ee",
    phone: "6210602",
    address: "Tuukri 1B-30, 10151 Tallinn",
    iban: "EE032200221051775396 Swedbank",
  },
  {
    titleKey: "forBusiness",
    org: "OleLukoe Fantazija OÜ",
    reg: "reg nr.12492675",
    tax: "KMKR EE101683782",
    email: "info@olelukoe.ee",
    phone: "6210602",
    address: "Tuukri 1B-30, 10151 Tallinn",
    iban: "EE752200221057686832 Swedbank",
  },
];

export function Contact() {
  const { t } = useLanguage();

  return (
    <section id="about" className="border-t border-amber-100 bg-stone-50 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-2xl font-bold text-stone-800 sm:text-3xl">
          {t.contact.title}
        </h2>
        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          {contacts.map((c) => (
            <div
              key={c.org}
              className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8"
            >
              <p className="text-sm font-medium text-stone-500">{t.contact[c.titleKey]}</p>
              <h3 className="mt-2 text-lg font-bold text-amber-900">{c.org}</h3>
              <p className="text-sm text-stone-600">{c.reg}</p>
              {c.tax && (
                <p className="text-sm text-stone-600">{c.tax}</p>
              )}
              <ul className="mt-4 space-y-2 text-sm text-stone-700">
                <li>
                  <strong>e-mail:</strong>{" "}
                  <a href={`mailto:${c.email}`} className="text-amber-700 hover:underline">
                    {c.email}
                  </a>
                </li>
                <li>
                  <strong>{t.contact.phone}:</strong>{" "}
                  <a href={`tel:+372${c.phone.replace(/\s/g, "")}`} className="text-amber-700 hover:underline">
                    +372 {c.phone}
                  </a>
                </li>
                <li>
                  <strong>{t.contact.addressLabel}:</strong> {c.address}
                </li>
                <li className="font-mono text-xs">{c.iban}</li>
                <li>
                  <strong>{t.contact.hours}</strong>
                  <br />
                  {t.contact.hoursValue}
                  <br />
                  {t.contact.weekend}
                </li>
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
