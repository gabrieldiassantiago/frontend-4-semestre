import { redirect } from "next/navigation"

/** /profile era um duplicado de /profile/candidato — agora aponta para a rota canônica. */
export default function ProfilePage() {
  redirect("/profile/candidato")
}
