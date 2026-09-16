import { RouteSkeleton } from "@/components/ui/route-skeleton"
import { Suspense } from "react"
import { JobsDashboardScreen } from "@/components/candidate/jobs/jobs-dashboard-screen"

export const metadata = {
  title: "Vagas | Selecta",
  description: "Encontre oportunidades que combinam com o seu perfil.",
}

export default function VagasPage() {
  return (
    <Suspense fallback={<RouteSkeleton variant="opportunities" />}>
      <JobsDashboardScreen />
    </Suspense>
  )
}
