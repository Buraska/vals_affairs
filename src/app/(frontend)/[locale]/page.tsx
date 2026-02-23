import { QuickLinks } from "@/app/components/QuickLinks";
import { Title } from "@/app/components/Title";
import { ValueProps } from "@/app/components/ValueProps";
import { Contact } from "@/app/components/Contact";
import { Team } from "@/app/components/Team";
import { getCategoriesForLocale } from "@/app/lib/categoriesForLocale";
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
      <QuickLinks locale={locale} categories={categories} />
      <Team members={teamMembers} locale={lang} />
    </main>
  );
}
