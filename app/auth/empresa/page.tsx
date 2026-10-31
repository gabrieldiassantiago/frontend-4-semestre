import { AuthScreen } from "@/components/auth/auth-screen"

export default async function EmpresaAuthPage({
  searchParams,
}: {
  searchParams: Promise<{ modo?: string }>
}) {
  const { modo } = await searchParams
  return <AuthScreen initialRole="recrutador" initialMode={modo === "cadastro" ? "register" : "login"} />
}
