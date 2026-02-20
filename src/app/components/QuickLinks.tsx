import { Media } from './Media'
import type { Category } from '@/payload-types'

export function QuickLinks({
  locale,
  categories,
}: {
  locale: string
  categories: Category[]
}) {

  return (
    <section className="border-amber-100 bg-white py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((item) => (
            <a
              key={item.id}
              href={`/${locale}/category/${item.id}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-amber-100 bg-amber-50/30 transition hover:border-amber-200 hover:bg-amber-50 hover:shadow-md"
            >
              {item.image ? (
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-amber-100">
                  <Media resource={item.image} size="30vw" />
                </div>
              ) : (
                <div className="flex aspect-[4/3] w-full items-center justify-center bg-amber-100 text-4xl" role="img" aria-hidden>
                  →
                </div>
              )}
              <div className="flex flex-col gap-1 p-5 text-center">
                <h3 className="font-semibold text-amber-900 group-hover:text-amber-800">
                  {item.title}
                </h3>
                <p className="text-sm text-stone-600">{item.description ?? ''}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
