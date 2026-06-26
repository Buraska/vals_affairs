"use client";

import { useState, type FormEvent } from "react";
import { useLanguage } from "@/app/contexts/LanguageContext";

type Status = "idle" | "sending" | "success" | "error";

export function Newsletter() {
  const { t } = useLanguage();
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const name = String(fd.get("name") ?? "").trim();
    const email = String(fd.get("email") ?? "").trim();

    if (!name || !email) {
      setStatus("error");
      return;
    }

    setStatus("sending");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      if (!res.ok) {
        setStatus("error");
        return;
      }
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  return (
    <section
      className="relative overflow-hidden px-4 py-16 sm:px-8 sm:py-20 lg:px-16"
      style={{ background: "var(--dark)" }}
    >
      <div className="relative z-10 mx-auto max-w-2xl text-center">
        <h2
          className="text-3xl font-bold text-[var(--cream)] sm:text-4xl"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          {t.newsletter.title}
        </h2>

        {status === "success" ? (
          <p className="mt-8 text-base font-medium text-[var(--sage)]" role="status">
            {t.newsletter.success}
          </p>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mx-auto mt-8 flex w-full max-w-xl flex-col gap-3 sm:flex-row"
          >
            <input
              type="text"
              name="name"
              required
              disabled={status === "sending"}
              placeholder={t.newsletter.namePlaceholder}
              aria-label={t.newsletter.namePlaceholder}
              className="min-w-0 flex-1 rounded-full border border-[var(--cream)]/20 bg-[var(--cream)]/10 px-5 py-3 text-[var(--cream)] placeholder:text-[var(--cream)]/50 focus:border-[var(--warm)] focus:outline-none disabled:opacity-60"
            />
            <input
              type="email"
              name="email"
              required
              disabled={status === "sending"}
              placeholder={t.newsletter.emailPlaceholder}
              aria-label={t.newsletter.emailPlaceholder}
              className="min-w-0 flex-1 rounded-full border border-[var(--cream)]/20 bg-[var(--cream)]/10 px-5 py-3 text-[var(--cream)] placeholder:text-[var(--cream)]/50 focus:border-[var(--warm)] focus:outline-none disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={status === "sending"}
              className="shrink-0 rounded-full border border-[var(--cream)]/50 bg-[var(--cream)]/10 px-7 py-3 text-sm font-semibold text-[var(--cream)] backdrop-blur-sm transition hover:bg-[var(--cream)]/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status === "sending" ? t.newsletter.sending : t.newsletter.button}
            </button>
          </form>
        )}

        {status === "error" && (
          <p className="mt-4 text-sm font-medium text-[var(--rust)]" role="alert">
            {t.newsletter.error}
          </p>
        )}
      </div>
    </section>
  );
}
