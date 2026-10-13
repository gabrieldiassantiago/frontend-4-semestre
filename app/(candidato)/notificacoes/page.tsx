import type { Metadata } from "next"
import { NotificationsScreen } from "@/components/candidate/notifications/notifications-screen"

export const metadata: Metadata = {
  title: "Notificações",
  description: "Atualizações das suas candidaturas, mensagens das empresas e novas vagas",
}

export default function NotificacoesPage() {
  return <NotificationsScreen />
}
