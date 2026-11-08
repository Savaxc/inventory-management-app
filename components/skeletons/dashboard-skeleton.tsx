export function DashboardSkeleton() {
  return (
    <div className="flex min-h-screen animate-pulse bg-gray-50">
      {/* Desktop sidebar skeleton */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-gray-100 bg-white p-6 lg:flex">
        <div className="mb-10 flex items-center space-x-2">
          <div className="h-9 w-9 rounded-lg bg-gray-200" />
          <div className="h-5 w-24 rounded-md bg-gray-200" />
        </div>
        <div className="flex-1 space-y-4">
          <div className="mb-4 ml-3 h-3 w-16 rounded bg-gray-100" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3 px-4 py-1">
              <div className="h-5 w-5 rounded bg-gray-100" />
              <div className="h-4 w-24 rounded-md bg-gray-100" />
            </div>
          ))}
        </div>
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
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="mb-2 h-8 w-48 max-w-full rounded-lg bg-gray-200" />
          <div className="h-4 w-80 max-w-full rounded-md bg-gray-100" />
        </div>

        <div className="mb-6 grid grid-cols-1 gap-6 lg:mb-8 lg:grid-cols-2 lg:gap-8">
          {/* Key Metrics Skeleton */}
          <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
            <div className="mb-5 h-6 w-32 rounded bg-gray-200 sm:mb-6" />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 sm:gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex flex-col items-center space-y-3">
                  <div className="h-8 w-16 rounded-md bg-gray-100 sm:h-10" />
                  <div className="h-4 w-20 rounded bg-gray-50" />
                  <div className="h-5 w-24 rounded-full bg-purple-50" />
                </div>
              ))}
            </div>
          </div>

          {/* Chart Skeleton */}
          <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
            <div className="mb-5 h-6 w-48 rounded bg-gray-200 sm:mb-6" />
            <div className="flex h-44 w-full items-end justify-between gap-2 rounded-lg bg-gray-50 p-4 sm:h-48">
              {[40, 70, 45, 90, 65, 30, 80, 55, 90, 40, 60, 75].map(
                (height, i) => (
                  <div
                    key={i}
                    className="w-full rounded-t bg-gray-200"
                    style={{ height: `${height}%` }}
                  />
                ),
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
          {/* Stock Levels Skeleton */}
          <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
            <div className="mb-5 h-6 w-40 rounded bg-gray-200 sm:mb-6" />
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-3 rounded-lg bg-gray-50 p-3"
                >
                  <div className="flex min-w-0 items-center space-x-3">
                    <div className="h-3 w-3 shrink-0 rounded-full bg-gray-200" />
                    <div className="h-4 w-32 max-w-full rounded bg-gray-200" />
                  </div>
                  <div className="h-4 w-16 shrink-0 rounded bg-gray-200" />
                </div>
              ))}
            </div>
          </div>

          {/* Efficiency Skeleton */}
          <div className="flex flex-col items-center rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
            <div className="mb-5 h-6 w-32 self-start rounded bg-gray-200 sm:mb-6" />

            {/* Circle Skeleton */}
            <div className="relative flex h-40 w-40 items-center justify-center rounded-full border-[8px] border-gray-100 sm:h-48 sm:w-48">
              <div className="space-y-2 text-center">
                <div className="mx-auto h-8 w-16 rounded bg-gray-200" />
                <div className="mx-auto h-3 w-12 rounded bg-gray-100" />
              </div>
            </div>

            {/* Colors Footer Skeleton */}
            <div className="mt-6 w-full space-y-4 sm:mt-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="h-3 w-3 rounded-full bg-gray-200" />
                    <div className="h-4 w-20 rounded bg-gray-100" />
                  </div>
                  <div className="h-4 w-8 rounded bg-gray-200" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
