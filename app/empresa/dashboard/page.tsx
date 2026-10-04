import type { Metadata } from "next"
import { CompanyDashboardScreen } from "@/components/company/dashboard/company-dashboard-screen"
export default function Page() { return <CompanyDashboardScreen /> }

export const metadata: Metadata = { title: "Visão geral" }
