import type { Metadata } from "next"
import { CompanyTeamScreen } from "@/components/company/team/company-team-screen"

export const metadata: Metadata = { title: "Equipe" }

export default function Page() {
  return <CompanyTeamScreen />
}