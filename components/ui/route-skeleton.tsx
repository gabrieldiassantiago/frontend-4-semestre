import { PageShell } from "@/components/ui/page"
import { Skeleton, CardSkeleton, StatCardsSkeleton, BarChartSkeleton, VagasListSkeleton, CandidatesListSkeleton, VagaSelectionSkeleton } from "@/components/ui/states"

type Variant = "dashboard" | "jobs" | "opportunities" | "candidates" | "processes" | "profile" | "form" | "applications" | "detail"

/** Usado pelo Suspense de rota e pelas requisições que terminam no cliente. */
export function RouteSkeleton({ variant = "jobs" }: { variant?: Variant }) {
  return (
    <PageShell className="max-w-6xl" role="status" aria-label="Carregando página" aria-busy="true">
      <div aria-hidden="true" className="space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border-subtle pb-8">
          <div className="w-full max-w-md space-y-3">
            <Skeleton className="h-3 w-24" /><Skeleton className="h-8 w-2/3" /><Skeleton className="h-4 w-full" />
          </div>
          <Skeleton className="h-10 w-32 rounded-full" />
        </div>
        {variant === "dashboard" ? <>
          <StatCardsSkeleton />
          <div className="grid gap-5 lg:grid-cols-2"><BarChartSkeleton /><BarChartSkeleton /></div>
          <BarChartSkeleton bars={12} />
          <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]"><VagasListSkeleton rows={4} /><CandidatesListSkeleton /></div>
        </> : ["profile", "form", "detail"].includes(variant) ? (
          <div className="rounded-2xl border border-border bg-card p-5 sm:p-8">
            {variant === "profile" && <Skeleton className="mb-8 size-20 rounded-full" />}
            <div className="grid gap-6 sm:grid-cols-2">
              {Array.from({ length: 6 }, (_, i) => <div className="space-y-3" key={i}><Skeleton className="h-3 w-24" /><Skeleton className="h-12 w-full" /></div>)}
            </div>
            <Skeleton className="mt-8 h-32 w-full" />
          </div>
        ) : <>
          {variant === "applications" && <StatCardsSkeleton count={3} />}
          <Skeleton className="h-12 w-full rounded-full" />
          {variant === "candidates" || variant === "opportunities" ? (
            <div className={`grid gap-5 sm:grid-cols-2 ${variant === "candidates" ? "xl:grid-cols-3" : ""}`}>
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="rounded-2xl border border-border bg-card p-5">
                  <div className="flex items-center gap-3">
                    <Skeleton className="size-11 shrink-0 rounded-xl" />
                    <div className="min-w-0 flex-1 space-y-2"><Skeleton className="h-3 w-2/3" /><Skeleton className="h-4 w-full" /></div>
                  </div>
                  <div className="mt-5 flex gap-2"><Skeleton className="h-6 w-20" /><Skeleton className="h-6 w-24" /></div>
                  <Skeleton className="mt-5 h-4 w-3/4" />
                  <Skeleton className="mt-5 h-10 w-full rounded-full" />
                </div>
              ))}
            </div>
          ) : variant === "processes" ? <VagaSelectionSkeleton rows={4} /> : <CardSkeleton rows={4} />}
        </>}
      </div>
    </PageShell>
  )
}
