import { etapasDaVaga } from "@/lib/types/candidatura.types"
import type { Candidatura } from "@/lib/types/candidatura.types"
import type { Vaga } from "@/lib/types/vaga.types"

const DAY = 24 * 60 * 60 * 1000

function timeOf(value?: string) {
  const time = value ? new Date(value).getTime() : Number.NaN
  return Number.isNaN(time) ? null : time
}

export type WeekBucket = { label: string; period: string; vagas: number; candidaturas: number }

const shortDate = (date: Date) => date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })

/** Contagem semanal pela data de criação, terminando na semana atual. */
export function weeklyBuckets(vagas: Vaga[], candidaturas: Candidatura[], weeks: number): WeekBucket[] {
  const end = new Date()
  end.setHours(24, 0, 0, 0)
  return Array.from({ length: weeks }, (_, index) => {
    const start = new Date(end.getTime() - (weeks - index) * 7 * DAY)
    const until = new Date(start.getTime() + 7 * DAY)
    const last = new Date(until.getTime() - DAY)
    const count = (items: { createdAt?: string }[]) =>
      items.filter((item) => {
        const time = timeOf(item.createdAt)
        return time !== null && time >= start.getTime() && time < until.getTime()
      }).length
    return {
      label: shortDate(start),
      period: `${shortDate(start)} a ${shortDate(last)}`,
      vagas: count(vagas),
      candidaturas: count(candidaturas),
    }
  })
}

/** Itens criados nos últimos `days` dias e no período imediatamente anterior. */
export function periodComparison(items: { createdAt?: string }[], days = 7) {
  const now = Date.now()
  let current = 0
  let previous = 0
  for (const item of items) {
    const time = timeOf(item.createdAt)
    if (time === null) continue
    const age = now - time
    if (age < days * DAY) current++
    else if (age < days * 2 * DAY) previous++
  }
  const delta = previous === 0 ? (current > 0 ? null : 0) : Math.round(((current - previous) / previous) * 100)
  return { current, previous, delta }
}

export function isAwaitingReview(item: Candidatura) {
  return item.status === "EM_ANDAMENTO" && etapasDaVaga(item.etapasVaga).indexOf(item.etapaAtual) === 0
}

export function daysSince(value?: string) {
  const time = timeOf(value)
  return time === null ? null : Math.floor((Date.now() - time) / DAY)
}
