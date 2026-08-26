import { ApplicationDetailScreen } from "@/components/candidate/applications/application-detail-screen"

export const metadata = {
  title: "Detalhe da candidatura",
  description: "Acompanhe as etapas, os feedbacks e o histórico do seu processo seletivo.",
}

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <ApplicationDetailScreen id={id} />
}
