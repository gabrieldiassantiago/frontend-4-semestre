import { PageShell } from "@/components/ui/page"
import { Skeleton } from "@/components/ui/states"

export default function Loading() {
  return (
    <PageShell className="max-w-[1080px]" aria-busy="true">
      <span className="sr-only">Carregando agendamentos</span>
      <Skeleton className="h-4 w-36" />
      <Skeleton className="mt-3 h-9 w-72" />
      <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="mt-6 h-28 rounded-2xl" />
      <div className="mt-6 grid gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-36 rounded-2xl" />
        ))}
      </div>
    </PageShell>
  )
}
