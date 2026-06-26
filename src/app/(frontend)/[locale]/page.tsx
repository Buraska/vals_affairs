import { Title } from "@/app/components/Title";
import { Newsletter } from "@/app/components/Newsletter";
import { getCategoriesForLocale } from "@/app/lib/categoriesForLocale";
import { isValidLocale } from "@/app/lib/localization/i18n";
import { locales, type Locale } from "@/app/lib/localization/i18n";
import { getPayload } from "payload";
import configPromise from "@payload-config";
import type { Affair, Media } from "@/payload-types";
import CategoryPreview from "@/app/components/CategoryPreview";
import { pickMediaSize } from "@/utilities/pickMediaSize";


export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const lang = (isValidLocale(locale) ? locale : "ee") as Locale;
  const categories = await getCategoriesForLocale(lang);

  const payload = await getPayload({ config: configPromise });
  const categoryIds = categories.map((c) => c.id);
  const affairs =
    categoryIds.length > 0
      ? (
          await payload.find({
            collection: "Affair",
            depth: 1,
            overrideAccess: false,
            locale: lang,
            where: { category: { in: categoryIds } },
            limit: 500,
          })
        ).docs
      : [];

  const nowIso = new Date().toISOString();
  const upcoming = (
    await payload.find({
      collection: "Affair",
      depth: 1,
      overrideAccess: false,
      locale: lang,
      where: { "start date": { greater_than_equal: nowIso } },
      sort: "start date",
      limit: 6,
    })
  ).docs;

  const heroImages = upcoming
    .map((a) => a.images?.[0]?.image)
    .filter((img): img is Media => img != null && typeof img !== "string")
    .map((img) => pickMediaSize(img, "medium").url || img.url || "")
    .filter(Boolean)
    .slice(0, 6);

  const affairsByCategory = new Map<string, Affair[]>();
  for (const affair of affairs) {
    const catId =
      typeof affair.category === "object" && affair.category != null
        ? affair.category.id
        : affair.category;
    if (catId == null) continue;
    const key = String(catId);
    const list = affairsByCategory.get(key) ?? [];
    list.push(affair);
    affairsByCategory.set(key, list);
  }

  return (
    <main>
      <Title heroImages={heroImages} />
      <div id="events" className="scroll-mt-20 divide-y divide-[var(--border)]">
        {categories.map((category) => (
          <CategoryPreview
            key={category.id}
            locale={lang}
            categoryId={String(category.id)}
            title={category.title}
            affairs={affairsByCategory.get(String(category.id)) ?? []}
          />
        ))}
      </div>
      <Newsletter />
    </main>
  );
}
