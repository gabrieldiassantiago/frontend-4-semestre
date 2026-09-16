"use client"

import Link from "next/link"
import useSWR from "swr"
import { ArrowLeft, ExternalLink, FileText, MapPin } from "lucide-react"
import { PageShell } from "@/components/ui/page"
import { Badge } from "@/components/ui/badge"
import { EntityAvatar } from "@/components/ui/entity-avatar"
import { Alert, CardSkeleton, ErrorState } from "@/components/ui/states"
import { RouteSkeleton } from "@/components/ui/route-skeleton"
import { CandidaturaDetailPanel } from "@/components/company/processes/candidatura-detail-panel"
import { useCandidaturaEmpresa } from "@/lib/hooks/useCandidaturas"
import { getCandidateProfileByUserId } from "@/lib/services/candidate.service"
import { API_BASE_URL } from "@/lib/http/config"
import type { CandidateProfile } from "@/lib/types/candidate.types"
import { formatDate } from "@/lib/format"

function documentUrl(value?: string) {
  if (!value) return null
  try { const url = new URL(value, API_BASE_URL + "/"); return ["https:", "http:"].includes(url.protocol) ? url.href : null } catch { return null }
}

export function CompanyCandidateDetailScreen({ candidaturaId }: { candidaturaId: string }) {
  const { detalhe, loading, error, refetch } = useCandidaturaEmpresa(candidaturaId)
  const userId = detalhe?.candidatura.candidatoUserId
  const { data: profile, isLoading: profileLoading, error: profileError, mutate } = useSWR(
    userId ? ["company-candidate-profile", userId] : null,
    () => getCandidateProfileByUserId(userId!),
    { revalidateOnFocus: false },
  )
  if (loading) return <RouteSkeleton variant="detail" />
  if (error || !detalhe) return <PageShell><Link href="/empresa/candidatos" className="mb-6 inline-flex items-center gap-2 text-sm text-primary"><ArrowLeft className="size-4" />Voltar aos candidatos</Link><ErrorState description={error ?? "Candidatura não encontrada."} action={<button className="btn-secondary" onClick={() => void refetch()}>Tentar novamente</button>} /></PageShell>
  const { candidatura } = detalhe
  const resume = documentUrl(candidatura.curriculoUrl)
  return (
    <PageShell className="max-w-7xl">
      <nav aria-label="Navegação do candidato" className="mb-6 flex flex-wrap gap-4 text-sm font-medium text-muted-foreground">
        <Link href="/empresa/candidatos" className="inline-flex min-h-10 items-center gap-2 hover:text-primary"><ArrowLeft className="size-4" aria-hidden />Todos os candidatos</Link>
        <Link href={"/empresa/processos?vaga=" + encodeURIComponent(candidatura.vagaId)} className="inline-flex min-h-10 items-center hover:text-primary">Voltar ao processo da vaga</Link>
      </nav>
      <header className="mb-8 flex items-start gap-4 border-b border-border pb-6">
        <img
          src={profile?.profileImageUrl ?? candidatura.candidatoImagemUrl}
          alt={candidatura.candidatoNome ?? "Candidato"}
          className="size-20 shrink-0 rounded-full border border-border object-cover"
          width={80}
          height={80}
        />        <div className="min-w-0"><p className="text-xs font-medium text-muted-foreground">Candidatura para {candidatura.vagaTitulo}</p><h1 className="mt-1 break-words text-2xl font-semibold tracking-tight sm:text-3xl">{candidatura.candidatoNome ?? "Candidato"}</h1><p className="mt-2 text-sm text-muted-foreground">{profile?.headline ?? candidatura.candidatoHeadline ?? "Perfil profissional"}</p></div>
      </header>
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(360px,1fr)]">
        <div className="min-w-0 space-y-6">
          <section aria-labelledby="candidate-profile-title" className="rounded-2xl border border-border bg-card p-5 sm:p-6">
            <h2 id="candidate-profile-title" className="text-lg font-semibold tracking-tight">Perfil do candidato</h2>
            {profileLoading ? <div className="mt-5"><CardSkeleton rows={2} /></div> : profileError ? <div className="mt-4"><Alert tone="info">Não foi possível carregar o perfil completo. Os documentos e o processo continuam disponíveis.</Alert><button className="btn-secondary mt-3" onClick={() => void mutate()}>Tentar carregar perfil</button></div> : profile ? <CandidateProfileContent profile={profile} /> : <p className="mt-4 text-sm text-muted-foreground">O perfil completo não está disponível nesta candidatura.</p>}
          </section>
          <section aria-labelledby="candidate-letter-title" className="rounded-2xl border border-border bg-card p-5 sm:p-6">
            <h2 id="candidate-letter-title" className="text-lg font-semibold tracking-tight">Carta de apresentação</h2>
            <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-relaxed text-muted-foreground">{candidatura.cartaApresentacao || "O candidato não enviou uma carta de apresentação."}</p>
          </section>
          <section aria-labelledby="candidate-resume-title" className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle p-5 sm:p-6"><div><h2 id="candidate-resume-title" className="flex items-center gap-2 text-lg font-semibold tracking-tight"><FileText className="size-5 text-primary" aria-hidden />Currículo enviado</h2><p className="mt-1 text-xs text-muted-foreground">Documento anexado a esta candidatura.</p></div>{resume && <a href={resume} target="_blank" rel="noopener noreferrer" className="btn-secondary">Abrir currículo<ExternalLink className="size-4" aria-hidden /></a>}</div>
            {resume ? <object data={resume} type="application/pdf" aria-label="Currículo enviado pelo candidato" className="h-[560px] w-full bg-muted sm:h-[720px]"><div className="p-8 text-center text-sm text-muted-foreground">A prévia não está disponível neste navegador. <a href={resume} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary underline">Abrir currículo em outra aba</a>.</div></object> : <p className="p-6 text-sm text-muted-foreground">Nenhum currículo foi anexado a esta candidatura.</p>}
          </section>
        </div>
        <section aria-label="Gestão da candidatura" className="min-w-0 overflow-hidden rounded-2xl border border-border bg-card">
          <h2 className="border-b border-border-subtle p-5 text-base font-semibold">Avaliação e andamento</h2>
          <CandidaturaDetailPanel candidaturaId={candidaturaId} showDocuments={false} />
        </section>
      </div>
    </PageShell>
  )
}

