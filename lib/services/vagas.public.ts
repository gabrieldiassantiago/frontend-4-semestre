import "server-only"
import type { Vaga } from "@/lib/types/vaga.types"

import { API_BASE_URL } from "@/lib/http/config"

// Public metadata uses anonymous requests and a short server cache.
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
