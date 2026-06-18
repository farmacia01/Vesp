export default function DashboardLoading() {
  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-6">
      {/* Heading */}
      <div className="flex items-end justify-between">
        <div className="space-y-2">
          <div className="skeleton h-7 w-40 rounded-md" />
          <div className="skeleton h-4 w-64 rounded-md" />
        </div>
        <div className="hidden gap-2 sm:flex">
          <div className="skeleton h-9 w-28 rounded-lg" />
          <div className="skeleton h-9 w-32 rounded-lg" />
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="surface rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div className="skeleton h-9 w-9 rounded-lg" />
              <div className="skeleton h-5 w-16 rounded-full" />
            </div>
            <div className="skeleton mt-4 h-4 w-28 rounded-md" />
            <div className="skeleton mt-2 h-7 w-24 rounded-md" />
            <div className="skeleton mt-1.5 h-3.5 w-32 rounded-md" />
          </div>
        ))}
      </div>

      {/* Chart + Donut */}
      <div className="grid gap-4 lg:grid-cols-[1.7fr_1fr]">
        <div className="surface rounded-2xl p-6">
          <div className="mb-5 flex items-center justify-between">
            <div className="space-y-1.5">
              <div className="skeleton h-5 w-32 rounded-md" />
              <div className="skeleton h-3.5 w-48 rounded-md" />
            </div>
            <div className="skeleton h-4 w-16 rounded-md" />
          </div>
          <div className="skeleton h-64 w-full rounded-xl" />
        </div>
        <div className="surface rounded-2xl p-6">
          <div className="mb-5 space-y-1.5">
            <div className="skeleton h-5 w-32 rounded-md" />
            <div className="skeleton h-3.5 w-44 rounded-md" />
          </div>
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="skeleton h-36 w-36 rounded-full" />
            <div className="skeleton h-14 w-full rounded-xl" />
          </div>
          <div className="skeleton mt-3 h-10 w-full rounded-lg" />
        </div>
      </div>

      {/* Activity + Clients */}
      <div className="grid gap-4 lg:grid-cols-[1fr_1.6fr]">
        <div className="surface space-y-3 rounded-2xl p-6">
          <div className="skeleton h-5 w-40 rounded-md" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="skeleton h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-1.5 pt-0.5">
                <div className="skeleton h-3.5 w-3/4 rounded-md" />
                <div className="skeleton h-3 w-1/2 rounded-md" />
              </div>
              <div className="skeleton h-3 w-8 rounded-md" />
            </div>
          ))}
        </div>
        <div className="surface overflow-hidden rounded-2xl">
          <div className="flex items-center justify-between border-b border-border p-5">
            <div className="space-y-1.5">
              <div className="skeleton h-5 w-36 rounded-md" />
              <div className="skeleton h-3.5 w-28 rounded-md" />
            </div>
            <div className="skeleton h-8 w-24 rounded-lg" />
          </div>
          <div className="p-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3">
                <div className="skeleton h-7 w-7 rounded-full" />
                <div className="flex-1 space-y-1">
                  <div className="skeleton h-3.5 w-28 rounded-md" />
                  <div className="skeleton h-3 w-20 rounded-md" />
                </div>
                <div className="skeleton h-3.5 w-16 rounded-md" />
                <div className="skeleton h-2 w-20 rounded-full" />
                <div className="skeleton h-5 w-12 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
