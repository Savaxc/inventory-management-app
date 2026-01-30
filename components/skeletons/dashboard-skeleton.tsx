export function DashboardSkeleton() {
  return (
    <div className="flex min-h-screen bg-gray-50 animate-pulse">
      {/* Sidebar Skeleton */}
      <div className="w-64 bg-white border-r border-gray-100 p-6 flex flex-col hidden md:flex fixed h-full">
        <div className="flex items-center space-x-2 mb-10">
          <div className="w-9 h-9 bg-gray-200 rounded-lg" />
          <div className="h-5 w-24 bg-gray-200 rounded-md" />
        </div>
        <div className="space-y-4 flex-1">
          <div className="h-3 w-16 bg-gray-100 rounded ml-3 mb-4" />
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3 px-4 py-1">
              <div className="w-5 h-5 bg-gray-100 rounded" />
              <div className="h-4 w-24 bg-gray-100 rounded-md" />
            </div>
          ))}
        </div>
        <div className="pt-6 border-t border-gray-50 flex items-center space-x-3 pl-2">
          <div className="w-9 h-9 bg-gray-200 rounded-full" />
          <div className="h-4 w-20 bg-gray-200 rounded-md" />
        </div>
      </div>

      {/* Main Content Skeleton */}
      <main className="flex-1 ml-64 p-10 space-y-8">
        {/* Header */}
        <div className="mb-8">
          <div className="h-8 w-48 bg-gray-200 rounded-lg mb-2" />
          <div className="h-4 w-80 bg-gray-100 rounded-md" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Key Metrics Skeleton */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="h-6 w-32 bg-gray-200 rounded mb-8" />
            <div className="grid grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex flex-col items-center space-y-3">
                  <div className="h-10 w-16 bg-gray-100 rounded-md" />
                  <div className="h-4 w-20 bg-gray-50 rounded" />
                  <div className="h-5 w-24 bg-purple-50 rounded-full" />
                </div>
              ))}
            </div>
          </div>

          {/* Chart Skeleton */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="h-6 w-48 bg-gray-200 rounded mb-6" />
            <div className="h-48 w-full bg-gray-50 rounded-lg flex items-end justify-between p-4 gap-2">
              {[40, 70, 45, 90, 65, 30, 80, 55, 90, 40, 60, 75].map(
                (height, i) => (
                  <div
                    key={i}
                    className="bg-gray-200 rounded-t w-full"
                    style={{ height: `${height}%` }}
                  />
                ),
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Stock Levels Skeleton */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="h-6 w-40 bg-gray-200 rounded mb-6" />
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full bg-gray-200" />
                    <div className="h-4 w-32 bg-gray-200 rounded" />
                  </div>
                  <div className="h-4 w-16 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          </div>

          {/* Efficiency Skeleton */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 flex flex-col items-center">
            <div className="h-6 w-32 bg-gray-200 rounded self-start mb-6" />

            {/* Circle Skeleton */}
            <div className="relative w-48 h-48 rounded-full border-[8px] border-gray-100 flex items-center justify-center">
              <div className="text-center space-y-2">
                <div className="h-8 w-16 bg-gray-200 rounded mx-auto" />
                <div className="h-3 w-12 bg-gray-100 rounded mx-auto" />
              </div>
            </div>

            {/* Colors Footer Skeleton */}
            <div className="w-full mt-8 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-gray-200" />
                    <div className="h-4 w-20 bg-gray-100 rounded" />
                  </div>
                  <div className="h-4 w-8 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
