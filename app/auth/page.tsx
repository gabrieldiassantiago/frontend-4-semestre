import type { Metadata } from "next"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { SelectaLogo } from "@/components/ui/selecta-logo"
import { RoleCard } from "@/components/auth/role-card"

export const metadata: Metadata = {
  title: "Escolha seu perfil",
  description: "Acesse a Selecta como candidato ou empresa.",
}

export default function AuthPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-surface text-foreground">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-20 w-full max-w-[1200px] items-center justify-between px-6 sm:px-10">
          <Link href="/" aria-label="Página inicial da Selecta"><SelectaLogo className="h-8" /></Link>
          <Link href="/vagas" className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">Explorar vagas<ArrowUpRight className="size-4" aria-hidden /></Link>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-[880px] flex-1 flex-col justify-center px-6 py-14 sm:px-10 sm:py-20">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Acesso à plataforma</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Selecione seu perfil</h1>
        <p className="mt-4 max-w-lg text-base leading-7 text-muted-foreground">Escolha como deseja acessar a Selecta para entrar ou criar uma conta.</p>
        <ul className="mt-9 grid gap-5 sm:grid-cols-2" aria-label="Perfis de acesso">
          <RoleCard href="/auth/candidato" title="Sou candidato" description="Encontre oportunidades, mantenha seu currículo atualizado e acompanhe suas candidaturas." cta="Acessar como candidato" tone="candidate" />
          <RoleCard href="/auth/recrutador" title="Sou empresa" description="Publique vagas, consulte candidatos e gerencie os processos seletivos da sua empresa." cta="Acessar como empresa" tone="company" />
        </ul>
        <p className="mt-7 text-sm text-muted-foreground">Já tem uma conta? Use o mesmo perfil escolhido no cadastro.</p>
      </main>
      <footer className="mx-auto w-full max-w-[1200px] px-6 py-6 text-xs text-muted-foreground sm:px-10">Selecta · Plataforma de recrutamento e seleção</footer>
    </div>
  )
}
