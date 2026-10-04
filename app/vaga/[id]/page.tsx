import type { Metadata } from "next"
import { ROUTES } from "@/lib/config/routes"
import Link from "next/link"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import { ArrowLeft, ArrowRight, CalendarDays, Check, MapPin } from "lucide-react"

import { SelectaLogo } from "@/components/ui/selecta-logo"
import { CompanyLogo } from "@/components/shared/company-logo"
import { parseBeneficios } from "@/components/shared/vaga/vaga-facts"
import { VagaDescription } from "@/components/shared/vaga/vaga-description"
import { ShareVagaButton } from "@/components/shared/vaga/share-vaga-button"
import { normalizeVagaDescription } from "@/lib/utils/vaga-description"
import { getVagaPublic } from "@/lib/services/vagas.public"
import { formatDate, formatCurrency } from "@/lib/format"
import { ETAPA_LABELS } from "@/lib/types/candidatura.types"
import { CATEGORIA_LABELS, MODALIDADE_LABELS, NIVEL_LABELS } from "@/lib/types/vaga.types"

type PageProps = { params: Promise<{ id: string }> }

function toPlainText(markdown: string, limit = 200) {
  const text = normalizeVagaDescription(markdown)
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
    `Vaga de ${vaga.titulo} (${(vaga.nivelExperiencia ? NIVEL_LABELS[vaga.nivelExperiencia] : "Nível não informado")}) em ${vaga.cidade} - ${vaga.estado} — ${MODALIDADE_LABELS[vaga.modalidade]}.`

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
  const applyHref = isAuthenticated ? ROUTES.candidate.job(vaga.id) : `/auth?from=/vaga/${vaga.id}`

  const formattedSalary = vaga.salario > 0 ? formatCurrency(vaga.salario) : "A combinar"
  const location = [vaga.cidade, vaga.estado].filter(Boolean).join(", ") || "Localização não informada"
  const benefits = parseBeneficios(vaga.beneficios)
  const steps = [...(vaga.etapas ?? [])].sort((a, b) => a.ordem - b.ordem)
  const facts = [
    { label: "Localização", value: location },
    { label: "Modalidade", value: MODALIDADE_LABELS[vaga.modalidade] || "Não informada" },
    { label: "Área de atuação", value: CATEGORIA_LABELS[vaga.categoria] || "Não informada" },
    ...(vaga.nivelExperiencia ? [{ label: "Nível de experiência", value: NIVEL_LABELS[vaga.nivelExperiencia] }] : []),
  ]

  return (
    <div className={"public-job flex min-h-dvh flex-col bg-surface text-foreground" + (vaga.ativa ? " public-job-with-action" : "")}>
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-20 w-full max-w-[1240px] items-center justify-between gap-4 px-5 sm:px-8">
          <Link href="/" aria-label="Selecta, página inicial"><SelectaLogo className="h-8" /></Link>
          <div className="flex items-center gap-4"><Link href={ROUTES.candidate.jobs} className="hidden text-sm font-medium text-muted-foreground hover:text-foreground sm:block">Explorar vagas</Link>
            <Link href={isAuthenticated ? ROUTES.candidate.overview : ROUTES.auth.root} className="btn-secondary">{isAuthenticated ? "Meu painel" : "Entrar"}<ArrowRight className="size-4" aria-hidden /></Link>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-[1240px] flex-1 px-5 py-7 sm:px-8 lg:py-10">
        <Link href={ROUTES.candidate.jobs} className="inline-flex min-h-10 items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" aria-hidden />Todas as vagas</Link>
        <article className="mt-5">
          <header className="rounded-xl border border-border bg-card p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3"><CompanyLogo url={vaga.logoUrlEmpresa} name={company} size="lg" /><div className="min-w-0"><p className="break-words text-sm font-semibold">{company}</p><p className="mt-1 text-xs text-muted-foreground">Oportunidade de trabalho</p></div></div>
              <span className={"rounded-md px-3 py-1.5 text-xs font-medium " + (vaga.ativa ? "bg-success-subtle text-success-foreground" : "bg-muted text-muted-foreground")}>{vaga.ativa ? "Inscrições abertas" : "Inscrições encerradas"}</span>
            </div>
            <h1 className="mt-6 max-w-4xl break-words text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">{vaga.titulo}</h1>
            <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2"><MapPin className="size-4 shrink-0" aria-hidden />{location}</span>
              <span>{MODALIDADE_LABELS[vaga.modalidade]}</span>
              {vaga.createdAt && <span className="inline-flex items-center gap-2"><CalendarDays className="size-4" aria-hidden />Publicada em {formatDate(vaga.createdAt)}</span>}
            </div>
          </header>
          <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="min-w-0 space-y-6">
              <section aria-labelledby="descricao-vaga" className="rounded-xl border border-border bg-card p-6 sm:p-8">
                <h2 id="descricao-vaga" className="text-lg font-semibold tracking-tight">Sobre a vaga</h2>
                <VagaDescription description={vaga.descricao} className="public-job-description mt-6 break-words" />
              </section>
              {benefits.length > 0 && <section aria-labelledby="beneficios-vaga" className="rounded-xl border border-border bg-card p-6 sm:p-8">
                <h2 id="beneficios-vaga" className="text-lg font-semibold tracking-tight">Benefícios</h2>
                <ul className="mt-5 grid gap-4 sm:grid-cols-2">{benefits.map((benefit,index) => <li key={index} className="flex items-start gap-3 text-sm leading-6 text-strong-foreground"><Check className="mt-1 size-4 shrink-0 text-muted-foreground" aria-hidden /><span className="min-w-0 break-words">{benefit}</span></li>)}</ul>
              </section>}
              {steps.length > 0 && <section aria-labelledby="etapas-vaga" className="rounded-xl border border-border bg-card p-6 sm:p-8">
                <h2 id="etapas-vaga" className="text-lg font-semibold tracking-tight">Etapas do processo seletivo</h2>
                <ol className="mt-6 space-y-5">{steps.map((step,index) => <li key={step.etapa + index} className="flex gap-4"><span className="grid size-8 shrink-0 place-items-center rounded-lg border border-border bg-surface text-xs font-medium text-muted-foreground">{index+1}</span><div className="min-w-0"><h3 className="text-sm font-medium">{ETAPA_LABELS[step.etapa] || step.etapa}</h3>{step.descricao && <p className="mt-1 break-words text-sm leading-6 text-muted-foreground">{step.descricao}</p>}</div></li>)}</ol>
              </section>}
            </div>
            <aside aria-label="Resumo da vaga e candidatura" className="min-w-0 space-y-4 lg:sticky lg:top-6">
              <section className="overflow-hidden rounded-xl border border-border bg-card">
                <div className="border-b border-border p-6"><p className="text-xs font-medium text-muted-foreground">Remuneração mensal</p><p className="mt-2 text-2xl font-semibold tracking-tight">{formattedSalary}</p></div>
                <dl className="space-y-5 p-6">{facts.map(fact => <div key={fact.label}><dt className="text-xs text-muted-foreground">{fact.label}</dt><dd className="mt-1 break-words text-sm font-medium leading-6">{fact.value}</dd></div>)}</dl>
                <div className="border-t border-border p-6">
                  {vaga.ativa ? <Link href={applyHref} className="btn-primary w-full">Candidatar-se<ArrowRight className="size-4" aria-hidden /></Link> : <p className="rounded-lg bg-surface px-4 py-3 text-center text-sm font-medium text-muted-foreground">Inscrições encerradas</p>}
                  <p className="mt-3 text-xs leading-6 text-muted-foreground">{vaga.ativa ? isAuthenticated ? "Revise seu perfil antes de enviar a candidatura." : "Entre ou crie uma conta de candidato para participar do processo." : "Esta vaga não está recebendo novas candidaturas."}</p>
                </div>
              </section>
              <ShareVagaButton path={"/vaga/" + vaga.id} title={vaga.titulo + " — " + company} className="w-full" />
            </aside>
          </div>
        </article>
      </main>
      <footer className="mt-8 border-t border-border bg-card"><div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-3 px-5 py-7 text-xs text-muted-foreground sm:px-8"><p>Selecta · Recrutamento e seleção</p><Link href={ROUTES.candidate.jobs} className="hover:text-foreground">Ver outras oportunidades</Link></div></footer>
      {vaga.ativa && <div className="public-job-mobile-action fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card px-5 py-3 lg:hidden"><div className="mx-auto flex max-w-lg items-center justify-between gap-4"><div className="min-w-0"><p className="text-[11px] text-muted-foreground">Remuneração mensal</p><p className="truncate text-sm font-semibold">{formattedSalary}</p></div><Link href={applyHref} className="btn-primary shrink-0">Candidatar-se<ArrowRight className="size-4" aria-hidden /></Link></div></div>}
    </div>
  )
}
