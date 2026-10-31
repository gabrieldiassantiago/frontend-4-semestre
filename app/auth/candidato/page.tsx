import { AuthScreen } from "@/components/auth/auth-screen"

export default async function CandidatoAuthPage({
  searchParams,
}: {
  searchParams: Promise<{ modo?: string }>
}) {
  const { modo } = await searchParams
  return <AuthScreen initialRole="candidato" initialMode={modo === "cadastro" ? "register" : "login"} />
}
