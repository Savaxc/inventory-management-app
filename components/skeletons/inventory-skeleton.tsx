export function InventorySkeleton() {
  return (
    <div className="flex min-h-screen bg-gray-50 animate-pulse">
      {/* Sidebar Skeleton */}
      <div className="w-64 bg-white border-r border-gray-100 p-6 flex flex-col hidden md:flex">
        {/* Logo area */}
        <div className="flex items-center space-x-2 mb-10">
          <div className="w-9 h-9 bg-gray-200 rounded-lg" />
          <div className="h-5 w-24 bg-gray-200 rounded-md" />
        </div>

        {/* Navigation items */}
        <div className="space-y-4 flex-1">
          <div className="h-3 w-16 bg-gray-100 rounded ml-3 mb-4" />
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3 px-4 py-1">
              <div className="w-5 h-5 bg-gray-100 rounded" />
              <div className="h-4 w-24 bg-gray-100 rounded-md" />
            </div>
          ))}
        </div>

        {/* User profile area */}
        <div className="pt-6 border-t border-gray-50 flex items-center space-x-3 pl-2">
          <div className="w-9 h-9 bg-gray-200 rounded-full" />
          <div className="h-4 w-20 bg-gray-200 rounded-md" />
        </div>
      </div>

      {/* Main Content Skeleton */}
      <main className="flex-1 p-10 space-y-8">
        {/* Header Skeleton */}
        <div className="space-y-2">
          <div className="h-8 w-48 bg-gray-200 rounded-lg" />
          <div className="h-4 w-64 bg-gray-100 rounded-md" />
        </div>

        {/* Search Bar Skeleton */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="h-12 w-full bg-gray-50 rounded-xl" />
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-4 rounded-xl border border-gray-200 h-24 shadow-sm" />
          ))}
        </div>

        {/* Table Skeleton */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-gray-50/50 h-12 border-b border-gray-100" />
          <div className="divide-y divide-gray-100">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded shadow-sm" />
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-gray-100 rounded" />
                    <div className="h-3 w-20 bg-gray-50 rounded" />
                  </div>
                </div>
                <div className="h-4 w-16 bg-gray-50 rounded hidden md:block" />
                <div className="h-4 w-24 bg-gray-100 rounded" />
                <div className="h-8 w-20 bg-gray-50 rounded-md" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}