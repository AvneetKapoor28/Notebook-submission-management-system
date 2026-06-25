export default function Loading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Skeleton PageHeader */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-3xl flex flex-col gap-2.5 w-full">
          {/* Breadcrumbs skeleton */}
          <div className="flex items-center gap-2 select-none mb-1">
            <div className="h-3 w-16 bg-muted rounded-sm animate-pulse" />
            <div className="h-3 w-3 bg-muted rounded-full animate-pulse" />
            <div className="h-3 w-20 bg-muted rounded-sm animate-pulse" />
          </div>

          {/* Emoji skeleton */}
          <div className="size-10 bg-muted rounded-lg animate-pulse mb-1.5" />

          {/* Title skeleton */}
          <div className="h-8 w-64 max-w-full bg-muted rounded-md animate-pulse mb-1" />

          {/* Description skeleton */}
          <div className="h-4 w-96 max-w-full bg-muted rounded-md animate-pulse" />
        </div>
      </div>

      {/* Grid of Metric Cards skeleton (mocking KPI cards) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 rounded-xl border border-border bg-card/60 p-5 flex flex-col justify-between shadow-xs">
            <div className="flex items-center justify-between">
              <div className="h-3.5 w-24 bg-muted rounded-sm animate-pulse" />
              <div className="size-5 bg-muted rounded-full animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="h-6 w-12 bg-muted rounded-md animate-pulse" />
              <div className="h-3 w-32 bg-muted rounded-sm animate-pulse" />
            </div>
          </div>
        ))}
      </div>

      {/* Table/List content skeleton */}
      <div className="rounded-xl border border-border bg-card/60 p-5 space-y-4 shadow-xs">
        {/* Table header/filter skeleton */}
        <div className="flex items-center justify-between pb-2 border-b border-border/40">
          <div className="h-4.5 w-36 bg-muted rounded-sm animate-pulse" />
          <div className="h-8 w-24 bg-muted rounded-md animate-pulse" />
        </div>

        {/* Table rows skeleton */}
        <div className="space-y-3.5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between py-2.5 border-b border-border/20 last:border-0">
              <div className="flex items-center gap-3 w-full sm:w-1/3">
                <div className="size-7 bg-muted rounded-full animate-pulse shrink-0" />
                <div className="space-y-1.5 w-full">
                  <div className="h-3.5 w-3/4 bg-muted rounded-sm animate-pulse" />
                  <div className="h-2.5 w-1/2 bg-muted rounded-sm animate-pulse" />
                </div>
              </div>
              <div className="h-3 w-20 bg-muted rounded-sm animate-pulse hidden sm:block" />
              <div className="h-3 w-24 bg-muted rounded-sm animate-pulse hidden md:block" />
              <div className="h-6 w-16 bg-muted rounded-md animate-pulse shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
