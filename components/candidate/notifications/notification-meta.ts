import { Briefcase, FileText, MessageCircle, type LucideIcon } from "lucide-react"
import { ROUTES } from "@/lib/config/routes"
import type { Notificacao, TipoNotificacao } from "@/lib/types/notificacao.types"

type TipoMeta = {
  label: string
  icon: LucideIcon
  /** Classes do ícone em superfícies claras. */
  tone: string
  href: string
}

export const TIPO_META: Record<TipoNotificacao, TipoMeta> = {
  CANDIDATURA: {
    label: "Candidatura",
    icon: FileText,
    tone: "bg-primary-subtle text-primary-subtle-foreground",
    href: ROUTES.candidate.applications,
  },
  CHAT: {
    label: "Mensagem",
    icon: MessageCircle,
    tone: "bg-info-subtle text-info",
    href: ROUTES.candidate.messages,
  },
  VAGAS: {
    label: "Vaga",
    icon: Briefcase,
    tone: "bg-success-subtle text-success-foreground",
    href: ROUTES.candidate.jobs,
  },
}

export function getTipoMeta(type: string): TipoMeta {
  return TIPO_META[type as TipoNotificacao] ?? TIPO_META.CANDIDATURA
}

export function formatNotificacaoTempo(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""

  const minutes = Math.floor((Date.now() - date.getTime()) / 60_000)
  if (minutes < 1) return "agora"
  if (minutes < 60) return `${minutes} min`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} h`

  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} ${days === 1 ? "dia" : "dias"}`

  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
}

const GRUPOS = ["Hoje", "Ontem", "Últimos 7 dias", "Anteriores"] as const

function grupoDe(value: string): (typeof GRUPOS)[number] {
  const date = new Date(value)
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const dia = new Date(date)
  dia.setHours(0, 0, 0, 0)
  const dias = Math.round((hoje.getTime() - dia.getTime()) / 86_400_000)

  if (dias <= 0) return "Hoje"
  if (dias === 1) return "Ontem"
  if (dias < 7) return "Últimos 7 dias"
  return "Anteriores"
}

/** Agrupa por recência mantendo a ordem cronológica de cada grupo. */
export function agruparPorData(notificacoes: Notificacao[]) {
  const grupos = new Map<string, Notificacao[]>()
  notificacoes.forEach((notificacao) => {
    const grupo = grupoDe(notificacao.createdAt)
    grupos.set(grupo, [...(grupos.get(grupo) ?? []), notificacao])
  })
  return GRUPOS.filter((grupo) => grupos.has(grupo)).map((grupo) => ({ label: grupo, itens: grupos.get(grupo)! }))
}
