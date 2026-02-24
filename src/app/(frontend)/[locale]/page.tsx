import { QuickLinks } from "@/app/components/QuickLinks";
import { Title } from "@/app/components/Title";
import { Team } from "@/app/components/Team";
import { getCategoriesForLocale } from "@/app/lib/categoriesForLocale";
import { getTranslations } from "@/app/lib/localization/translations";
import type { Lang } from "@/app/lib/localization/translations";
import { isValidLocale } from "@/app/lib/localization/i18n";
import type { Locale } from "@/app/lib/localization/i18n";
import { getPayload } from "payload";
import configPromise from "@payload-config";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const lang = (isValidLocale(locale) ? locale : "ee") as Locale;
  const t = getTranslations(lang as Lang);
  const [categories, teamResult] = await Promise.all([
    getCategoriesForLocale(lang),
    getPayload({ config: configPromise }).then((payload) =>
      payload.find({
        collection: "team",
        depth: 1,
        limit: 50,
        sort: "createdAt",
      })
    ),
  ]);
  const teamMembers = teamResult.docs ?? [];

  return (
    <main>
      <Title />
      <QuickLinks
        locale={locale}
        categories={categories}
        eventsTitle={t.category.eventsTitle}
        noCategoriesTitle={t.category.noCategoriesTitle}
        noCategoriesTryOther={t.category.noCategoriesTryOther}
      />
      <Team members={teamMembers} locale={lang} />
    </main>
  );
}
