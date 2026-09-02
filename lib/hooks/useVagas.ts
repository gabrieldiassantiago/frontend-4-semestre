"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { getVagas } from "@/lib/services/vagas.service"
import type { Vaga, VagaFilters } from "@/lib/types/vaga.types"

interface UseVagasState {
  vagas: Vaga[]
  loading: boolean
  error: string | null
  refetch: () => void
}

interface UseVagasOptions {
  /** Delay do debounce em ms (padrão: 400ms). Use 0 para desativar. */
  debounceMs?: number
}

export function useVagas(
  filters?: VagaFilters,
  options?: UseVagasOptions
): UseVagasState {
  const debounceMs = options?.debounceMs ?? 400

  const [vagas, setVagas] = useState<Vaga[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const filtersKey = JSON.stringify(filters ?? {})

  const requestIdRef = useRef(0)

  const fetchVagas = useCallback(async () => {
    const currentRequestId = ++requestIdRef.current
    setLoading(true)
    setError(null)
    try {
      const data = await getVagas(filters)
      if (currentRequestId === requestIdRef.current) {
        setVagas(data)
      }
    } catch (err) {
      if (currentRequestId === requestIdRef.current) {
        setError(err instanceof Error ? err.message : "Erro ao carregar vagas.")
      }
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setLoading(false)
      }
    }
  }, [filtersKey])

  useEffect(() => {
    if (debounceMs <= 0) {
      void fetchVagas()
      return
    }

    const timeoutId = setTimeout(() => {
      void fetchVagas()
    }, debounceMs)

    return () => clearTimeout(timeoutId)
  }, [fetchVagas, debounceMs])

  const refetch = useCallback(() => {
    void fetchVagas()
  }, [fetchVagas])

  return { vagas, loading, error, refetch }
}