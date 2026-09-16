import { RouteSkeleton } from "@/components/ui/route-skeleton"
import { Suspense } from "react"
import { JobsDashboardScreen } from "@/components/candidate/jobs/jobs-dashboard-screen"

export const metadata = {
  title: "Vagas",
  description: "Encontre oportunidades de estágio alinhadas ao seu perfil.",
}

export default function DashboardPage() {
  // A tela lê `?vaga=` para abrir a candidatura vinda das páginas públicas,
  // então precisa de um limite de Suspense em volta do useSearchParams.
  return (
    <Suspense fallback={<RouteSkeleton variant="opportunities" />}>
      <JobsDashboardScreen />
    </Suspense>
  )
}
