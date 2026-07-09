import { OrderContentSkeleton } from '@/app/components/OrderContentSkeleton'

export default function OrderLoading() {
  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8 lg:px-16">
        <div className="mb-6 h-4 w-28 animate-pulse rounded bg-[var(--border)]" aria-hidden />
        <div className="mb-8 h-8 w-64 animate-pulse rounded bg-[var(--border)]" aria-hidden />
        <OrderContentSkeleton />
      </div>
    </main>
  )
}
