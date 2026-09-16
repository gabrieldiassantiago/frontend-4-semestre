import { CompanyCandidateDetailScreen } from "@/components/company/candidates/company-candidate-detail-screen"

export const metadata = { title: "Detalhes do candidato" }

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <CompanyCandidateDetailScreen candidaturaId={id} />
}
