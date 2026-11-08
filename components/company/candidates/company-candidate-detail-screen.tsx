"use client"

import { resumeHref } from "@/lib/utils/resume"

import { etapaLabel } from "@/lib/types/candidatura.types"


import { useState } from "react"
import Link from "next/link"
import {
  Briefcase,
  CalendarDays,
  Check,
  ChevronLeft,
  ExternalLink,
  FileText,
  FolderGit2,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  X,
} from "lucide-react"
import { PageShell } from "@/components/ui/page"
import { EntityAvatar } from "@/components/ui/entity-avatar"
import { Alert, CardSkeleton, ErrorState } from "@/components/ui/states"
import { RouteSkeleton } from "@/components/ui/route-skeleton"
import { StatusBadge } from "@/components/shared/candidatura/candidatura-ui"
import { CandidaturaDetailPanel } from "@/components/company/processes/candidatura-detail-panel"
import { CandidaturaChatButton } from "@/components/shared/chat/candidatura-chat"
import { ROUTES } from "@/lib/config/routes"
import { useCandidaturaEmpresa } from "@/lib/queries/use-candidaturas"
import { useCandidateProfileByUser } from "@/lib/queries/use-candidate-profile"
import { API_BASE_URL } from "@/lib/http/config"
import type { CandidateProfile } from "@/lib/types/candidate.types"
import { etapasDaVaga, type Candidatura } from "@/lib/types/candidatura.types"
import { formatDate, formatRelativeDate } from "@/lib/format"
import { cn } from "@/lib/utils"

function documentUrl(value?: string) {
  if (!value) return null
  try {
    const url = new URL(value, API_BASE_URL + "/")
    return ["https:", "http:"].includes(url.protocol) ? url.href : null
  } catch {
    return null
  }
}

type Tab = "perfil" | "curriculo" | "carta"

