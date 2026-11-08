export function AddProductSkeleton() {
  return (
    <div className="flex min-h-screen animate-pulse bg-[#f8f9fa]">
      {/* Desktop sidebar skeleton */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-gray-100 bg-white p-6 lg:flex">
        <div className="mb-10 flex items-center space-x-2">
          <div className="h-9 w-9 rounded-lg bg-gray-200" />
          <div className="h-5 w-24 rounded-md bg-gray-200" />
        </div>
        <div className="flex-1 space-y-4">
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

      {/* Main Content Skeleton */}
      <main className="min-w-0 flex-1 px-4 pt-24 pb-28 sm:px-6 sm:pt-24 sm:pb-28 lg:ml-64 lg:px-10 lg:pt-10 lg:pb-10">
        <div className="mx-auto mb-6 max-w-3xl sm:mb-8">
          <div className="mb-4 h-4 w-32 rounded bg-gray-200" />

          <div className="mb-2 h-9 w-64 max-w-full rounded-lg bg-gray-200" />
          <div className="h-4 w-80 max-w-full rounded-md bg-gray-100" />
        </div>

        <div className="mx-auto max-w-3xl space-y-5 sm:space-y-6">
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-50 bg-gray-50/50 px-5 py-4 sm:px-6">
              <div className="h-4 w-40 rounded bg-gray-200" />
            </div>
            <div className="space-y-6 p-5 sm:p-8">
              {/* Product Name Input */}
              <div>
                <div className="mb-2 h-4 w-28 rounded bg-gray-100" />
                <div className="h-12 w-full rounded-xl border border-gray-100 bg-gray-50" />
              </div>
              {/* Grid Inputs */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <div className="mb-2 h-4 w-28 rounded bg-gray-100" />
                  <div className="h-12 w-full rounded-xl border border-gray-100 bg-gray-50" />
                </div>
                <div>
                  <div className="mb-2 h-4 w-28 rounded bg-gray-100" />
                  <div className="h-12 w-full rounded-xl border border-gray-100 bg-gray-50" />
                </div>
              </div>
            </div>
          </div>

          {/* Inventory Settings */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-50 bg-gray-50/50 px-5 py-4 sm:px-6">
              <div className="h-4 w-40 rounded bg-gray-200" />
            </div>
            <div className="grid grid-cols-1 gap-6 p-5 sm:p-8 md:grid-cols-2">
              <div>
                <div className="mb-2 h-4 w-28 rounded bg-gray-100" />
                <div className="h-12 w-full rounded-xl border border-gray-100 bg-gray-50" />
              </div>
              <div>
                <div className="mb-2 h-4 w-36 rounded bg-gray-100" />
                <div className="h-12 w-full rounded-xl border border-gray-100 bg-gray-50" />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:items-center sm:justify-end sm:gap-4">
            <div className="h-12 w-full rounded-xl bg-gray-200 sm:w-28" />
            <div className="h-12 w-full rounded-xl bg-purple-200 sm:w-40" />
          </div>
        </div>
      </main>
    </div>
  );
}
