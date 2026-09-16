import { CompanyProcessesScreen } from "@/components/company/processes/company-processes-screen"

export default async function Page({ searchParams }: { searchParams: Promise<{ vaga?: string }> }) {
  const { vaga } = await searchParams
  return <CompanyProcessesScreen vagaId={vaga} />
}
