import type { Metadata } from "next"
import { MessagesScreen } from "@/components/shared/chat/messages-screen"

export const metadata: Metadata = {
  title: "Mensagens",
  description: "Conversas com as empresas sobre suas candidaturas",
}

export default async function MensagensPage({ searchParams }: { searchParams: Promise<{ chat?: string | string[] }> }) {
  const { chat } = await searchParams
  const activeId = typeof chat === "string" && chat ? chat : null
  return <MessagesScreen perspectiva="candidato" activeId={activeId} />
}
