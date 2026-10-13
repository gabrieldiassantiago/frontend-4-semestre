import type { Metadata } from "next"
import { MessagesScreen } from "@/components/shared/chat/messages-screen"

export const metadata: Metadata = {
  title: "Mensagens",
  description: "Conversas com candidatos sobre os processos seletivos",
}

export default async function EmpresaMensagensPage({ searchParams }: { searchParams: Promise<{ chat?: string | string[] }> }) {
  const { chat } = await searchParams
  const activeId = typeof chat === "string" && chat ? chat : null
  return <MessagesScreen perspectiva="empresa" activeId={activeId} />
}
