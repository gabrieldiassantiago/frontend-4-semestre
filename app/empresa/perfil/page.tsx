import type { Metadata } from "next"
import { CompanyProfileScreen } from "@/components/company/profile/company-profile-screen"
export default function Page() { return <CompanyProfileScreen /> }

export const metadata: Metadata = { title: "Perfil da empresa" }
