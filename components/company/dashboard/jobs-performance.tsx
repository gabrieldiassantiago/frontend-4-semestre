import Link from "next/link"
import { BriefcaseBusiness, Plus } from "lucide-react"
import { SectionLink } from "@/components/ui/page"
import { EmptyState } from "@/components/ui/states"
import { ROUTES } from "@/lib/config/routes"
import type { Candidatura } from "@/lib/types/candidatura.types"
import { MODALIDADE_LABELS, type Vaga } from "@/lib/types/vaga.types"
import { cn } from "@/lib/utils"

const LIMIT = 5

export function JobsPerformance({ vagas, candidaturas }: { vagas: Vaga[]; candidaturas: Candidatura[] }) {
  const rows = vagas
    .map((vaga) => {
      const items = candidaturas.filter((item) => item.vagaId === vaga.id)
      return {
        vaga,
        total: items.length,
        active: items.filter((item) => item.status === "EM_ANDAMENTO").length,
        approved: items.filter((item) => item.status === "APROVADA").length,
        rejected: items.filter((item) => item.status === "REPROVADA" || item.status === "CANCELADA").length,
      }
    })
    .sort((a, b) => Number(b.vaga.ativa) - Number(a.vaga.ativa) || b.total - a.total)
    .slice(0, LIMIT)

  return (
    <section aria-labelledby="jobs-performance-title" className="min-w-0 overflow-hidden rounded-3xl border border-border/80 bg-card shadow-[0_2px_8px_-4px_rgba(32,29,29,0.08)]">
      <div className="flex items-center justify-between gap-3 px-6 pb-4 pt-6">
        <div>
          <h2 id="jobs-performance-title" className="text-base font-semibold tracking-tight text-foreground">
            Desempenho por vaga
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">Candidaturas e andamento de cada oportunidade.</p>
        </div>
        {vagas.length > 0 && <SectionLink href={ROUTES.company.jobs}>Ver todas</SectionLink>}
      </div>

      {rows.length === 0 ? (
        <div className="p-5">
          <EmptyState
            icon={BriefcaseBusiness}
            title="Nenhuma vaga publicada"
            description="Crie sua primeira oportunidade para começar a receber candidaturas."
            action={
              <Link href={ROUTES.company.newJob} className="btn-primary">
                <Plus aria-hidden className="size-4" />
                Criar primeira vaga
              </Link>
            }
          />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <caption className="sr-only">Desempenho das vagas publicadas</caption>
            <thead>
              <tr className="text-xs text-muted-foreground">
                <th scope="col" className="px-5 py-3 font-medium">Vaga</th>
                <th scope="col" className="px-3 py-3 text-right font-medium">Candidatos</th>
                <th scope="col" className="w-[34%] px-5 py-3 font-medium">Andamento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {rows.map(({ vaga, total, active, approved, rejected }) => (
                <tr key={vaga.id} className="group transition-colors hover:bg-muted/60">
                  <td className="px-5 py-3.5">
                    <Link
                      href={`${ROUTES.company.processes}?vaga=${encodeURIComponent(vaga.id)}`}
                      className="flex items-center gap-3 outline-none"
                    >
                      <span
                        aria-hidden
                        className={cn("size-2 shrink-0 rounded-full", vaga.ativa ? "bg-success" : "bg-border-strong")}
                      />
                      <span className="min-w-0">
                        <span className="block truncate font-semibold text-foreground group-hover:text-primary">{vaga.titulo}</span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {MODALIDADE_LABELS[vaga.modalidade]} · {vaga.cidade}
                          {vaga.ativa ? "" : " · Pausada"}
                        </span>
                      </span>
                    </Link>
                  </td>
                  <td className="px-3 py-3.5 text-right text-base font-semibold tabular-nums text-foreground">{total}</td>
                  <td className="px-5 py-3.5">
                    {total ? (
                      <>
                        <div className="flex h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden>
                          <span className="bg-primary" style={{ width: `${(active / total) * 100}%` }} />
                          <span className="bg-success" style={{ width: `${(approved / total) * 100}%` }} />
                          <span className="bg-danger/70" style={{ width: `${(rejected / total) * 100}%` }} />
                        </div>
                        <p className="mt-1.5 text-xs text-muted-foreground">
                          <span className="tabular-nums">{active}</span> em andamento · <span className="tabular-nums">{approved}</span>{" "}
                          {approved === 1 ? "aprovado" : "aprovados"}
                        </p>
                      </>
                    ) : (
                      <p className="text-xs text-subtle-foreground">Sem candidaturas ainda</p>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
