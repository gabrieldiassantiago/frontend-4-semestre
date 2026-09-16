import { PageShell } from "@/components/ui/page"
import { Settings, Sparkles } from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "Configurações | Selecta",
  description: "Configurações da sua conta",
}

export default function ConfiguracoesPage() {
  return (
    <PageShell className="max-w-[1200px]">
      <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200/80 bg-white p-12 text-center shadow-xs">
        <div className="grid size-16 place-items-center rounded-2xl bg-[#ede9fe] text-[#7c3aed]">
          <Settings className="size-8" />
        </div>
        <h2 className="mt-6 text-2xl font-bold tracking-tight text-slate-900">
          Configurações da Conta
        </h2>
        <p className="mt-2 max-w-md text-sm text-slate-500">
          Gerenciamento de preferências de e-mail, privacidade, segurança e dados de acesso.
        </p>
        <Link
          href="/profile/candidato"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#7c3aed] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#6d28d9]"
        >
          <Sparkles className="size-4" />
          Ver Meu Perfil
        </Link>
      </div>
    </PageShell>
  )
}
