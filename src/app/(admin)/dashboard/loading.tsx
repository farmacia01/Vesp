export default function DashboardLoading() {
  return (
    <div className="mx-auto w-full max-w-[1440px] space-y-6 pb-10">

      {/* Greeting */}
      <div className="space-y-1.5">
        <div className="skeleton h-3.5 w-48 rounded-md" />
        <div className="skeleton h-7 w-64 rounded-lg" />
        <div className="skeleton h-4 w-72 rounded-md" />
      </div>

      {/* 6 Metric Cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-white/[0.06] bg-card p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="skeleton h-8 w-8 rounded-lg" />
              <div className="skeleton h-5 w-14 rounded-full" />
            </div>
            <div className="mt-3 space-y-1.5">
              <div className="skeleton h-6 w-20 rounded-md" />
              <div className="skeleton h-3.5 w-28 rounded-md" />
            </div>
            <div className="skeleton mt-3 h-9 w-full rounded-lg" />
          </div>
        ))}
      </div>

      {/* Chart + Agenda */}
      <div className="grid gap-4 lg:grid-cols-[2.2fr_1fr]">
        <div className="rounded-2xl border border-white/[0.06] bg-card p-5">
          <div className="mb-5 flex items-center justify-between">
            <div className="space-y-1.5">
              <div className="skeleton h-5 w-48 rounded-md" />
              <div className="skeleton h-3.5 w-36 rounded-md" />
            </div>
            <div className="skeleton h-4 w-16 rounded-md" />
          </div>
          <div className="skeleton h-[220px] w-full rounded-xl" />
        </div>
        <div className="rounded-2xl border border-white/[0.06] bg-card p-5 space-y-3">
          <div className="skeleton h-5 w-36 rounded-md" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="skeleton h-3.5 w-3.5 rounded-sm" />
              <div className="flex-1 space-y-1">
                <div className="skeleton h-3.5 w-3/4 rounded-md" />
                <div className="skeleton h-3 w-1/2 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3 columns */}
      <div className="grid gap-4 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, col) => (
          <div key={col} className="rounded-2xl border border-white/[0.06] bg-card p-5 space-y-3">
            <div className="skeleton h-5 w-36 rounded-md" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="skeleton h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <div className="skeleton h-3.5 w-3/4 rounded-md" />
                  <div className="skeleton h-3 w-1/2 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Production */}
      <div className="space-y-3">
        <div className="skeleton h-5 w-44 rounded-md" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-white/[0.06] bg-card p-4 space-y-3">
              <div className="skeleton h-8 w-8 rounded-lg" />
              <div className="skeleton h-4 w-16 rounded-md" />
              <div className="skeleton h-1 w-full rounded-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Status overview */}
      <div className="space-y-3">
        <div className="skeleton h-5 w-40 rounded-md" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-white/[0.06] bg-card p-5 flex flex-col items-center gap-3">
              <div className="skeleton h-[88px] w-[88px] rounded-full" />
              <div className="skeleton h-3.5 w-28 rounded-md" />
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
