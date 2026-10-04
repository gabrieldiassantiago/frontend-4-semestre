import type { Metadata } from "next"
import { Briefcase, MessageSquare } from "lucide-react"
import { ComingSoonScreen } from "@/components/shared/coming-soon-screen"
import { ROUTES } from "@/lib/config/routes"

export const metadata: Metadata = {
  title: "Mensagens",
  description: "Central de mensagens do candidato",
}

export default function MensagensPage() {
  return (
    <ComingSoonScreen
      title="Mensagens"
      description="Converse com recrutadores e acompanhe os retornos dos seus processos."
      icon={MessageSquare}
      emptyTitle="Nenhuma conversa por aqui"
      emptyDescription="Quando um recrutador entrar em contato sobre uma candidatura, a conversa aparecerá nesta página."
      action={{ href: ROUTES.candidate.jobs, label: "Ver vagas abertas", icon: Briefcase }}
    />
  )
}
