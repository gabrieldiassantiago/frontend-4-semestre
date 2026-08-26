"use client"

import { useCallback, useEffect, useState } from "react"
import { getVagasByEmpresa } from "@/lib/services/vagas.service"
import type { Vaga } from "@/lib/types/vaga.types"
import { useCompanyProfile } from "./useCompanyProfile"

interface UseCompanyVagasState {
  vagas: Vaga[]
  companyProfileId: string | null
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useCompanyVagas(): UseCompanyVagasState {
  const {
    profile,
    isLoading: profileLoading,
    error: profileError,
  } = useCompanyProfile()

  const [vagas, setVagas] = useState<Vaga[]>([])
  const [loadingVagas, setLoadingVagas] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchVagas = useCallback(async () => {
    if (!profile?.id) return

    setLoadingVagas(true)
    setError(null)

    try {
      const data = await getVagasByEmpresa(profile.id)
      setVagas(data)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erro ao carregar vagas da empresa."
      )
    } finally {
      setLoadingVagas(false)
    }
  }, [profile?.id])

  useEffect(() => {
    if (profile?.id) {
      void fetchVagas()
    }
  }, [profile?.id, fetchVagas])

  return {
    vagas,
    companyProfileId: profile?.id ?? null,
    loading: profileLoading || loadingVagas,
    error:
      error ||
      (profileError instanceof Error
        ? profileError.message
        : profileError
          ? "Erro ao carregar perfil da empresa."
          : null),
    refetch: fetchVagas,
  }
}