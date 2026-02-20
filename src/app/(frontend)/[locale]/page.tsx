import { Hero } from "@/app/components/Hero";
import { QuickLinks } from "@/app/components/QuickLinks";
import { Title } from "@/app/components/Title";
import { ValueProps } from "@/app/components/ValueProps";
import { Contact } from "@/app/components/Contact";
import { Team } from "@/app/components/Team";
import { Footer } from "@/app/components/Footer";
import { getCategoriesForLocale } from "@/app/lib/categoriesForLocale";
import { isValidLocale } from "@/app/lib/localization/i18n";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const lang = isValidLocale(locale) ? locale : "ee";
  const categories = await getCategoriesForLocale(lang);

  return (
    <main>
      <Title />
      <QuickLinks locale={locale} categories={categories} />
      <ValueProps />
      <Contact />
      <Team />
    </main>
  );
}
