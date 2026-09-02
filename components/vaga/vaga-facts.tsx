import { Layers, MapPin, Users, Wallet } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/format"
import { cn } from "@/lib/utils"
import {
  CATEGORIA_LABELS,
  MODALIDADE_LABELS,
  NIVEL_LABELS,
  type Vaga,
} from "@/lib/types/vaga.types"

/**
 * "Plano de saúde, VR, Gympass" -> ["Plano de saúde", "VR", "Gympass"]
 */
export function parseBeneficios(value?: string | null): string[] {
  if (!value) return []
  return value
    .split(/[,;|\n\r]+/)
    .map((item) => item.replace(/^[-•*\s]+/, "").trim())
    .filter(Boolean)
}

/** Pílulas de qualificação da vaga: nível, modalidade e área. */
export function VagaTags({
  vaga,
  className,
  size = "md",
}: {
  vaga: Pick<Vaga, "nivelExperiencia" | "modalidade" | "categoria">
  className?: string
  size?: "sm" | "md"
}) {
  return (
    <ul className={cn("flex list-none flex-wrap gap-1.5", className)}>
      <li>
        <Badge variant="neutral" size={size}>
          {NIVEL_LABELS[vaga.nivelExperiencia]}
        </Badge>
      </li>
      <li>
        <Badge variant="neutral" size={size}>
          {MODALIDADE_LABELS[vaga.modalidade]}
        </Badge>
      </li>
      <li>
        <Badge variant="neutral" size={size}>
          {CATEGORIA_LABELS[vaga.categoria]}
        </Badge>
      </li>
    </ul>
  )
}

const TONES = {
  salary: "bg-info-subtle text-info",
  location: "bg-danger-subtle text-danger",
  area: "bg-success-subtle text-success",
  people: "bg-primary-subtle text-primary-subtle-foreground",
} as const

function Highlight({
  icon: Icon,
  tone,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  tone: keyof typeof TONES
  children: React.ReactNode
}) {
  return (
    <li className="flex items-center gap-2.5 text-sm text-strong-foreground">
      <span className={cn("grid size-6 shrink-0 place-items-center rounded-full", TONES[tone])}>
        <Icon className="size-3.5" />
      </span>
      <span className="min-w-0 truncate">{children}</span>
    </li>
  )
}

/**
 * Linhas de destaque (salário, local, área) com o ícone em chip colorido.
 */
export function VagaHighlights({
  vaga,
  applicants,
  className,
}: {
  vaga: Pick<Vaga, "salario" | "cidade" | "estado" | "categoria">
  applicants?: number
  className?: string
}) {
  return (
    <ul className={cn("flex list-none flex-col gap-2", className)}>
      <Highlight icon={Wallet} tone="salary">
        <span className="font-semibold text-foreground">{formatCurrency(vaga.salario)}</span>
        <span className="text-muted-foreground"> / mês</span>
      </Highlight>

      <Highlight icon={MapPin} tone="location">
        {vaga.cidade}, {vaga.estado}
      </Highlight>

      <Highlight icon={Layers} tone="area">
        {CATEGORIA_LABELS[vaga.categoria]}
      </Highlight>

      {typeof applicants === "number" && (
        <Highlight icon={Users} tone="people">
          {applicants} {applicants === 1 ? "pessoa se candidatou" : "pessoas se candidataram"}
        </Highlight>
      )}
    </ul>
  )
}

/** Lista de benefícios em pílulas. */
export function VagaBenefits({
  beneficios,
  className,
  limit,
}: {
  beneficios?: string | null
  className?: string
  limit?: number
}) {
  const items = parseBeneficios(beneficios)
  if (items.length === 0) return null

  const visible = limit ? items.slice(0, limit) : items
  const hidden = items.length - visible.length

  return (
    <ul className={cn("flex list-none flex-wrap gap-1.5", className)}>
      {visible.map((item) => (
        <li key={item}>
          <Badge variant="outline">{item}</Badge>
        </li>
      ))}
      {hidden > 0 && (
        <li>
          <Badge variant="outline">+{hidden}</Badge>
        </li>
      )}
    </ul>
  )
}
