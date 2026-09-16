import type { Metadata } from "next"
import Link from "next/link"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import { ArrowRight, CalendarDays, CheckCircle2, Gift, Lock, MapPin, Search } from "lucide-react"

import { SelectaLogo } from "@/components/ui/selecta-logo"
import { EntityAvatar } from "@/components/ui/entity-avatar"
import { VagaBenefits, VagaHighlights, VagaTags } from "@/components/vaga/vaga-facts"
import { VagaDescription } from "@/components/vaga/vaga-description"
import { ShareVagaButton } from "@/components/vaga/share-vaga-button"
import { getVagaPublic } from "@/lib/services/vagas.public"
import { formatDate, formatRelativeDate } from "@/lib/format"
import { CATEGORIA_LABELS, MODALIDADE_LABELS, NIVEL_LABELS } from "@/lib/types/vaga.types"

type PageProps = { params: Promise<{ id: string }> }

function toPlainText(markdown: string, limit = 200) {
  const text = markdown
    .replace(/#{1,6}\s+/g, "")
    .replace(/\*\*/g, "")
    .replace(/^[-*\u2022]\s+/gm, "")
    .replace(/\s+/g, " ")
    .trim()

  return text.length > limit ? `${text.slice(0, limit - 1)}…` : text
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const vaga = await getVagaPublic(id)

  if (!vaga) {
    return { title: "Vaga não encontrada", robots: { index: false, follow: false } }
  }

  const company = vaga.nomeEmpresa ?? "Empresa confidencial"
  const title = `${vaga.titulo} — ${company}`
  const description =
    toPlainText(vaga.descricao) ||
    `Vaga de ${vaga.titulo} (${NIVEL_LABELS[vaga.nivelExperiencia]}) em ${vaga.cidade} - ${vaga.estado} — ${MODALIDADE_LABELS[vaga.modalidade]}.`

  return {
    title,
    description,
    alternates: { canonical: `/vaga/${id}` },
    openGraph: {
      type: "article",
      siteName: "Selecta",
      url: `/vaga/${id}`,
      title,
      description,
    },
    twitter: { card: "summary_large_image", title, description },
    robots: vaga.ativa ? undefined : { index: false, follow: true },
  }
}

export default async function VagaPublicaPage({ params }: PageProps) {
  const { id } = await params
  const vaga = await getVagaPublic(id)

  if (!vaga) notFound()

  const company = vaga.nomeEmpresa ?? "Empresa confidencial"
  const isAuthenticated = Boolean((await cookies()).get("token")?.value)
  const applyHref = isAuthenticated ? `/dashboard?vaga=${vaga.id}` : `/auth?from=/vaga/${vaga.id}`

  const formattedSalary = vaga.salario
    ? vaga.salario.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    })
    : null

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      {/* Header Fino e Transparente */}
      <header className="sticky top-0 z-40 border-b border-border-subtle/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" aria-label="Selecta — página inicial">
            <SelectaLogo />
          </Link>

          <div className="flex items-center gap-3">
            <ShareVagaButton path={`/vaga/${vaga.id}`} title={`${vaga.titulo} — ${company}`} />
            <Link
              href={isAuthenticated ? "/dashboard" : "/auth"}
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border-subtle/80 bg-card px-4 text-xs font-semibold text-foreground transition-all duration-200 hover:border-border hover:shadow-sm active:scale-95"
            >
              {isAuthenticated ? "Ir para o painel" : "Entrar"}
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 lg:py-12">
        <article>
          {/* Título e Cabeçalho Estilo Anúncio Airbnb */}
          <header className="border-b border-border-subtle/60 pb-8">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <span>{company}</span>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3.5" />
                {vaga.cidade} - {vaga.estado}
              </span>
            </div>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-[40px] lg:leading-tight">
              {vaga.titulo}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <VagaTags vaga={vaga} />
              {!vaga.ativa && (
                <span className="inline-flex items-center rounded-full bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive">
                  Inscrições finalizadas
                </span>
              )}
            </div>
          </header>

          {/* Grid Principal: Conteúdo Aberto + Widget Lateral */}
          <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-12">
            {/* Coluna Esquerda: Narrativa Limpa */}
            <div className="space-y-10">
              {/* Card da Empresa */}
              <div className="flex items-center gap-4 border-b border-border-subtle/60 pb-8">
                <EntityAvatar name={company} size="lg" className="size-14 rounded-2xl sm:size-16" />
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    Oportunidade oferecida por {company}
                  </h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Publicada {formatRelativeDate(vaga.createdAt)} · {formatDate(vaga.createdAt)}
                  </p>
                </div>
              </div>

              {/* Destaques Rápidos da Vaga */}
              <div className="border-b border-border-subtle/60 pb-8">
                <VagaHighlights vaga={vaga} />
              </div>

              {/* Descrição em Prosa Fluida */}
              <section aria-labelledby="descricao-vaga" className="border-b border-border-subtle/60 pb-8">
                <h2 id="descricao-vaga" className="text-xl font-semibold tracking-tight text-foreground">
                  Sobre esta oportunidade
                </h2>
                <VagaDescription description={vaga.descricao} className="mt-5 leading-relaxed" />
              </section>

              {/* Benefícios */}
              {vaga.beneficios && (
                <section aria-labelledby="beneficios-vaga" className="border-b border-border-subtle/60 pb-8">
                  <div className="flex items-center gap-2">
                    <Gift className="size-5 text-primary" aria-hidden />
                    <h2 id="beneficios-vaga" className="text-xl font-semibold tracking-tight text-foreground">
                      O que a posição oferece
                    </h2>
                  </div>
                  <VagaBenefits beneficios={vaga.beneficios} className="mt-5" />
                </section>
              )}
            </div>

            {/* Coluna Direita: Sticky Widget Estilo Reserva Airbnb */}
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-3xl border border-border-subtle/80 bg-card/70 p-6 shadow-xl shadow-black/5 backdrop-blur-sm">
                <div className="flex items-baseline justify-between border-b border-border-subtle/60 pb-5">
                  <div>
                    {formattedSalary ? (
                      <div>
                        <span className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                          {formattedSalary}
                        </span>
                        <span className="text-xs text-muted-foreground"> / mês</span>
                      </div>
                    ) : (
                      <span className="text-lg font-semibold text-foreground">Salário a combinar</span>
                    )}
                  </div>
                  <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    {vaga.ativa ? "Aberta" : "Encerrada"}
                  </span>
                </div>

                {/* Bloco de Atributos com Bordas Suaves */}
                <div className="mt-5 divide-y divide-border-subtle/60 rounded-2xl border border-border-subtle/70 bg-background/50 text-xs">
                  <div className="flex items-center justify-between p-3.5">
                    <span className="text-muted-foreground">Modalidade</span>
                    <span className="font-semibold text-foreground">{MODALIDADE_LABELS[vaga.modalidade]}</span>
                  </div>
                  <div className="flex items-center justify-between p-3.5">
                    <span className="text-muted-foreground">Experiência</span>
                    <span className="font-semibold text-foreground">{NIVEL_LABELS[vaga.nivelExperiencia]}</span>
                  </div>
                  <div className="flex items-center justify-between p-3.5">
                    <span className="text-muted-foreground">Área</span>
                    <span className="text-right font-semibold text-foreground">{CATEGORIA_LABELS[vaga.categoria]}</span>
                  </div>
                </div>

                {/* Botão de Candidatura Principal */}
                <div className="mt-6">
                  {vaga.ativa ? (
                    <Link
                      href={applyHref}
                      className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-primary-foreground shadow-md transition-all hover:opacity-95 active:scale-95"
                    >
                      {isAuthenticated ? "Enviar candidatura" : "Entrar para se candidatar"}
                      {!isAuthenticated && <Lock className="size-4" aria-hidden />}
                    </Link>
                  ) : (
                    <div
                      aria-disabled
                      className="flex h-12 w-full cursor-not-allowed items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground"
                    >
                      Inscrições encerradas
                    </div>
                  )}
                  <p className="mt-3 text-center text-[11px] text-muted-foreground">
                    Você não será cobrado por enviar seu perfil
                  </p>
                </div>

                {/* Card de Segurança/Garantia */}
                <div className="mt-6 flex items-start gap-2.5 border-t border-border-subtle/60 pt-5 text-xs text-muted-foreground">
                  <CheckCircle2 className="size-4 shrink-0 text-primary" />
                  <span>Processo verificado pela Selecta. Dados protegidos e sem intermediários.</span>
                </div>
              </div>
            </aside>
          </div>
        </article>
      </main>

      {/* Floating Bottom Bar no Mobile (Estilo Airbnb Mobile Booking) */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between border-t border-border-subtle/60 bg-card/95 px-5 py-3 shadow-lg backdrop-blur-md lg:hidden">
        <div>
          {formattedSalary ? (
            <p className="text-base font-bold text-foreground">
              {formattedSalary}
              <span className="text-xs font-normal text-muted-foreground">/mês</span>
            </p>
          ) : (
            <p className="text-xs font-semibold text-foreground">A combinar</p>
          )}
          <p className="text-[11px] text-muted-foreground">{company}</p>
        </div>

        {vaga.ativa ? (
          <Link
            href={applyHref}
            className="inline-flex h-10 items-center justify-center rounded-full bg-primary px-5 text-xs font-semibold text-primary-foreground active:scale-95"
          >
            Candidatar-se
          </Link>
        ) : (
          <span className="text-xs font-medium text-muted-foreground">Encerrada</span>
        )}
      </div>

      <footer className="mt-12 border-t border-border-subtle/50 bg-background/50">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-2 px-4 py-8 text-center sm:px-6">
          <SelectaLogo />
          <p className="text-xs text-muted-foreground">
            Conectando profissionais talentosos a empresas inovadoras.
          </p>
        </div>
      </footer>
    </div>
  )
}