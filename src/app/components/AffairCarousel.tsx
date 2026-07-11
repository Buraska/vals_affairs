"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Affair } from "@/payload-types";
import type { Locale } from "../lib/localization/i18n";
import { AffairCard } from "./AffairCard";
import SectionImageReveal from "./SectionImageReveal";

export function AffairCarousel({
  affairs,
  locale,
}: {
  affairs: Affair[];
  locale: Locale;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const updateArrows = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollPrev(scrollLeft > 4);
    setCanScrollNext(scrollLeft + clientWidth < scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateArrows();
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, [updateArrows]);

  const scrollByDir = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const firstChild = el.firstElementChild as HTMLElement | null;
    const gap = parseFloat(getComputedStyle(el).columnGap || "0") || 0;
    const step = firstChild ? firstChild.offsetWidth + gap : el.clientWidth;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  if (affairs.length === 0) return null;

  const showArrows = canScrollPrev || canScrollNext;

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <SectionImageReveal count={affairs.length}>
        {affairs.map((affair) => (
          <div
            key={affair.id}
            className="w-full shrink-0 snap-start sm:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-2.5rem)/3)]"
          >
            <AffairCard affair={affair} locale={locale} showCategory className="h-full rounded-lg border border-[var(--border)] shadow-sm" />
          </div>
        ))}
        </SectionImageReveal>

      </div>

      {showArrows && (
        <>
          <button
            type="button"
            aria-label="Previous"
            onClick={() => scrollByDir(-1)}
            disabled={!canScrollPrev}
            className="absolute -left-3 top-1/2 z-20 hidden h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--dark)] text-[var(--cream)] shadow-xl ring-1 ring-black/10 transition hover:scale-105 hover:bg-[var(--rust)] disabled:cursor-not-allowed disabled:opacity-30 lg:-left-6 sm:flex"
          >
            <svg width="24" height="24" viewBox="0 0 14 14" fill="none">
              <path d="M12 7H2M6 3L2 7L6 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Next"
            onClick={() => scrollByDir(1)}
            disabled={!canScrollNext}
            className="absolute -right-3 top-1/2 z-20 hidden h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--dark)] text-[var(--cream)] shadow-xl ring-1 ring-black/10 transition hover:scale-105 hover:bg-[var(--rust)] disabled:cursor-not-allowed disabled:opacity-30 lg:-right-6 sm:flex"
          >
            <svg width="24" height="24" viewBox="0 0 14 14" fill="none">
              <path d="M2 7H12M8 3L12 7L8 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </>
      )}
    </div>
  );
}
