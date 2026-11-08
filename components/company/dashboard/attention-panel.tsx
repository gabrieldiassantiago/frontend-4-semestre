import Link from "next/link"
import { ChevronRight, CircleCheck, Inbox, PauseCircle, Sparkles, type LucideIcon } from "lucide-react"
import { ROUTES } from "@/lib/config/routes"
import type { Candidatura } from "@/lib/types/candidatura.types"
import type { Vaga } from "@/lib/types/vaga.types"
import { cn } from "@/lib/utils"
import { isAwaitingReview } from "./metrics"

type Task = { id: string; icon: LucideIcon; tone: string; title: string; description: string; href: string }

export function AttentionPanel({ vagas, candidaturas }: { vagas: Vaga[]; candidaturas: Candidatura[] }) {
  const awaiting = candidaturas.filter(isAwaitingReview).length
  const withApplicants = new Set(candidaturas.map((item) => item.vagaId))
  const emptyJobs = vagas.filter((vaga) => vaga.ativa && !withApplicants.has(vaga.id))
  const paused = vagas.filter((vaga) => !vaga.ativa).length

  const tasks: Task[] = []
  if (awaiting > 0) {
    tasks.push({
      id: "awaiting",
      icon: Inbox,
      tone: "bg-primary-subtle text-primary",
      title: `${awaiting} ${awaiting === 1 ? "candidatura aguarda" : "candidaturas aguardam"} triagem`,
      description: "Abrir fila de triagem.",
      href: ROUTES.company.processes,
    })
  }
  if (emptyJobs.length > 0) {
    tasks.push({
      id: "empty",
      icon: Sparkles,
      tone: "bg-warning-subtle text-warning-foreground",
      title: `${emptyJobs.length} ${emptyJobs.length === 1 ? "vaga ainda sem" : "vagas ainda sem"} candidatos`,
      description:
        emptyJobs.length === 1 ? `Compartilhe "${emptyJobs[0].titulo}" para atrair interessados.` : "Compartilhe as vagas para atrair interessados.",
      href: ROUTES.company.jobs,
    })
  }
  if (paused > 0) {
    tasks.push({
      id: "paused",
      icon: PauseCircle,
      tone: "bg-muted text-strong-foreground",
      title: `${paused} ${paused === 1 ? "vaga pausada" : "vagas pausadas"}`,
      description: "Reative quando quiser voltar a receber candidaturas.",
      href: ROUTES.company.jobs,
    })
  }

  return (
    <section aria-labelledby="attention-title" className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between gap-3 px-6 pb-4 pt-6">
        <h2 id="attention-title" className="text-base font-semibold tracking-tight text-foreground">
          Pendências de recrutamento
        </h2>
        {tasks.length > 0 && (
          <span className="grid h-6 min-w-6 place-items-center rounded-full bg-primary px-2 text-xs font-semibold text-primary-foreground">
            {tasks.length}
          </span>
        )}
      </div>

      {tasks.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 py-10 text-center">
          <span className="grid size-10 place-items-center rounded-full bg-success-subtle text-success-foreground">
            <CircleCheck aria-hidden className="size-5" />
          </span>
          <p className="text-sm font-semibold text-foreground">Tudo em dia</p>
          <p className="text-xs leading-relaxed text-muted-foreground">Nenhuma pendência nos seus processos agora.</p>
        </div>
      ) : (
        <ul className="divide-y divide-border-subtle">
          {tasks.map((task) => (
            <li key={task.id}>
              <Link href={task.href} className="group flex items-start gap-3.5 px-6 py-5 transition-colors hover:bg-surface">
                <span className={cn("grid size-9 shrink-0 place-items-center rounded-xl", task.tone)}>
                  <task.icon aria-hidden className="size-[18px]" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-foreground">{task.title}</span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">{task.description}</span>
                </span>
                <ChevronRight
                  aria-hidden
                  className="mt-2 size-4 shrink-0 text-subtle-foreground transition-transform group-hover:translate-x-0.5"
                />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
