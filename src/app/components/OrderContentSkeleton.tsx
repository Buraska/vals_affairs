const shimmer = 'animate-pulse rounded bg-[var(--border)]'

export function OrderContentSkeleton({ orderLabel }: { orderLabel?: string }) {
  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
      <div className="min-w-0 flex-1 space-y-4" aria-hidden>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i}>
            <div className={`${shimmer} mb-2 h-4 w-32`} />
            <div className={`${shimmer} h-10 w-full max-w-md`} />
          </div>
        ))}
        <div className={`${shimmer} h-12 w-40`} />
      </div>

      <div className="lg:w-[380px] lg:shrink-0">
        <section className="sticky top-24 rounded border border-[var(--border)] bg-[var(--card-bg)] p-6">
          {orderLabel ? (
            <h2
              className="mb-4 text-lg font-semibold text-[var(--dark)]"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              {orderLabel}
            </h2>
          ) : (
            <div className={`${shimmer} mb-4 h-6 w-32`} />
          )}
          <div className="space-y-3" aria-hidden>
            <div className={`${shimmer} h-4 w-3/4`} />
            <div className={`${shimmer} h-4 w-1/2`} />
            <div className="border-t border-[var(--border)] pt-4">
              <div className={`${shimmer} h-4 w-full`} />
            </div>
            <div className={`${shimmer} ml-auto h-5 w-24`} />
          </div>
        </section>
      </div>
    </div>
  )
}
