"use client"

import Link from "next/link"
import { Briefcase, FileText } from "lucide-react"
import { PageShell, Section, SectionLink } from "@/components/ui/page"
import { RouteSkeleton } from "@/components/ui/route-skeleton"
import { EmptyState, ErrorState } from "@/components/ui/states"
import { getProfileCompletion } from "@/lib/candidate-completion"
import { ROUTES } from "@/lib/config/routes"
import { useCurrentUser } from "@/lib/queries/use-auth"
import { useCandidateProfile } from "@/lib/queries/use-candidate-profile"
import { useMinhasCandidaturas } from "@/lib/queries/use-candidaturas"
import { useVagas } from "@/lib/queries/use-vagas"
import { ActiveApplicationCard } from "./active-application-card"
import { OverviewHero } from "./overview-hero"
import { ProfileCompletionCard } from "./profile-completion-card"
import { QuickLinks } from "./quick-links"
import { RecentApplications } from "./recent-applications"
import { RecommendedJobCard } from "./recommended-job-card"

const RECOMMENDED_LIMIT = 3
const RECENT_LIMIT = 3

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
  const others = candidaturas.filter((c) => c.id !== highlighted?.id).slice(0, RECENT_LIMIT)
  const inProgress = candidaturas.filter((c) => c.status === "EM_ANDAMENTO").length
  const approved = candidaturas.filter((c) => c.status === "APROVADA").length
  const closed = candidaturas.filter((c) => c.status === "REPROVADA" || c.status === "CANCELADA").length
  const completion = getProfileCompletion(profileQuery.profile)
  const recommended = jobsQuery.vagas.slice(0, RECOMMENDED_LIMIT)

  return (
    <PageShell className="max-w-6xl">
      <OverviewHero
        firstName={firstName}
        total={candidaturas.length}
        inProgress={inProgress}
        approved={approved}
        closed={closed}
      />

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-3 lg:gap-8">
        <div className="flex min-w-0 flex-col gap-10 lg:col-span-2">
          <Section
            title="Suas candidaturas"
            actions={candidaturas.length > 0 && <SectionLink href={ROUTES.candidate.applications}>Ver todas</SectionLink>}
          >
            {highlighted ? (
              <div className="flex flex-col gap-4">
                <ActiveApplicationCard candidatura={highlighted} />
                <RecentApplications candidaturas={others} />
              </div>
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
        </div>

        <aside aria-label="Seu perfil e atalhos" className="flex flex-col gap-4">
          <ProfileCompletionCard completion={completion} />
          <QuickLinks />
        </aside>
    </div>

      <div className="mt-10">
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
