import { QuickLinks } from "@/app/components/QuickLinks";
import { Title } from "@/app/components/Title";
import { Team } from "@/app/components/Team";
import { getCategoriesForLocale } from "@/app/lib/categoriesForLocale";
import { getTranslations } from "@/app/lib/localization/translations";
import type { Lang } from "@/app/lib/localization/translations";
import { isValidLocale } from "@/app/lib/localization/i18n";
import { locales, type Locale } from "@/app/lib/localization/i18n";
import { getPayload } from "payload";
import configPromise from "@payload-config";
import type { GalleryInfo } from "@/payload-types";


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
  const t = getTranslations(lang as Lang);
  const [categories, teamGlobal, galleryInfo] = await Promise.all([
    getCategoriesForLocale(lang),
    getPayload({ config: configPromise }).then((payload) =>
      payload.findGlobal({ slug: "team", depth: 1 })
    ),
    getPayload({ config: configPromise }).then((payload) =>
      payload.findGlobal({ slug: "gallery-info", depth: 1, locale: lang, fallbackLocale: "ee" })
    ) as Promise<GalleryInfo>,
  ]);
  const teamMembers = teamGlobal?.members ?? [];

  return (
    <main>
      <Title />
      <QuickLinks
        locale={locale}
        categories={categories}
        galleryInfo={galleryInfo}
        eventsTitle={t.category.eventsTitle}
        noCategoriesTitle={t.category.noCategoriesTitle}
        noCategoriesTryOther={t.category.noCategoriesTryOther}
      />
      <Team members={teamMembers} locale={lang} />
    </main>
  );
}
