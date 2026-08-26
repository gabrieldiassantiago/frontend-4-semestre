import type { Metadata } from "next"
import Link from "next/link"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import { ArrowRight, CalendarDays, Gift, Lock, Search } from "lucide-react"
import { SelectaLogo } from "@/components/ui/selecta-logo"
import { Badge } from "@/components/ui/badge"
import { EntityAvatar } from "@/components/ui/entity-avatar"
import { VagaBenefits, VagaHighlights, VagaTags } from "@/components/vaga/vaga-facts"
import { VagaDescription } from "@/components/vaga/vaga-description"
import { ShareVagaButton } from "@/components/vaga/share-vaga-button"
import { getVagaPublic } from "@/lib/services/vagas.public"
import { formatDate, formatRelativeDate } from "@/lib/format"
import { CATEGORIA_LABELS, MODALIDADE_LABELS, NIVEL_LABELS } from "@/lib/types/vaga.types"

type PageProps = { params: Promise<{ id: string }> }

/** Remove a marcação do markdown simplificado para usar em metadata. */
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

  const company = vaga.companyName ?? "Empresa confidencial"
  const title = `${vaga.titulo} — ${company}`
  const description =
    toPlainText(vaga.descricao) ||
    `Vaga de ${vaga.titulo} (${NIVEL_LABELS[vaga.nivelExperiencia]}) em ${vaga.cidade}, ${vaga.estado} — ${MODALIDADE_LABELS[vaga.modalidade]}.`

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

  const company = vaga.companyName ?? "Empresa confidencial"
  const isAuthenticated = Boolean((await cookies()).get("token")?.value)
  const applyHref = isAuthenticated ? `/dashboard?vaga=${vaga.id}` : `/auth?from=/vaga/${vaga.id}`

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" aria-label="Selecta — página inicial">
            <SelectaLogo />
          </Link>

          <Link
            href={isAuthenticated ? "/dashboard" : "/auth"}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-strong-foreground transition-colors hover:text-primary"
          >
            {isAuthenticated ? "Ir para o app" : "Entrar"}
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 lg:py-12">
        <article>
          {/* ── Identificação da vaga ── */}
          <header className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
            <EntityAvatar name={company} size="lg" className="sm:size-16 sm:rounded-2xl sm:text-lg" />

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-muted-foreground">{company}</p>
              <h1 className="mt-1.5 text-2xl font-bold leading-tight tracking-tight text-foreground text-balance sm:text-3xl">
                {vaga.titulo}
              </h1>

              <div className="mt-4 flex flex-wrap items-center gap-1.5">
                <VagaTags vaga={vaga} />
                {!vaga.ativa && <Badge variant="danger">Encerrada</Badge>}
              </div>
            </div>
          </header>

          {/* ── Ações ── */}
          <div className="mt-7 flex flex-wrap items-center gap-2.5">
            {vaga.ativa ? (
              <Link href={applyHref} className="btn-primary">
                {isAuthenticated ? "Candidatar-se" : "Entrar para se candidatar"}
                {!isAuthenticated && <Lock className="size-4" aria-hidden />}
              </Link>
            ) : (
              <span className="btn-secondary pointer-events-none opacity-60" aria-disabled>
                Candidaturas encerradas
              </span>
            )}

            <ShareVagaButton path={`/vaga/${vaga.id}`} title={`${vaga.titulo} — ${company}`} />
          </div>

          {/* ── Conteúdo ── */}
          <div className="mt-9 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-8">
            <div className="flex flex-col gap-6">
              <section
                aria-labelledby="descricao-vaga"
                className="rounded-panel border border-border bg-card p-6 shadow-card sm:p-8"
              >
                <h2
                  id="descricao-vaga"
                  className="text-lg font-bold tracking-tight text-foreground"
                >
                  Sobre a vaga
                </h2>
                <VagaDescription description={vaga.descricao} className="mt-5" />
              </section>

              {vaga.beneficios && (
                <section
                  aria-labelledby="beneficios-vaga"
                  className="rounded-panel border border-border bg-card p-6 shadow-card sm:p-8"
                >
                  <h2
                    id="beneficios-vaga"
                    className="flex items-center gap-2 text-lg font-bold tracking-tight text-foreground"
                  >
                    <Gift className="size-[18px] text-primary" aria-hidden />
                    Benefícios
                  </h2>
                  <VagaBenefits beneficios={vaga.beneficios} className="mt-4" />
                </section>
              )}
            </div>

            {/* ── Resumo lateral ── */}
            <aside className="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start">
              <section
                aria-labelledby="resumo-vaga"
                className="rounded-panel border border-border bg-card p-5 shadow-card"
              >
                <h2
                  id="resumo-vaga"
                  className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground"
                >
                  Resumo
                </h2>

                <VagaHighlights vaga={vaga} className="mt-4" />

                <dl className="mt-5 flex flex-col gap-3 border-t border-border-subtle pt-4 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-muted-foreground">Modalidade</dt>
                    <dd className="font-semibold text-foreground">
                      {MODALIDADE_LABELS[vaga.modalidade]}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-muted-foreground">Experiência</dt>
                    <dd className="font-semibold text-foreground">
                      {NIVEL_LABELS[vaga.nivelExperiencia]}
                    </dd>
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <dt className="shrink-0 text-muted-foreground">Área</dt>
                    <dd className="text-right font-semibold text-foreground">
                      {CATEGORIA_LABELS[vaga.categoria]}
                    </dd>
                  </div>
                </dl>

                {vaga.createdAt && (
                  <p className="mt-4 flex items-center gap-2 border-t border-border-subtle pt-4 text-xs text-muted-foreground">
                    <CalendarDays className="size-3.5" aria-hidden />
                    <span>
                      Publicada {formatRelativeDate(vaga.createdAt)}
                      <span className="text-subtle-foreground"> · {formatDate(vaga.createdAt)}</span>
                    </span>
                  </p>
                )}
              </section>

              <section className="rounded-panel border border-border bg-card p-5 shadow-card">
                <div className="flex items-center gap-3">
                  <EntityAvatar name={company} size="sm" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-foreground">{company}</p>
                    <p className="text-xs text-muted-foreground">
                      {vaga.cidade}, {vaga.estado}
                    </p>
                  </div>
                </div>
                <Link
                  href={isAuthenticated ? "/dashboard" : "/auth"}
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary-hover"
                >
                  <Search className="size-4" aria-hidden />
                  Ver outras vagas
                </Link>
              </section>
            </aside>
          </div>
        </article>
      </main>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-1 px-4 py-8 text-center sm:px-6">
          <SelectaLogo />
          <p className="mt-2 text-sm text-muted-foreground text-pretty">
            Processos seletivos mais transparentes e humanos.
          </p>
        </div>
      </footer>
    </div>
  )
}
