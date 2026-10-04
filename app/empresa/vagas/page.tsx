import type { Metadata } from "next"
import { CompanyJobsScreen } from "@/components/company/vagas/company-jobs-screen"
export default function Page() { return <CompanyJobsScreen /> }

export const metadata: Metadata = { title: "Vagas" }
