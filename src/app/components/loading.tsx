export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--cream)]">
      <div className="flex flex-col items-center gap-6">
        <div
          className="h-10 w-10 rounded-full border-2 border-[var(--border)] border-t-[var(--rust)] animate-spin"
          aria-hidden
        />
        <span className="text-sm font-medium text-[var(--muted)]">
          Loading…
        </span>
      </div>
    </div>
  );
}
