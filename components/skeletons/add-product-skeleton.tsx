export function AddProductSkeleton() {
  return (
    <div className="flex min-h-screen bg-[#f8f9fa] animate-pulse">
      {/* Sidebar Skeleton */}
      <div className="w-64 bg-white border-r border-gray-100 p-6 flex flex-col hidden md:flex fixed h-full">
        <div className="flex items-center space-x-2 mb-10">
          <div className="w-9 h-9 bg-gray-200 rounded-lg" />
          <div className="h-5 w-24 bg-gray-200 rounded-md" />
        </div>
        <div className="space-y-4 flex-1">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3 px-4 py-1">
              <div className="w-5 h-5 bg-gray-100 rounded" />
              <div className="h-4 w-24 bg-gray-100 rounded-md" />
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Skeleton */}
      <main className="flex-1 ml-64 p-10">
        <div className="max-w-3xl mx-auto mb-8">

          <div className="h-4 w-32 bg-gray-200 rounded mb-4" />

          <div className="h-9 w-64 bg-gray-200 rounded-lg mb-2" />
          <div className="h-4 w-80 bg-gray-100 rounded-md" />
        </div>

        <div className="max-w-3xl mx-auto space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50">
              <div className="h-4 w-40 bg-gray-200 rounded" />
            </div>
            <div className="p-8 space-y-6">
              {/* Product Name Input */}
              <div>
                <div className="h-4 w-28 bg-gray-100 rounded mb-2" />
                <div className="h-12 w-full bg-gray-50 rounded-xl border border-gray-100" />
              </div>
              {/* Grid Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="h-4 w-28 bg-gray-100 rounded mb-2" />
                  <div className="h-12 w-full bg-gray-50 rounded-xl border border-gray-100" />
                </div>
                <div>
                  <div className="h-4 w-28 bg-gray-100 rounded mb-2" />
                  <div className="h-12 w-full bg-gray-50 rounded-xl border border-gray-100" />
                </div>
              </div>
            </div>
          </div>

          {/* Inventory Settings */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50">
              <div className="h-4 w-40 bg-gray-200 rounded" />
            </div>
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="h-4 w-28 bg-gray-100 rounded mb-2" />
                <div className="h-12 w-full bg-gray-50 rounded-xl border border-gray-100" />
              </div>
              <div>
                <div className="h-4 w-36 bg-gray-100 rounded mb-2" />
                <div className="h-12 w-full bg-gray-50 rounded-xl border border-gray-100" />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-4 pt-4">
            <div className="h-12 w-28 bg-gray-200 rounded-xl" />
            <div className="h-12 w-40 bg-purple-200 rounded-xl" />
          </div>
        </div>
      </main>
    </div>
  );
}