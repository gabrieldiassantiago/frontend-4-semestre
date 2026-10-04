import { ROUTES } from "@/lib/config/routes"
import { redirect } from "next/navigation"

export default function Page() {
  redirect(ROUTES.company.dashboard)
}
