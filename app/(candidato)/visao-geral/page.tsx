import { Suspense } from "react"
import { RouteSkeleton } from "@/components/ui/route-skeleton"
import { CandidateOverviewScreen } from "@/components/candidate/dashboard/candidate-overview-screen"

export const metadata = {
  title: "Visão geral",
  description: "Visão geral e métricas do painel do candidato",
}

export default function VisaoGeralPage() {
  return (
    <Suspense fallback={<RouteSkeleton variant="dashboard" />}>
      <CandidateOverviewScreen />
    </Suspense>
  )
}
