import { redirect } from "next/navigation"

export default async function OnboardingPage({ searchParams }: {
  searchParams: Promise<{ role?: string }>
}) {
  const { role } = await searchParams
  redirect(role === "empresa" || role === "recrutador" || role === "COMPANY"
    ? "/empresa/perfil"
    : "/profile/candidato/completar")
}
