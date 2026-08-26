"use client"

import { useEffect, useState } from "react"
import { getVagaById } from "@/lib/services/vagas.service"
import type { Vaga } from "@/lib/types/vaga.types"

interface UseVagaState {
  vaga: Vaga | null
  loading: boolean
  error: string | null
}

/**
 * Hook para buscar os dados de uma vaga específica pelo ID.
 */
export function useVaga(id: string | null): UseVagaState {
  const [vaga, setVaga] = useState<Vaga | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setVaga(null)
      return
    }
    setLoading(true)
    setError(null)
    getVagaById(id)
      .then(setVaga)
      .catch((err) => setError(err instanceof Error ? err.message : "Erro ao carregar vaga."))
      .finally(() => setLoading(false))
  }, [id])

  return { vaga, loading, error }
}
