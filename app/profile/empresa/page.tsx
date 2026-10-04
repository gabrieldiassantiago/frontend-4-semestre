import { ROUTES } from "@/lib/config/routes"
import { redirect } from "next/navigation"

export default function CompanyProfilePage() {
  redirect(ROUTES.company.profile)
}
