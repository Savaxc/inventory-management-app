export function InventoryTableSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-24 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
          />
        ))}
      </div>

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="h-10 w-full max-w-md rounded-xl bg-gray-100" />
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <div className="h-10 w-full rounded-xl bg-gray-100 sm:w-28" />
          <div className="h-10 w-full rounded-xl bg-gray-100 sm:w-32" />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="hidden h-12 border-b border-gray-100 bg-gray-50/50 xl:block" />
        <div className="divide-y divide-gray-100">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-3 px-4 py-4 sm:px-6"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="h-8 w-8 shrink-0 rounded bg-gray-100 shadow-sm" />
                <div className="min-w-0 space-y-2">
                  <div className="h-4 w-32 max-w-full rounded bg-gray-100" />
                  <div className="h-3 w-20 max-w-full rounded bg-gray-50" />
                </div>
              </div>
              <div className="hidden h-4 w-16 rounded bg-gray-50 md:block" />
              <div className="hidden h-4 w-24 rounded bg-gray-100 lg:block" />
              <div className="h-8 w-20 shrink-0 rounded-md bg-gray-50" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function InventorySkeleton() {
  return (
    <div className="flex min-h-screen animate-pulse bg-gray-50">
      {/* Desktop sidebar skeleton */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-gray-100 bg-white p-6 lg:flex">
        {/* Logo area */}
        <div className="mb-10 flex items-center space-x-2">
          <div className="h-9 w-9 rounded-lg bg-gray-200" />
          <div className="h-5 w-24 rounded-md bg-gray-200" />
        </div>

        {/* Navigation items */}
        <div className="flex-1 space-y-4">
          <div className="mb-4 ml-3 h-3 w-16 rounded bg-gray-100" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3 px-4 py-1">
              <div className="h-5 w-5 rounded bg-gray-100" />
              <div className="h-4 w-24 rounded-md bg-gray-100" />
            </div>
          ))}
        </div>

        {/* User profile area */}
        <div className="flex items-center space-x-3 border-t border-gray-50 pl-2 pt-6">
          <div className="h-9 w-9 rounded-full bg-gray-200" />
          <div className="h-4 w-20 rounded-md bg-gray-200" />
        </div>
      </aside>

      {/* Mobile top bar skeleton */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b border-gray-100 bg-white px-4 lg:hidden">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gray-200" />
          <div className="h-5 w-24 rounded bg-gray-200" />
        </div>
        <div className="h-9 w-9 rounded-full bg-gray-200" />
      </header>

      {/* Mobile bottom nav skeleton */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex h-16 items-center justify-around border-t border-gray-100 bg-white lg:hidden">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <div className="h-5 w-5 rounded bg-gray-200" />
            <div className="h-2 w-8 rounded bg-gray-100" />
          </div>
        ))}
      </nav>

      {/* Main content skeleton */}
      <main className="min-w-0 flex-1 px-4 pt-24 pb-28 sm:px-6 sm:pt-24 sm:pb-28 lg:ml-64 lg:px-10 lg:pt-10 lg:pb-10">
        {/* Header Skeleton */}
        <div className="mb-6 space-y-2 sm:mb-8">
          <div className="h-8 w-48 max-w-full rounded-lg bg-gray-200" />
          <div className="h-4 w-64 max-w-full rounded-md bg-gray-100" />
        </div>

        {/* Search Bar Skeleton */}
        <div className="mb-5 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="h-12 w-full rounded-xl bg-gray-50" />
        </div>

        {/* Stats Skeleton */}
        <div className="mb-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-24 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
            />
          ))}
        </div>

        {/* Table / cards skeleton */}
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="h-10 w-full max-w-md rounded-xl bg-gray-100" />
          <div className="grid grid-cols-2 gap-2 sm:flex">
            <div className="h-10 w-full rounded-xl bg-gray-100 sm:w-28" />
            <div className="h-10 w-full rounded-xl bg-gray-100 sm:w-32" />
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="hidden h-12 border-b border-gray-100 bg-gray-50/50 xl:block" />
          <div className="divide-y divide-gray-100">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-3 px-4 py-4 sm:px-6"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="h-8 w-8 shrink-0 rounded bg-gray-100 shadow-sm" />
                  <div className="min-w-0 space-y-2">
                    <div className="h-4 w-32 max-w-full rounded bg-gray-100" />
                    <div className="h-3 w-20 max-w-full rounded bg-gray-50" />
                  </div>
                </div>
                <div className="hidden h-4 w-16 rounded bg-gray-50 md:block" />
                <div className="hidden h-4 w-24 rounded bg-gray-100 lg:block" />
                <div className="h-8 w-20 shrink-0 rounded-md bg-gray-50" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
