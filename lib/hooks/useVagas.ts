"use client"

import { useCallback, useEffect, useState } from "react"
import { getVagas } from "@/lib/services/vagas.service"
import type { Vaga, VagaFilters } from "@/lib/types/vaga.types"

interface UseVagasState {
  vagas: Vaga[]
  loading: boolean
  error: string | null
  refetch: () => void
}

/**
 * Hook para listar vagas com filtros opcionais.
 * Refetch automático quando os filtros mudam.
 */
export function useVagas(filters?: VagaFilters): UseVagasState {
  const [vagas, setVagas] = useState<Vaga[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Serialize filters to a stable string for the effect dependency
  const filtersKey = JSON.stringify(filters ?? {})

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getVagas(filters)
      setVagas(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar vagas.")
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey])

  useEffect(() => {
    void fetch()
  }, [fetch])

  return { vagas, loading, error, refetch: fetch }
}
