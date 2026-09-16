import React from "react"
import Link from "next/link"
import { ArrowRight, ChevronRight, ShoppingBag, Sparkles } from "lucide-react"
import { CompanyBrandLogo } from "./company-brand-logo"

interface JobsSidebarWidgetsProps {
  onOpenAlertsModal: () => void
  onSelectCompany: (companyName: string) => void
}

const FEATURED_COMPANIES = [
  { name: "Google", count: "312 vagas", variant: "google" as const },
  { name: "Itaú", count: "128 vagas", variant: "itau" as const },
  { name: "Accenture", count: "97 vagas", variant: "accenture" as const },
  { name: "Netflix", count: "56 vagas", variant: "netflix" as const },
  { name: "UNISAL", count: "42 vagas", variant: "unisal-purple" as const },
]

export function JobsSidebarWidgets({
  onOpenAlertsModal,
  onSelectCompany,
}: JobsSidebarWidgetsProps) {
  return (
    <aside className="w-full space-y-5 lg:w-[320px] shrink-0">
      {/* Widget 1: Receba vagas no seu e-mail */}
      <div className="relative overflow-hidden rounded-3xl border border-purple-100/90 bg-gradient-to-b from-[#f3eeff] via-[#f7f4ff] to-[#faf8ff] p-6 shadow-xs">
        <div className="flex size-10 items-center justify-center rounded-2xl bg-white/90 text-[#7c3aed] shadow-xs">
          <Sparkles className="size-5" />
        </div>

        <h3 className="mt-4 text-base font-bold text-slate-900">
          Receba vagas no seu e-mail
        </h3>
        <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
          Seja o primeiro a saber sobre novas oportunidades que combinam com você.
        </p>

        <button
          type="button"
          onClick={onOpenAlertsModal}
          className="group mt-4 flex w-full items-center justify-between rounded-xl bg-white/70 px-4 py-2.5 text-xs font-bold text-[#7c3aed] transition-all hover:bg-white hover:shadow-xs active:scale-[0.98]"
        >
          <span className="flex items-center gap-1.5">
            Ativar alertas
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
          <ChevronRight className="size-4 text-purple-300 group-hover:text-[#7c3aed]" />
        </button>
      </div>

      {/* Widget 2: Empresas em destaque */}
      <div className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900">Empresas em destaque</h3>

        <div className="mt-3.5 space-y-2">
          {FEATURED_COMPANIES.map((company) => (
            <button
              key={company.name}
              type="button"
              onClick={() => onSelectCompany(company.name)}
              className="flex w-full items-center gap-3 rounded-2xl p-2 text-left transition-colors hover:bg-slate-50 active:scale-[0.99]"
            >
              <CompanyBrandLogo
                company={company.name}
                variant={company.variant}
                className="size-9 rounded-xl text-sm"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-slate-800">
                  {company.name}
                </p>
                <p className="text-[11px] text-slate-400">{company.count}</p>
              </div>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => onSelectCompany("")}
          className="mt-3 flex items-center gap-1.5 text-xs font-bold text-[#7c3aed] transition-colors hover:text-[#6d28d9]"
        >
          Ver todas as empresas
          <ArrowRight className="size-3" />
        </button>
      </div>

      {/* Widget 3: Dicas para você */}
      <div className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900">Dicas para você</h3>

        <div className="mt-3 flex items-start gap-3">
          <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#ede9fe] text-[#7c3aed]">
            <ShoppingBag className="size-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-900">Complete seu perfil</p>
            <p className="mt-0.5 text-[11px] leading-tight text-slate-500">
              Perfis completos recebem 3x mais visualizações.
            </p>
          </div>
        </div>

        <Link
          href="/profile/candidato"
          className="mt-3.5 flex items-center gap-1.5 text-xs font-bold text-[#7c3aed] transition-colors hover:text-[#6d28d9]"
        >
          Ir para o perfil
          <ArrowRight className="size-3" />
        </Link>
      </div>
    </aside>
  )
}
