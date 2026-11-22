import { ROUTES } from "@/lib/config/routes"
import React, { useMemo } from "react"
import Link from "next/link"
import { ArrowUpRight, BellRing, UserRound } from "lucide-react"
import { CompanyLogo } from "@/components/shared/company-logo"
import type { Vaga } from "@/lib/types/vaga.types"

interface JobsSidebarWidgetsProps {
  onOpenAlertsModal: () => void
  onSelectCompany: (companyName: string) => void
  vagas?: Vaga[]
}

export function JobsSidebarWidgets({
  onOpenAlertsModal,
  onSelectCompany,
  vagas = [],
}: JobsSidebarWidgetsProps) {
  const featuredCompanies = useMemo(() => {
    const map = new Map<string, number>()
    for (const v of vagas) {
      const name = v.nomeEmpresa?.trim()
      if (name) {
        map.set(name, (map.get(name) ?? 0) + 1)
      }
    }
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({
        name,
        count: `${count} ${count === 1 ? "vaga" : "vagas"}`,
      }))
  }, [vagas])
  return (
    <aside className="w-full shrink-0 space-y-4 lg:w-[320px]">
      {/* Widget 1: Receba vagas no seu e-mail */}
      <div className="rounded-[28px] bg-primary-subtle p-5">
        <span className="grid size-10 place-items-center rounded-full bg-card text-primary">
          <BellRing aria-hidden strokeWidth={1.75} className="size-[18px]" />
        </span>

        <h3 className="mt-4 text-base font-semibold tracking-tight text-foreground">
          Receba vagas no seu e-mail
        </h3>
        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
          Seja o primeiro a saber sobre novas oportunidades que combinam com você.
        </p>

        <button
          type="button"
          onClick={onOpenAlertsModal}
          className="group mt-4 flex min-h-12 w-full items-center justify-between gap-2 rounded-2xl bg-card py-1.5 pl-4 pr-1.5 text-xs font-semibold text-primary active:scale-[0.98]"
        >
          Ativar alertas
          <span className="grid size-9 place-items-center rounded-xl bg-primary-subtle text-primary transition-colors group-hover:bg-primary group-hover:text-white">
            <ArrowUpRight aria-hidden className="size-4" />
          </span>
        </button>
      </div>

      {/* Widget 2: Empresas com vagas abertas */}
      {featuredCompanies.length > 0 && (
        <div className="rounded-[28px] border border-border/60 bg-card p-2">
          <div className="flex items-center justify-between px-3 pb-2 pt-3">
            <h3 className="text-sm font-semibold tracking-tight text-foreground">Empresas com vagas</h3>
            <button
              type="button"
              onClick={() => onSelectCompany("")}
              className="text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Ver todas
            </button>
          </div>

          <div className="flex flex-col gap-1.5">
            {featuredCompanies.map((company) => (
              <button
                key={company.name}
                type="button"
                onClick={() => onSelectCompany(company.name)}
                className="flex w-full items-center gap-3 rounded-[20px] bg-surface p-2.5 text-left transition-colors hover:bg-muted active:scale-[0.99]"
              >
                <CompanyLogo name={company.name} size="sm" />
                <span className="min-w-0 flex-1 truncate text-xs font-semibold text-foreground">
                  {company.name}
                </span>
                <span className="mr-1 shrink-0 text-[11px] tabular-nums text-muted-foreground">{company.count}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Widget 3: Dicas para você */}
      <div className="rounded-[28px] border border-border/60 bg-card p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold tracking-tight text-foreground">Dica para você</h3>
          <Link
            href={ROUTES.candidate.profile}
            aria-label="Ir para o perfil"
            className="grid size-9 place-items-center rounded-full border border-border text-strong-foreground transition-colors hover:border-primary hover:bg-primary hover:text-white"
          >
            <ArrowUpRight aria-hidden strokeWidth={1.75} className="size-4" />
          </Link>
        </div>

        <div className="mt-4 flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-full border border-border text-strong-foreground">
            <UserRound aria-hidden strokeWidth={1.75} className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground">Complete seu perfil</p>
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
              Perfis completos recebem 3x mais visualizações.
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}
