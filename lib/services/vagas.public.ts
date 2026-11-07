import "server-only"
import { normalizarProcesso } from "@/lib/utils/processo"
import type { Vaga } from "@/lib/types/vaga.types"
import type { LandingJob } from "@/lib/data/landing"
import { formatCurrency, formatRelativeDate } from "@/lib/format"
import { MODALIDADE_LABELS } from "@/lib/types/vaga.types"

import { API_BASE_URL } from "@/lib/http/config"

export async function getVagaPublic(id: string): Promise<Vaga | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/vagas/${encodeURIComponent(id)}`, {
      headers: { Accept: "application/json" }
    })

    if (!res.ok) return null

    const vaga = normalizarProcesso((await res.json()) as Vaga)
    return vaga?.id ? vaga : null
  } catch {
    return null
  }
}

/**
 * Vagas recentes para a landing. Aceita lista pura ou página (`content`/`vagas`),
 * como o restante do app, e devolve [] em qualquer falha (a página usa um fallback).
 */
export async function getLatestVagasPublic(limit = 6): Promise<LandingJob[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/vagas?size=${limit}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 300 },
    })
    if (!res.ok) return []

    const data = (await res.json()) as Vaga[] | { content?: Vaga[]; vagas?: Vaga[] }
    const list = Array.isArray(data) ? data : (data.content ?? data.vagas ?? [])

    return list
      .filter((v) => v.ativa !== false)
      .slice(0, limit)
      .map((v) => ({
        id: v.id,
        titulo: v.titulo,
        empresa: v.nomeEmpresa ?? "Empresa confidencial",
        categoria: v.categoria,
        local: [v.cidade, v.estado].filter(Boolean).join(", "),
        modalidade: MODALIDADE_LABELS[v.modalidade] ?? "",
        salario: v.salario ? formatCurrency(v.salario) : "A combinar",
        resumo: v.descricao.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 220),
        quando: formatRelativeDate(v.createdAt) || "recente",
      }))
  } catch {
    return []
  }
}
