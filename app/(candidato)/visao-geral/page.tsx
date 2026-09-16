import { PageShell } from "@/components/ui/page"
import { LayoutGrid, Sparkles } from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "Visão Geral | Selecta",
  description: "Visão geral do painel do candidato",
}

export default function VisaoGeralPage() {
  return (
    <PageShell className="max-w-[1200px]">
      <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200/80 bg-white p-12 text-center shadow-xs">
        <div className="grid size-16 place-items-center rounded-2xl bg-[#ede9fe] text-[#7c3aed]">
          <LayoutGrid className="size-8" />
        </div>
        <h2 className="mt-6 text-2xl font-bold tracking-tight text-slate-900">
          Visão Geral
        </h2>
        <p className="mt-2 max-w-md text-sm text-slate-500">
          Em breve você terá acesso a um resumo completo de métricas, recomendações de vagas e status de processos seletivos.
        </p>
        <Link
          href="/vagas"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#7c3aed] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#6d28d9] hover:scale-105"
        >
          <Sparkles className="size-4" />
          Explorar Vagas Disponíveis
        </Link>
      </div>
    </PageShell>
  )
}