export function CompanyCandidateDetailScreen({ candidaturaId }: { candidaturaId: string }) {
  const { detalhe, loading, error, refetch } = useCandidaturaEmpresa(candidaturaId)
  const userId = detalhe?.candidatura.candidatoUserId
  const profileQuery = useCandidateProfileByUser(userId)
  const [tab, setTab] = useState<Tab>("perfil")

  if (loading) return <RouteSkeleton variant="detail" />
  if (error || !detalhe) {
    return (
      <PageShell>
        <BackLink />
        <ErrorState
          description={error ?? "Candidatura não encontrada."}
          action={
            <button className="btn-secondary" onClick={() => void refetch()}>
              Tentar novamente
            </button>
          }
        />
      </PageShell>
    )
  }

  const { candidatura } = detalhe
  const profile = profileQuery.profile
  const resume = resumeHref(candidatura.curriculoUrl ?? profile?.resumeUrl)
  const nome = candidatura.candidatoNome ?? profile?.userName ?? "Candidato"
  const imagem = profile?.profileImageUrl ?? candidatura.candidatoImagemUrl
  const location = [profile?.city, profile?.state].filter(Boolean).join(", ")
  const email = candidatura.candidatoEmail ?? profile?.userEmail
  const links = (
    [
      ["LinkedIn", profile?.linkedinUrl],
      ["GitHub", profile?.githubUrl],
      ["Portfólio", profile?.portfolioUrl],
    ] as const
  ).flatMap(([label, value]) => {
    const href = documentUrl(value)
    return href ? [{ label, href }] : []
  })

  const tabs: { id: Tab; label: string }[] = [
    { id: "perfil", label: "Perfil" },
    { id: "curriculo", label: "Currículo" },
    { id: "carta", label: "Carta de apresentação" },
  ]

  return (
    <PageShell className="max-w-[1380px]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <BackLink />
        <Link
          href={`${ROUTES.company.processes}?vaga=${encodeURIComponent(candidatura.vagaId)}`}
          className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
        >
          Ver funil da vaga
          <ExternalLink aria-hidden className="size-3.5" />
        </Link>
      </div>

      <section aria-label="Resumo do candidato" className="mt-4 overflow-hidden rounded-2xl border border-border bg-card">
        <div className="flex flex-col gap-5 p-5 sm:p-6 md:flex-row md:items-start">
          {imagem ? (
            <img
              src={imagem}
              alt=""
              width={80}
              height={80}
              className="size-20 shrink-0 rounded-full border border-border object-cover"
            />
          ) : (
            <EntityAvatar name={nome} size="lg" className="size-20 rounded-full text-xl" />
          )}

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="break-words text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{nome}</h1>
              <StatusBadge status={candidatura.status} />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {profile?.headline ?? candidatura.candidatoHeadline ?? "Perfil profissional"}
            </p>

            <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-1.5">
                <Briefcase aria-hidden className="size-4 text-subtle-foreground" />
                {candidatura.vagaTitulo}
              </li>
              {candidatura.createdAt && (
                <li className="flex items-center gap-1.5">
                  <CalendarDays aria-hidden className="size-4 text-subtle-foreground" />
                  Inscrito {formatRelativeDate(candidatura.createdAt)}
                </li>
              )}
              {location && (
                <li className="flex items-center gap-1.5">
                  <MapPin aria-hidden className="size-4 text-subtle-foreground" />
                  {location}
                </li>
              )}
              {email && (
                <li>
                  <a href={`mailto:${email}`} className="flex items-center gap-1.5 hover:text-primary">
                    <Mail aria-hidden className="size-4 text-subtle-foreground" />
                    {email}
                  </a>
                </li>
              )}
              {profile?.phone && (
                <li>
                  <a href={`tel:${profile.phone.replace(/\D/g, "")}`} className="flex items-center gap-1.5 hover:text-primary">
                    <Phone aria-hidden className="size-4 text-subtle-foreground" />
                    {profile.phone}
                  </a>
                </li>
              )}
            </ul>

            {links.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {links.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-border px-2.5 text-xs font-semibold text-strong-foreground transition-colors hover:bg-muted"
                  >
                    {link.label}
                    <ExternalLink aria-hidden className="size-3" />
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="flex shrink-0 flex-wrap gap-2 md:flex-col md:items-stretch">
            <CandidaturaChatButton
              candidaturaId={candidatura.id}
              contatoNome={nome}
              contatoImagemUrl={imagem}
              perspectiva="empresa"
              assunto={`Candidatura para ${candidatura.vagaTitulo}`}
            />
            {resume && (
              <a href={resume} target="_blank" rel="noopener noreferrer" className="btn-secondary">
                <FileText aria-hidden className="size-4" />
                Currículo
              </a>
            )}
          </div>
        </div>

        <StageStepper candidatura={candidatura} />
      </section>

      <div className="mt-6 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_400px]">
        <section aria-label="Dados do candidato" className="min-w-0 rounded-2xl border border-border bg-card">
          <div
            role="tablist"
            aria-label="Gestão da candidatura"
            className="flex gap-4 overflow-x-auto overflow-y-hidden border-b border-border px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {tabs.map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={tab === item.id}
                onClick={() => setTab(item.id)}
                className={cn(
                  "-mb-px shrink-0 whitespace-nowrap border-b-2 py-3.5 text-sm font-semibold transition-colors",
                  tab === item.id
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="p-5 sm:p-6">
            {tab === "perfil" &&
              (profileQuery.loading ? (
                <CardSkeleton rows={3} />
              ) : profileQuery.error ? (
                <div>
                  <Alert tone="info">Não foi possível carregar o perfil completo. Os documentos e o processo continuam disponíveis.</Alert>
                  <button className="btn-secondary mt-3" onClick={() => void profileQuery.refetch()}>
                    Tentar carregar perfil
                  </button>
                </div>
              ) : profile ? (
                <CandidateProfileContent profile={profile} />
              ) : (
                <p className="text-sm text-muted-foreground">O perfil completo não está disponível nesta candidatura.</p>
              ))}

            {tab === "curriculo" &&
              (resume ? (
                <div className="overflow-hidden rounded-xl border border-border">
                  <object data={resume} type="application/pdf" aria-label="Currículo enviado pelo candidato" className="h-[640px] w-full bg-muted sm:h-[760px]">
                    <div className="p-8 text-center text-sm text-muted-foreground">
                      A prévia não está disponível neste navegador.{" "}
                      <a href={resume} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary underline">
                        Abrir currículo em outra aba
                      </a>
                      .
                    </div>
                  </object>
                </div>
              ) : (
                <EmptyBlock icon={FileText} text="Currículo indisponível para esta candidatura." />
              ))}

            {tab === "carta" &&
              (candidatura.cartaApresentacao ? (
                <blockquote className="whitespace-pre-wrap break-words border-l-2 border-primary pl-4 text-[15px] leading-relaxed text-strong-foreground">
                  {candidatura.cartaApresentacao}
                </blockquote>
              ) : (
                <EmptyBlock icon={Mail} text="O candidato não enviou uma carta de apresentação." />
              ))}
          </div>
        </section>

        <section
          aria-labelledby="gestao-title"
          className="min-w-0 rounded-2xl border border-border bg-card"
        >
          <div className="border-b border-border-subtle px-5 py-4">
            <h2 id="gestao-title" className="text-base font-semibold tracking-tight text-foreground">
              Avaliação e andamento
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Mova o candidato, agende conversas e registre feedbacks.
            </p>
          </div>

          {/* Anula max-height/overflow que o painel usa quando está dentro da gaveta */}
          <div className="min-w-0 [&>*]:h-auto [&>*]:max-h-none [&>*]:overflow-visible">
            <CandidaturaDetailPanel candidaturaId={candidaturaId} showDocuments={false} showHeader={false} />
          </div>
        </section>
      </div>
    </PageShell>
  )
}

function BackLink() {
  return (
    <Link
      href={ROUTES.company.candidates}
      className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
    >
      <ChevronLeft aria-hidden className="size-4" />
      Candidatos
    </Link>
  )
}

function StageStepper({ candidatura }: { candidatura: Candidatura }) {
  const flow = etapasDaVaga(candidatura.etapasVaga)
  const current = flow.indexOf(candidatura.etapaAtual)
  const failed = candidatura.status === "REPROVADA" || candidatura.status === "CANCELADA"
  const approved = candidatura.status === "APROVADA"

  return (
    <div className="border-t border-border-subtle bg-surface px-5 py-4 sm:px-6">
      <ol className="flex items-center gap-2 overflow-x-auto" aria-label={`Etapa ${current + 1} de ${flow.length}`}>
        {flow.map((etapa, index) => {
          const done = index < current || (approved && index === current)
          const active = index === current && !approved
          return (
            <li key={etapa} className="flex shrink-0 items-center gap-2">
              {index > 0 && <span aria-hidden className={cn("h-px w-6 sm:w-10", index <= current ? "bg-primary" : "bg-border")} />}
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
                  done && "bg-primary-subtle text-primary-subtle-foreground",
                  active && !failed && "bg-primary text-primary-foreground",
                  active && failed && "bg-danger-subtle text-danger-foreground",
                  index > current && "text-subtle-foreground",
                )}
              >
                {done ? (
                  <Check aria-hidden className="size-3.5" />
                ) : active && failed ? (
                  <X aria-hidden className="size-3.5" />
                ) : (
                  <span className="tabular-nums">{index + 1}</span>
                )}
                {etapaLabel(etapa, candidatura.etapasVaga)}
                {active && <span className="sr-only">(etapa atual)</span>}
              </span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

function EmptyBlock({ icon: Icon, text }: { icon: React.ComponentType<{ className?: string }>; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border px-6 py-12 text-center">
      <Icon className="size-6 text-subtle-foreground" />
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  )
}

function experienceDate(value: string) {
  return formatDate(/^\d{4}-\d{2}-\d{2}$/.test(value) ? value + "T12:00:00" : value, { month: "short", year: "numeric" })
}

function ProfileBlock({ title, icon: Icon, children }: { title: string; icon?: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {Icon && <Icon className="size-3.5" />}
        {title}
      </h3>
      <div className="mt-3">{children}</div>
    </section>
  )
}

function CandidateProfileContent({ profile }: { profile: CandidateProfile }) {
  return (
    <div className="flex flex-col gap-8 text-sm">
      <ProfileBlock title="Sobre">
        <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed text-strong-foreground">
          {profile.summary || "Resumo profissional não informado."}
        </p>
      </ProfileBlock>

      <ProfileBlock title="Competências">
        {profile.skills?.length ? (
          <ul className="flex flex-wrap gap-1.5">
            {profile.skills.map((skill) => (
              <li key={skill} className="rounded-lg bg-muted px-2.5 py-1 text-xs font-semibold text-strong-foreground">
                {skill}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground">Não informadas.</p>
        )}
      </ProfileBlock>

      <ProfileBlock title="Experiência" icon={Briefcase}>
        {profile.experiences?.length ? (
          <ol className="flex flex-col">
            {profile.experiences.map((item, index, list) => (
              <li key={item.id} className="relative flex gap-4 pb-6 last:pb-0">
                {index < list.length - 1 && <span aria-hidden className="absolute left-[7px] top-5 h-full w-px bg-border" />}
                <span
                  aria-hidden
                  className={cn("relative mt-1.5 size-[15px] shrink-0 rounded-full border-2 bg-card", item.isCurrent ? "border-primary" : "border-border-strong")}
                />
                <div className="min-w-0">
                  <p className="font-semibold text-foreground">{item.role}</p>
                  <p className="text-muted-foreground">{item.companyName}</p>
                  <p className="mt-0.5 text-xs text-subtle-foreground">
                    {experienceDate(item.startDate)} — {item.isCurrent ? "Atual" : item.endDate ? experienceDate(item.endDate) : "Não informado"}
                  </p>
                  {item.description && (
                    <p className="mt-2 whitespace-pre-wrap break-words leading-relaxed text-strong-foreground">{item.description}</p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-muted-foreground">Não informadas.</p>
        )}
      </ProfileBlock>

      <ProfileBlock title="Formação" icon={GraduationCap}>
        {profile.course || profile.institution ? (
          <div className="rounded-xl border border-border p-4">
            <p className="font-semibold text-foreground">{profile.course ?? "Curso não informado"}</p>
            <p className="text-muted-foreground">{profile.institution}</p>
            {(profile.currentSemester || profile.expectedGraduationYear) && (
              <p className="mt-1 text-xs text-subtle-foreground">
                {profile.currentSemester ? `${profile.currentSemester}º semestre` : ""}
                {profile.currentSemester && profile.expectedGraduationYear ? " · " : ""}
                {profile.expectedGraduationYear ? `Conclusão prevista em ${profile.expectedGraduationYear}` : ""}
              </p>
            )}
          </div>
        ) : (
          <p className="text-muted-foreground">Não informada.</p>
        )}
      </ProfileBlock>

      <ProfileBlock title="Projetos" icon={FolderGit2}>
        {profile.projects?.length ? (
          <ul className="grid gap-3 sm:grid-cols-2">
            {profile.projects.map((item) => {
              const href = documentUrl(item.projectUrl)
              return (
                <li key={item.id} className="flex flex-col rounded-xl border border-border p-4">
                  <p className="font-semibold text-foreground">{item.title}</p>
                  {item.description && <p className="mt-1.5 line-clamp-3 leading-relaxed text-muted-foreground">{item.description}</p>}
                  {item.toolsAndSkills?.length ? (
                    <p className="mt-2 text-xs text-subtle-foreground">{item.toolsAndSkills.join(" · ")}</p>
                  ) : null}
                  {href && (
                    <a className="mt-auto inline-flex items-center gap-1.5 pt-3 text-xs font-semibold text-primary" href={href} target="_blank" rel="noopener noreferrer">
                      Ver projeto
                      <ExternalLink aria-hidden className="size-3" />
                    </a>
                  )}
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="text-muted-foreground">Não informados.</p>
        )}
      </ProfileBlock>
    </div>
  )
}
