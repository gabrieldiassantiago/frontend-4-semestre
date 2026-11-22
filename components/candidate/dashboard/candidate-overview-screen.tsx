"use client"

import Link from "next/link"
import { Briefcase, FileText } from "lucide-react"
import { PageShell, Section, SectionLink } from "@/components/ui/page"
import { CardSkeleton, EmptyState, ErrorState, Skeleton, StatCardsSkeleton } from "@/components/ui/states"
import { getProfileCompletion } from "@/lib/candidate-completion"
import { ROUTES } from "@/lib/config/routes"
import { useCurrentUser } from "@/lib/queries/use-auth"
import { useCandidateProfile } from "@/lib/queries/use-candidate-profile"
import { useMinhasCandidaturas } from "@/lib/queries/use-candidaturas"
import { useVagas } from "@/lib/queries/use-vagas"
import { ActiveApplicationCard } from "./active-application-card"
import { OverviewHero } from "./overview-hero"
import { OverviewStatGrid } from "./overview-stat-grid"
import { ProfileCompletionCard } from "./profile-completion-card"
import { QuickLinks } from "./quick-links"
import { RecentApplications } from "./recent-applications"
import { RecommendedJobCard } from "./recommended-job-card"

const RECOMMENDED_LIMIT = 3
const RECENT_LIMIT = 3

function RetryButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className="btn-primary" onClick={onClick}>
      Tentar novamente
    </button>
  )
}

export function CandidateOverviewScreen() {
  const profileQuery = useCandidateProfile()
  const { user, loading: userLoading } = useCurrentUser()
  const applicationsQuery = useMinhasCandidaturas()
  // Pede só as vagas exibidas (o backend pagina via `size`), em vez da lista inteira.
  const jobsQuery = useVagas({ size: RECOMMENDED_LIMIT }, { debounceMs: 0 })

  const { candidaturas } = applicationsQuery
  const highlighted = candidaturas.find((c) => c.status === "EM_ANDAMENTO") ?? candidaturas[0] ?? null
  const others = candidaturas.filter((c) => c.id !== highlighted?.id).slice(0, RECENT_LIMIT)
  const inProgress = candidaturas.filter((c) => c.status === "EM_ANDAMENTO").length
  const approved = candidaturas.filter((c) => c.status === "APROVADA").length
  const closed = candidaturas.filter((c) => c.status === "REPROVADA" || c.status === "CANCELADA").length
  const recommended = jobsQuery.vagas.slice(0, RECOMMENDED_LIMIT)

  const firstName = (user?.name || profileQuery.profile?.userName)?.trim().split(" ")[0]
  const profileLoading = profileQuery.loading || userLoading

  return (
    <PageShell className="max-w-[1280px]">
      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_280px] xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="flex min-w-0 flex-col gap-5">
          <OverviewHero />

          {applicationsQuery.loading ? (
            <StatCardsSkeleton />
          ) : (
            !applicationsQuery.error && (
              <OverviewStatGrid total={candidaturas.length} inProgress={inProgress} approved={approved} closed={closed} />
            )
          )}

          <Section
            title="Vagas para você"
            description="Oportunidades abertas recentemente na plataforma."
            actions={recommended.length > 0 && <SectionLink href={ROUTES.candidate.jobs}>Ver todas</SectionLink>}
          >
            {jobsQuery.loading ? (
              <div
                className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3"
                aria-busy="true"
                aria-live="polite"
              >
                <span className="sr-only">Carregando vagas</span>
                {Array.from({ length: RECOMMENDED_LIMIT }, (_, i) => (
                  <Skeleton key={i} className="h-44 rounded-2xl" />
                ))}
              </div>
            ) : jobsQuery.error ? (
              <ErrorState
                title="Erro ao carregar vagas"
                description={jobsQuery.error}
                action={<RetryButton onClick={() => void jobsQuery.refetch()} />}
              />
            ) : recommended.length === 0 ? (
              <EmptyState
                icon={Briefcase}
                title="Nenhuma vaga aberta no momento"
                description="Novas oportunidades aparecem aqui assim que forem publicadas."
              />
            ) : (
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {recommended.map((vaga) => (
                  <li key={vaga.id}>
                    <RecommendedJobCard vaga={vaga} />
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section
            title="Suas candidaturas"
            description="Acompanhe os próximos passos da sua jornada."
            actions={candidaturas.length > 0 && <SectionLink href={ROUTES.candidate.applications}>Ver todas</SectionLink>}
          >
            {applicationsQuery.loading ? (
              <CardSkeleton rows={2} />
            ) : applicationsQuery.error ? (
              <ErrorState
                title="Erro ao carregar candidaturas"
                description={applicationsQuery.error}
                action={<RetryButton onClick={() => void applicationsQuery.refetch()} />}
              />
            ) : highlighted ? (
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

        <aside aria-label="Seu perfil e atalhos" className="flex min-w-0 flex-col gap-5">
          {profileLoading ? (
            <div aria-busy="true" aria-live="polite">
              <span className="sr-only">Carregando perfil</span>
              <Skeleton className="h-72 w-full rounded-[28px]" />
            </div>
          ) : profileQuery.error ? (
            <ErrorState
              title="Erro ao carregar perfil"
              description={profileQuery.error}
              action={<RetryButton onClick={() => void profileQuery.refetch()} />}
            />
          ) : (
            <ProfileCompletionCard
              completion={getProfileCompletion(profileQuery.profile)}
              firstName={firstName}
              imageUrl={profileQuery.profile?.profileImageUrl}
            />
          )}
          <QuickLinks />
        </aside>
      </div>
    </PageShell>
  )
}
