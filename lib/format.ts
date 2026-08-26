/** Helpers de formatação compartilhados pelas telas. */

/** "Ana Paula Souza" -> "AP" */
export function getInitials(name?: string | null, fallback = "?") {
  if (!name?.trim()) return fallback
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
}

/** Data legível em pt-BR. Retorna "" para valores inválidos. */
export function formatDate(value?: string | Date | null, options?: Intl.DateTimeFormatOptions) {
  if (!value) return ""
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return date.toLocaleDateString("pt-BR", options ?? { day: "2-digit", month: "short", year: "numeric" })
}

/** Tempo relativo curto: "hoje", "há 3 dias", "há 2 meses". */
export function formatRelativeDate(value?: string | Date | null) {
  if (!value) return ""
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ""

  const days = Math.floor((Date.now() - date.getTime()) / 86_400_000)
  if (days <= 0) return "hoje"
  if (days === 1) return "ontem"
  if (days < 30) return `há ${days} dias`
  const months = Math.floor(days / 30)
  if (months < 12) return `há ${months} ${months === 1 ? "mês" : "meses"}`
  const years = Math.floor(months / 12)
  return `há ${years} ${years === 1 ? "ano" : "anos"}`
}

/** Valor em BRL sem centavos. */
export function formatCurrency(value?: number | null) {
  if (value == null || Number.isNaN(value)) return ""
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  })
}
