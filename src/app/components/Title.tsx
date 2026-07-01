"use client";

import { useLanguage } from "@/app/contexts/LanguageContext";

// Hero image: ballroom/waltz couple in warm golden-orange light. Swap later for a managed asset.
const HERO_IMAGE_URL =
  "https://images.unsplash.com/photo-1775467398304-d1936dedad7f?auto=format&fit=crop&w=2000&q=80";

export function Title({ heroImages = [] }: { heroImages?: string[] }) {
  const { t, siteDescription } = useLanguage();
  const hasCollage = heroImages.length >= 3;

  return (
    <section className="relative isolate flex min-h-[42vh] flex-col justify-center overflow-hidden px-4 py-14 sm:px-8 sm:py-16 lg:min-h-[50vh] lg:px-16">
      {hasCollage ? (
        <div className="absolute inset-0 -z-20 flex" aria-hidden>
          {heroImages.map((url, i) => (
            <div
              key={i}
              className={`min-w-0 flex-1 bg-cover bg-center ${i >= 3 ? "hidden sm:block" : ""}`}
              style={{ backgroundImage: `url("${url}")` }}
            />
          ))}
        </div>
      ) : (
        <div
          className="absolute inset-0 -z-20 bg-cover bg-center"
          style={{ backgroundImage: `url("${HERO_IMAGE_URL}")` }}
          aria-hidden
        />
      )}
      <div
        className="absolute inset-0 -z-10"
        aria-hidden
        style={{
          background:
            "linear-gradient(180deg, rgba(26,26,24,0.55) 0%, rgba(26,26,24,0.35) 45%, rgba(26,26,24,0.85) 100%)",
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-4xl rounded-2xl bg-black/35 px-8 py-10 text-center backdrop-blur-sm sm:px-14 sm:py-12">
        <div className="mx-auto mb-6 flex items-center justify-center gap-3 sm:gap-4">
          <span aria-hidden className="h-px w-10 sm:w-14 bg-[var(--warm)]/70" />
          <p
            className="text-[var(--warm)] text-sm sm:text-base italic tracking-[0.22em] tabular-nums"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            anno&nbsp;2001
          </p>
          <span aria-hidden className="h-px w-10 sm:w-14 bg-[var(--warm)]/70" />
        </div>

        <p
          className="mx-auto max-w-[42ch] text-pretty text-2xl font-medium italic leading-snug text-[var(--cream)] sm:text-3xl lg:text-4xl"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          {siteDescription ?? t.meta.tagline}
        </p>
      </div>
    </section>
  );
}
