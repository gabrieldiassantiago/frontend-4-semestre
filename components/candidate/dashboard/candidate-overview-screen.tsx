"use client"

import Link from "next/link"
import { Briefcase, CheckCircle2, FileText, Hourglass, Search } from "lucide-react"
import { PageHeader, PageShell, Section, SectionLink } from "@/components/ui/page"
import { RouteSkeleton } from "@/components/ui/route-skeleton"
import { StatCard } from "@/components/ui/stat-card"
import { EmptyState, ErrorState } from "@/components/ui/states"
import { getProfileCompletion } from "@/lib/candidate-completion"
import { ROUTES } from "@/lib/config/routes"
import { useCurrentUser } from "@/lib/queries/use-auth"
import { useCandidateProfile } from "@/lib/queries/use-candidate-profile"
import { useMinhasCandidaturas } from "@/lib/queries/use-candidaturas"
import { useVagas } from "@/lib/queries/use-vagas"
import { ActiveApplicationCard } from "./active-application-card"
import { OverviewGreeting } from "./overview-greeting"
import { RecommendedJobCard } from "./recommended-job-card"

const RECOMMENDED_LIMIT = 3

export function CandidateOverviewScreen() {
  const profileQuery = useCandidateProfile()
  const { user, loading: userLoading } = useCurrentUser()
  const applicationsQuery = useMinhasCandidaturas()
  const jobsQuery = useVagas()

  const loading = profileQuery.loading || userLoading || applicationsQuery.loading || jobsQuery.loading
  const error = profileQuery.error || applicationsQuery.error || jobsQuery.error

  if (loading) return <RouteSkeleton variant="dashboard" />

  if (error) {
    return (
      <PageShell className="max-w-6xl">
        <ErrorState
          title="Erro ao carregar visão geral"
          description={error}
          action={
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                void profileQuery.refetch()
                void applicationsQuery.refetch()
                void jobsQuery.refetch()
              }}
            >
              Tentar novamente
            </button>
          }
        />
      </PageShell>
    )
  }

  const { candidaturas } = applicationsQuery
  const firstName = (user?.name || profileQuery.profile?.userName)?.trim().split(" ")[0]
  const highlighted = candidaturas.find((c) => c.status === "EM_ANDAMENTO") ?? candidaturas[0] ?? null
  const inProgress = candidaturas.filter((c) => c.status === "EM_ANDAMENTO").length
  const approved = candidaturas.filter((c) => c.status === "APROVADA").length
  const completion = profileQuery.profile ? getProfileCompletion(profileQuery.profile).value : 0
  const recommended = jobsQuery.vagas.slice(0, RECOMMENDED_LIMIT)

  return (
    <PageShell className="max-w-6xl">
      <PageHeader
        title={<OverviewGreeting firstName={firstName} />}
        description="Veja o andamento dos seus processos e as oportunidades selecionadas para você."
        actions={
          <Link href={ROUTES.candidate.jobs} className="btn-secondary">
            <Search aria-hidden className="size-4" />
            Buscar vagas
          </Link>
        }
      />

      <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard label="Candidaturas" value={candidaturas.length} icon={FileText} tone="primary" />
        <StatCard label="Em andamento" value={inProgress} icon={Hourglass} tone="info" />
        <StatCard label="Aprovadas" value={approved} icon={CheckCircle2} tone="success" />
        <StatCard
          label="Perfil completo"
          value={`${completion}%`}
          icon={Briefcase}
          tone={completion >= 100 ? "success" : "warning"}
          note={completion < 100 ? "Complete para ganhar destaque" : undefined}
        />
      </div>

      <div className="mt-10 flex flex-col gap-10">
        <Section
          title="Suas candidaturas"
          actions={candidaturas.length > 0 && <SectionLink href={ROUTES.candidate.applications}>Ver todas</SectionLink>}
        >
          {highlighted ? (
            <ActiveApplicationCard candidatura={highlighted} />
          ) : (
            <EmptyState
              icon={FileText}
              title="Nenhuma candidatura ainda"
              description="Candidate-se a uma vaga para acompanhar cada etapa do processo seletivo por aqui."
              action={
                <Link href={ROUTES.candidate.jobs} className="btn-primary">
                  Explorar vagas
                </Link>
              }
            />
          )}
        </Section>

        <Section
          title="Vagas para você"
          description="Oportunidades abertas recentemente na plataforma."
          actions={recommended.length > 0 && <SectionLink href={ROUTES.candidate.jobs}>Ver todas</SectionLink>}
        >
          {recommended.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title="Nenhuma vaga aberta no momento"
              description="Novas oportunidades aparecem aqui assim que forem publicadas."
            />
          ) : (
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recommended.map((vaga) => (
                <li key={vaga.id}>
                  <RecommendedJobCard vaga={vaga} />
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>
    </PageShell>
  )
}