function experienceDate(value: string) {
  return formatDate(/^\d{4}-\d{2}-\d{2}$/.test(value) ? value + "T12:00:00" : value)
}

function CandidateProfileContent({ profile }: { profile: CandidateProfile }) {
  const location = [profile.city, profile.state].filter(Boolean).join(" · ")
  return <div className="mt-5 space-y-6 text-sm">
    {location && <p className="flex items-center gap-2 text-muted-foreground"><MapPin className="size-4" aria-hidden />{location}</p>}
    <p className="whitespace-pre-wrap break-words leading-relaxed text-muted-foreground">{profile.summary || "Resumo profissional não informado."}</p>
    <section><h3 className="font-semibold">Competências</h3><div className="mt-3 flex flex-wrap gap-2">{profile.skills?.length ? profile.skills.map(skill => <Badge key={skill} variant="primary">{skill}</Badge>) : <p className="text-muted-foreground">Não informadas.</p>}</div></section>
    <section><h3 className="font-semibold">Formação</h3><p className="mt-2 text-muted-foreground">{[profile.course, profile.institution].filter(Boolean).join(" · ") || "Não informada."}</p>{profile.currentSemester && <p className="mt-1 text-xs text-muted-foreground">{profile.currentSemester}º semestre{profile.expectedGraduationYear ? " · Conclusão prevista em " + profile.expectedGraduationYear : ""}</p>}</section>
    <section><h3 className="font-semibold">Experiências</h3>{profile.experiences?.length ? <ul className="mt-3 space-y-4">{profile.experiences.map(item => <li key={item.id} className="border-l-2 border-primary-subtle pl-4"><h4 className="font-medium">{item.role} · {item.companyName}</h4><p className="mt-1 text-xs text-muted-foreground">{experienceDate(item.startDate)} — {item.isCurrent ? "Atual" : item.endDate ? experienceDate(item.endDate) : "Não informado"}</p><p className="mt-2 whitespace-pre-wrap break-words leading-relaxed text-muted-foreground">{item.description}</p></li>)}</ul> : <p className="mt-2 text-muted-foreground">Não informadas.</p>}</section>
    <section><h3 className="font-semibold">Projetos</h3>{profile.projects?.length ? <ul className="mt-3 space-y-4">{profile.projects.map(item => <li key={item.id}><h4 className="font-medium">{item.title}</h4><p className="mt-2 whitespace-pre-wrap break-words leading-relaxed text-muted-foreground">{item.description}</p>{item.toolsAndSkills?.length ? <p className="mt-2 text-xs text-muted-foreground">{item.toolsAndSkills.join(" · ")}</p> : null}{documentUrl(item.projectUrl) && <a className="mt-2 inline-flex min-h-10 items-center gap-2 font-medium text-primary" href={documentUrl(item.projectUrl)!} target="_blank" rel="noopener noreferrer">Ver projeto<ExternalLink className="size-3.5" aria-hidden /></a>}</li>)}</ul> : <p className="mt-2 text-muted-foreground">Não informados.</p>}</section>
    <div className="flex flex-wrap gap-4 border-t border-border-subtle pt-4">{([["LinkedIn", profile.linkedinUrl], ["GitHub", profile.githubUrl], ["Portfólio", profile.portfolioUrl]] as const).map(([label, value]) => documentUrl(value) ? <a key={label} href={documentUrl(value)!} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center gap-2 font-medium text-primary">{label}<ExternalLink className="size-3.5" aria-hidden /></a> : null)}</div>
  </div>
}
