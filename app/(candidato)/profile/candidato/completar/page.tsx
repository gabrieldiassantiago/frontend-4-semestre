import { CompleteProfileWizard } from "@/components/candidate/profile/complete-profile-wizard"
import { WELCOME_PARAM } from "@/lib/config/routes"

export const metadata = {
  title: "Completar perfil",
  description: "Preencha seu perfil passo a passo para se candidatar às vagas.",
}

export default async function CompleteProfilePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  return <CompleteProfileWizard welcome={params[WELCOME_PARAM] === "1"} />
}
