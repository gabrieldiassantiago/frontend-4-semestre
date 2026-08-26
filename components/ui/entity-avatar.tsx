import { cn } from "@/lib/utils"
import { getInitials } from "@/lib/format"

/**
 * Avatar de iniciais determinístico para empresas e pessoas.
 * A cor é derivada do nome, então a mesma entidade tem sempre a mesma cor.
 * Usa apenas tons da paleta do produto (violeta + neutros + estados).
 */
const TONES = [
  "bg-primary-subtle text-primary-subtle-foreground",
  "bg-success-subtle text-success-foreground",
  "bg-info-subtle text-info",
  "bg-warning-subtle text-warning-foreground",
  "bg-muted text-strong-foreground",
] as const

const SIZES = {
  sm: "size-9 rounded-lg text-[11px]",
  md: "size-11 rounded-xl text-sm",
  lg: "size-14 rounded-2xl text-base",
} as const

export function EntityAvatar({
  name,
  size = "md",
  className,
}: {
  name?: string | null
  size?: keyof typeof SIZES
  className?: string
}) {
  const label = name?.trim() || "Empresa"
  const hash = Array.from(label).reduce((acc, char) => acc + char.charCodeAt(0), 0)

  return (
    <span
      aria-hidden
      className={cn(
        "grid shrink-0 place-items-center font-bold",
        SIZES[size],
        TONES[hash % TONES.length],
        className,
      )}
    >
      {getInitials(label, "?")}
    </span>
  )
}
