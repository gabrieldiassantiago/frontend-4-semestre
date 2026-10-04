import type { Metadata } from "next"
import { Bell, Briefcase } from "lucide-react"
import { ComingSoonScreen } from "@/components/shared/coming-soon-screen"
import { ROUTES } from "@/lib/config/routes"

export const metadata: Metadata = {
  title: "Notificações",
  description: "Notificações e avisos da sua conta",
}

export default function NotificacoesPage() {
  return (
    <ComingSoonScreen
      title="Notificações"
      description="Alertas sobre suas candidaturas e novas vagas compatíveis com você."
      icon={Bell}
      emptyTitle="Você está em dia"
      emptyDescription="Atualizações de etapas, feedbacks e alertas de vagas serão listados aqui assim que acontecerem."
      action={{ href: ROUTES.candidate.jobs, label: "Explorar oportunidades", icon: Briefcase }}
    />
  )
}
