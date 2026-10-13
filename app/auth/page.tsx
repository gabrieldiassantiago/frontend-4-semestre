import { ROUTES } from "@/lib/config/routes"
import type { Metadata } from "next"
import Link from "next/link"
import { ArrowUpRight, Info, Sparkles } from "lucide-react"
import { SelectaLogo } from "@/components/ui/selecta-logo"
import { RoleCard } from "@/components/auth/role-card"

export const metadata: Metadata = {
  title: "Escolha seu perfil | Selecta",
  description: "Acesse a Selecta como candidato ou empresa.",
}

export default function AuthPage() {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-surface text-foreground selection:bg-primary/15 selection:text-primary">
      {/* Efeitos sutis de iluminação de fundo */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] bg-gradient-to-b from-primary/[0.06] via-primary/[0.02] to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-24 -z-10 h-72 w-[600px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl"
      />

      {/* Header com Glassmorphism */}
      <header className="sticky top-0 z-20 border-b border-border/60 bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex h-20 w-full max-w-[1200px] items-center justify-between px-6 sm:px-10">
          <Link
            href="/"
            aria-label="Página inicial da Selecta"
            className="transition-opacity hover:opacity-85"
          >
            <SelectaLogo className="h-8" />
          </Link>

          <Link
            href={ROUTES.candidate.jobs}
            className="group inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/60 px-4 py-2 text-xs font-semibold text-muted-foreground shadow-2xs transition-all hover:border-border hover:bg-muted/60 hover:text-foreground sm:text-sm"
          >
            <span>Explorar vagas</span>
            <ArrowUpRight
              className="size-4 text-muted-foreground transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
              aria-hidden
            />
          </Link>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="mx-auto flex w-full max-w-[920px] flex-1 flex-col items-center justify-center px-6 py-12 sm:px-10 sm:py-20">
        {/* Cabeçalho Centralizado */}
        <div className="flex flex-col items-center text-center">

          <h1 className="mt-4 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-[42px] md:leading-[1.15]">
            Como você deseja usar a Selecta?
          </h1>

          <p className="mt-3 max-w-lg text-balance text-sm leading-relaxed text-muted-foreground sm:text-base">
            Escolha o seu perfil abaixo para entrar na sua conta existente ou
            criar um novo cadastro gratuitamente.
          </p>
        </div>

        {/* Grid de Cards de Perfil */}
        <ul
          className="mt-10 grid w-full gap-5 sm:grid-cols-2 lg:gap-6"
          aria-label="Perfis de acesso"
        >
          <RoleCard
            href="/auth/candidato"
            title="Sou candidato"
            description="Encontre oportunidades alinhadas ao seu perfil, mantenha seu currículo atualizado e acompanhe suas candidaturas em tempo real."
            cta="Acessar como candidato"
            tone="candidate"
          />
          <RoleCard
            href="/auth/recrutador"
            title="Sou empresa"
            description="Publique vagas rapidamente, avalie talentos qualificados e gerencie todos os processos seletivos da sua empresa."
            cta="Acessar como empresa"
            tone="company"
          />
        </ul>

        {/* Callout informativo inferior */}
        <div className="mt-8 inline-flex items-center gap-2.5 rounded-full border border-border/70 bg-card/70 px-4 py-2 text-xs text-muted-foreground shadow-2xs backdrop-blur-xs sm:text-sm">
          <Info className="size-4 shrink-0 text-primary" aria-hidden />
          <span>
            Já possui cadastro? Basta selecionar o mesmo perfil que você escolheu
            ao criar sua conta.
          </span>
        </div>
      </main>

      {/* Footer Estruturado */}
      <footer className="border-t border-border/50 bg-card/40">
        <div className="mx-auto flex w-full max-w-[1200px] flex-col items-center justify-between gap-3 px-6 py-5 text-xs text-muted-foreground sm:flex-row sm:px-10">
          <p className="font-medium">
            Selecta · Plataforma de recrutamento e seleção
          </p>
          <p className="text-muted-foreground/70">
            © {new Date().getFullYear()} Selecta. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}