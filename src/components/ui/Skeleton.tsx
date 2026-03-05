function Pulse({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-surface-200 dark:bg-surface-700/50 rounded-xl ${className || ''}`}
    />
  );
}

export function StoreCardSkeleton() {
  return (
    <div className="card p-4 space-y-3">
      <Pulse className="w-12 h-12 rounded-xl" />
      <Pulse className="h-4 w-3/4" />
      <Pulse className="h-3 w-1/2" />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-6">
        <Pulse className="h-7 w-36" />
        <Pulse className="h-10 w-28 rounded-xl" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <StoreCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function ListCardSkeleton() {
  return (
    <div className="card p-4 flex items-center gap-3">
      <Pulse className="w-2 h-8 rounded-full" />
      <div className="flex-1 space-y-2">
        <Pulse className="h-4 w-3/4" />
        <Pulse className="h-3 w-1/2" />
      </div>
    </div>
  );
}

export function StorePageSkeleton() {
  return (
    <div className="page-container">
      <div className="flex items-center gap-4 mb-6">
        <Pulse className="w-14 h-14 rounded-xl" />
        <div className="space-y-2 flex-1">
          <Pulse className="h-6 w-40" />
          <Pulse className="h-4 w-24" />
        </div>
      </div>
      <Pulse className="h-12 w-full rounded-xl mb-6" />
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <ListCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function ItemRowSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl">
      <Pulse className="w-6 h-6 rounded-lg" />
      <Pulse className="h-4 flex-1" />
      <Pulse className="h-3 w-12" />
    </div>
  );
}

export function ShoppingListSkeleton() {
  return (
    <div className="page-container">
      <div className="mb-6 space-y-2">
        <Pulse className="h-7 w-48" />
        <Pulse className="h-2 w-full rounded-full" />
      </div>
      <div className="card p-4 mb-6 space-y-3">
        <Pulse className="h-12 w-full rounded-xl" />
        <div className="flex gap-2">
          <Pulse className="h-12 w-20 rounded-xl" />
          <Pulse className="h-12 w-24 rounded-xl" />
          <Pulse className="h-12 flex-1 rounded-xl" />
        </div>
      </div>
      <div className="space-y-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <ItemRowSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function HistorySkeleton() {
  return (
    <div className="page-container">
      <Pulse className="h-7 w-44 mb-6" />
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card p-4 flex items-center gap-3">
            <Pulse className="w-8 h-8 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Pulse className="h-4 w-3/4" />
              <Pulse className="h-3 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
