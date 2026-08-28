import "server-only"
import type { Vaga } from "@/lib/types/vaga.types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://projeto-para-processos-seletivos-mais.onrender.com"

/**
 * Busca uma vaga no servidor, sem depender do token do navegador.
 *
 * A página pública de vaga precisa renderizar no servidor (para metadata e
 * compartilhamento), então ela não pode usar `vagas.service.ts`, que lê o
 * token do `localStorage`. Retorna `null` em qualquer falha para que a página
 * possa cair no `notFound()` em vez de estourar.
 */
export async function getVagaPublic(id: string): Promise<Vaga | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/vagas/${encodeURIComponent(id)}`, {
      headers: { Accept: "application/json" },
      // Links compartilhados são lidos muitas vezes: cacheia por 1 minuto.
      next: { revalidate: 60 },
    })

    if (!res.ok) return null

    const vaga = (await res.json()) as Vaga
    return vaga?.id ? vaga : null
  } catch {
    return null
  }
}
