import type { Metadata } from "next"
import { SettingsScreen } from "@/components/candidate/settings/settings-screen"

export const metadata: Metadata = {
  title: "Configurações",
  description: "Configurações da sua conta",
}

export default function ConfiguracoesPage() {
  return <SettingsScreen />
}
