"use client"

import Link from "next/link"
import { motion, useReducedMotion } from "framer-motion"
import { ArrowRight, BriefcaseBusiness, Clock, Sparkles, UserRound, Wand2 } from "lucide-react"

import { EntityAvatar } from "@/components/ui/entity-avatar"
import { SelectaLogo } from "@/components/ui/selecta-logo"
import { ROUTES } from "@/lib/config/routes"
import { useCurrentUser } from "@/lib/queries/use-auth"

const PASSOS = [
  {
    icon: UserRound,
    title: "Conte quem você é",
    description: "Dados básicos, localização e formação. É o que as empresas leem primeiro.",
  },
  {
    icon: Wand2,
    title: "Mostre o que você sabe",
    description: "Habilidades, experiências e projetos deixam suas recomendações de vagas mais precisas.",
  },
  {
    icon: BriefcaseBusiness,
    title: "Candidate-se com um clique",
    description: "Com o perfil pronto, você se candidata e acompanha cada etapa do processo.",
  },
] as const

/**
 * Tela exibida uma única vez para candidatos recém-cadastrados, antes da
 * primeira etapa do wizard. Controlada pela flag `boasVindas=1` na URL.
 */
export function WizardWelcome({
  name,
  photoUrl,
  onStart,
}: {
  name?: string | null
  photoUrl?: string | null
  onStart: () => void
}) {
  const reduceMotion = useReducedMotion()
  // No cadastro por e-mail o perfil ainda não existe: usa os dados da sessão.
  const { user } = useCurrentUser()
  const nome = name?.trim() || user?.name?.trim() || null
  const foto = photoUrl || user?.avatarUrl || null
  const firstName = nome?.split(/\s+/)[0]

  const entrada = (delay: number) => ({
    initial: { opacity: 0, y: reduceMotion ? 0 : 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: reduceMotion ? 0 : 0.4, delay: reduceMotion ? 0 : delay, ease: [0.22, 1, 0.36, 1] as const },
  })

  return (
    <div className="min-h-dvh bg-surface pb-[env(safe-area-inset-bottom)] text-foreground">
      <header className="border-b border-border bg-card/95">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-4 md:px-6">
          <SelectaLogo className="h-7" />
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl px-4 py-8 sm:py-14">
        <motion.section
          {...entrada(0)}
          aria-labelledby="welcome-title"
          className="overflow-hidden rounded-3xl border border-border bg-card shadow-card"
        >
          <div className="h-1.5 w-full bg-primary" />

          <div className="px-6 py-8 text-center sm:px-10 sm:py-10">
            <div className="relative mx-auto mb-5 w-fit">
              <EntityAvatar
                name={nome || "Você"}
                src={foto}
                size="lg"
                className="size-20 rounded-full text-xl ring-4 ring-primary/15"
              />
              <span className="absolute -bottom-1 -right-1 grid size-8 place-items-center rounded-full border-2 border-card bg-primary text-primary-foreground">
                <Sparkles className="size-4" aria-hidden />
              </span>
            </div>

            <p className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              Conta criada
            </p>

            <h1
              id="welcome-title"
              className="text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
            >
              {firstName ? `Boas-vindas ao Selecta, ${firstName}!` : "Boas-vindas ao Selecta!"}
            </h1>

            <p className="mx-auto mt-3 max-w-md text-pretty text-sm leading-relaxed text-muted-foreground">
              Que bom ter você aqui. Antes de explorar as vagas, vamos montar seu perfil:
              é ele que as empresas veem quando você se candidata.
            </p>

            <ol className="mt-8 flex flex-col gap-3 text-left">
              {PASSOS.map((passo, index) => (
                <motion.li
                  key={passo.title}
                  {...entrada(0.08 + index * 0.06)}
                  className="flex items-start gap-4 rounded-2xl border border-border bg-background/60 p-4"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                    <passo.icon className="size-5" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">
                      <span className="sr-only">Passo {index + 1}: </span>
                      {passo.title}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{passo.description}</p>
                  </div>
                </motion.li>
              ))}
            </ol>

            <p className="mt-6 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="size-3.5" aria-hidden />
              Leva cerca de 5 minutos. Seu progresso é salvo a cada etapa.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={onStart}
                autoFocus
                className="btn-primary flex min-h-11 flex-1 items-center justify-center gap-2"
              >
                Começar meu perfil
                <ArrowRight className="size-4" aria-hidden />
              </button>
              <Link
                href={ROUTES.candidate.overview}
                className="btn-secondary flex min-h-11 flex-1 items-center justify-center"
              >
                Explorar vagas primeiro
              </Link>
            </div>
          </div>
        </motion.section>
      </main>
    </div>
  )
}
