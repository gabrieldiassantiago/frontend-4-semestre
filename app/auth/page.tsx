import { ROUTES } from "@/lib/config/routes"
import type { Metadata } from "next"
import Link from "next/link"
import { ArrowUpRight, Info } from "lucide-react"
import { SelectaLogo } from "@/components/ui/selecta-logo"
import { RoleCard } from "@/components/auth/role-card"

export const metadata: Metadata = {
  title: "Escolha seu perfil | Selecta",
  description: "Acesse a Selecta como candidato ou empresa.",
}

export default async function AuthPage({
  searchParams,
}: {
  searchParams: Promise<{ expired?: string }>
}) {
  const { expired } = await searchParams
  const sessionExpired = expired === "1"

  return (
    <div className="flex min-h-dvh flex-col bg-surface text-foreground selection:bg-primary/15 selection:text-primary">

      {/* Header com Glassmorphism */}
      <header className="sticky top-0 z-20 border-b border-border bg-card">
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
            className="group inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
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

          {sessionExpired && (
            <p
              role="status"
              className="mb-2 inline-flex items-center gap-2 rounded-lg border border-warning/30 bg-warning-subtle px-4 py-2 text-sm font-medium text-warning-foreground"
            >
              <Info className="size-4 shrink-0" aria-hidden />
              Sua sessão expirou. Entre novamente para continuar.
            </p>
          )}

          <h1 className="mt-2 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Como você deseja usar a Selecta?
          </h1>

          <p className="mt-3 max-w-lg text-balance text-sm leading-relaxed text-muted-foreground sm:text-base">
            Escolha o seu perfil abaixo para entrar na sua conta existente ou
            criar um novo cadastro gratuitamente.
          </p>
        </div>

        {/* Grid de Cards de Perfil */}
        <ul
          className="mt-10 grid w-full gap-4 sm:grid-cols-2 lg:gap-6"
          aria-label="Perfis de acesso"
        >
          <RoleCard
            href="/auth/candidato"
            index={0}
            eyebrow="Para profissionais"
            title="Sou candidato"
            description="Encontre oportunidades alinhadas ao seu perfil."
            features={[
              "Candidate-se a vagas com um clique",
              "Currículo e perfil sempre atualizados",
              "Acompanhe cada etapa em tempo real",
            ]}
            cta="Continuar como candidato"
            tone="candidate"
          />
          <RoleCard
            href="/auth/recrutador"
            index={1}
            eyebrow="Para empresas"
            title="Sou empresa"
            description="Contrate com mais agilidade e menos burocracia."
            features={[
              "Publique vagas em minutos",
              "Avalie talentos qualificados",
              "Gerencie todo o processo seletivo",
            ]}
            cta="Continuar como empresa"
            tone="company"
          />
        </ul>

        <p className="mt-8 max-w-md text-center text-sm leading-6 text-muted-foreground">
          Já tem cadastro? Selecione o mesmo perfil que você escolheu ao criar sua conta.
        </p>
      </main>

      {/* Footer Estruturado */}
      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-[1200px] flex-col items-center justify-between gap-3 px-6 py-5 text-xs text-muted-foreground sm:flex-row sm:px-10">
          <p className="font-medium">
            Selecta · Plataforma de recrutamento e seleção
          </p>
          <p className="text-muted-foreground">
            © {new Date().getFullYear()} Selecta. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
