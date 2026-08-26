import { redirect } from "next/navigation"

/** /vagas era um duplicado de /dashboard — agora aponta para a rota canônica. */
export default function VagasPage() {
  redirect("/dashboard")
}
