import type { Metadata } from "next"
import { CompanyAppointmentsScreen } from "@/components/company/appointments/company-appointments-screen"

export const metadata: Metadata = {
  title: "Meus agendamentos",
  description: "Acompanhe as reuniões e entrevistas agendadas com candidatos.",
}

export default function Page() {
  return <CompanyAppointmentsScreen />
}
