import type { Metadata } from "next"
import { Settings, UserRound } from "lucide-react"
import { ComingSoonScreen } from "@/components/shared/coming-soon-screen"
import { ROUTES } from "@/lib/config/routes"

export const metadata: Metadata = {
  title: "Configurações",
  description: "Configurações da sua conta",
}

export default function ConfiguracoesPage() {
  return (
    <ComingSoonScreen
      title="Configurações"
      description="Preferências de e-mail, privacidade, segurança e dados de acesso."
      icon={Settings}
      emptyTitle="Configurações em breve"
      emptyDescription="Enquanto isso, você pode atualizar seus dados pessoais e profissionais diretamente no seu perfil."
      action={{ href: ROUTES.candidate.profile, label: "Ir para meu perfil", icon: UserRound }}
    />
  )
}
