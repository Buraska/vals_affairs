"use client";

import { useLanguage } from "@/app/contexts/LanguageContext";
import SmartImage from "./SmartImage";
import SectionImageReveal from "./SectionImageReveal";

export function Title({ heroImages = [] }: { heroImages?: string[] }) {
  const { t, siteDescription } = useLanguage();
  const hasCollage = heroImages.length >= 3;

  return (
    <section className="relative isolate flex min-h-[42vh] max-h-[52vh] flex-col justify-center overflow-hidden px-4 py-14 sm:px-8 sm:py-16 lg:min-h-[48vh] lg:max-h-[58vh] lg:px-16">
      {hasCollage ? (
        <SectionImageReveal count={heroImages.length}>
          <div className="absolute inset-0 -z-20 flex" aria-hidden>
            {heroImages.map((url, i) => (
              <div
                key={i}
                className={`relative min-w-0 flex-1 h-full ${i >= 3 ? "hidden sm:block" : ""}`}
              >
                <SmartImage
                  src={url}
                  alt={`Hero image ${i}`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  style={{ objectFit: "cover" }}
                />
              </div>
            ))}
          </div>
        </SectionImageReveal>
      ) : (
        <div
          className="absolute inset-0 -z-20 bg-cover bg-center"
          style={{
            background: `
              radial-gradient(ellipse 90% 70% at 50% 80%, rgba(255, 132, 159, 0.25) 0%, rgba(230, 154, 123, 0.12) 40%, transparent 70%),
              radial-gradient(ellipse 70% 50% at 75% 30%, rgba(255, 165, 80, 0.2) 0%, transparent 50%),
              radial-gradient(ellipse 60% 40% at 20% 50%, rgba(255, 255, 255, 0.15) 0%, transparent 45%),
              linear-gradient(180deg,rgb(170, 126, 91) 0%,rgb(200, 155, 115) 50%,rgb(255, 184, 136) 100%)
            `,
          }}
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
