"use client"

import { useEffect, useState } from "react"
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  createVagaAction,
  deleteVagaAction,
  getVagaByIdAction,
  getVagasAction,
  getVagasByEmpresaAction,
  getVagasProximasAction,
  updateVagaAction,
} from "@/actions/vagas"
import { unwrap } from "@/lib/actions/result"
import { getErrorMessage } from "@/lib/errors"
import { toastSuccess } from "@/lib/toast"
import { queryKeys } from "./keys"
import { useCompanyProfile } from "./use-company-profile"
import type { CreateVagaDto, UpdateVagaDto, VagaFilters, VagaProximasParams } from "@/lib/types/vaga.types"

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    if (delayMs <= 0) {
      setDebounced(value)
      return
    }
    const timeout = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timeout)
  }, [value, delayMs])
  return debounced
}

/** Lista pública de vagas com filtros; a busca é debounced para não disparar a cada tecla. */
export function useVagas(filters?: VagaFilters, options?: { debounceMs?: number }) {
  const filtersKey = JSON.stringify(filters ?? {})
  const debouncedKey = useDebouncedValue(filtersKey, options?.debounceMs ?? 400)
  const debouncedFilters = JSON.parse(debouncedKey) as VagaFilters

  const query = useQuery({
    queryKey: queryKeys.vagas.list(debouncedFilters),
    queryFn: async () => unwrap(await getVagasAction(debouncedFilters)),
    placeholderData: keepPreviousData,
  })

  const result = query.data
  return {
    vagas: result?.vagas ?? [],
    totalPages: result?.totalPages ?? 1,
    totalElements: result?.totalElements ?? 0,
    loading: query.isPending || debouncedKey !== filtersKey,
    error: query.error ? getErrorMessage(query.error, "Erro ao carregar vagas.") : null,
    refetch: query.refetch,
  }
}

export function useVaga(id: string | null) {
  const query = useQuery({
    queryKey: queryKeys.vagas.detail(id ?? ""),
    queryFn: async () => unwrap(await getVagaByIdAction(id as string)),
    enabled: Boolean(id),
  })
  return {
    vaga: query.data ?? null,
    loading: Boolean(id) && query.isPending,
    error: query.error ? getErrorMessage(query.error, "Erro ao carregar vaga.") : null,
    refetch: query.refetch,
  }
}

/** Vagas da empresa logada — depende do perfil para descobrir o `companyProfileId`. */
export function useCompanyVagas() {
  const { profile, isLoading: profileLoading, error: profileError } = useCompanyProfile()
  const companyProfileId = profile?.id ?? null

  const query = useQuery({
    queryKey: queryKeys.vagas.byEmpresa(companyProfileId ?? ""),
    queryFn: async () => unwrap(await getVagasByEmpresaAction(companyProfileId as string)),
    enabled: Boolean(companyProfileId),
  })

  return {
    vagas: query.data ?? [],
    companyProfileId,
    loading: profileLoading || (Boolean(companyProfileId) && query.isPending),
    error: query.error ? getErrorMessage(query.error, "Erro ao carregar vagas da empresa.") : profileError,
    refetch: query.refetch,
  }
}

/** Vagas próximas de uma coordenada; só roda depois que o candidato autoriza a geolocalização. */
export function useVagasProximas(params: VagaProximasParams | null) {
  const query = useQuery({
    queryKey: queryKeys.vagas.proximas(params),
    queryFn: async () => unwrap(await getVagasProximasAction(params as VagaProximasParams)),
    enabled: Boolean(params),
  })
  return {
    vagas: params ? (query.data ?? null) : null,
    loading: Boolean(params) && query.isPending,
    error: query.error ? getErrorMessage(query.error, "Erro ao carregar vagas próximas.") : null,
    refetch: query.refetch,
  }
}

function useInvalidateVagas() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.vagas.all })
}

export function useCreateVaga() {
  const invalidate = useInvalidateVagas()
  return useMutation({
    mutationFn: async (dto: CreateVagaDto) => unwrap(await createVagaAction(dto)),
    onSuccess: () => {
      toastSuccess("Vaga publicada com sucesso!")
      void invalidate()
    },
  })
}

export function useUpdateVaga(options?: { silent?: boolean }) {
  const invalidate = useInvalidateVagas()
  return useMutation({
    mutationFn: async ({ id, dto }: { id: string; dto: UpdateVagaDto }) => unwrap(await updateVagaAction(id, dto)),
    onSuccess: () => {
      if (!options?.silent) toastSuccess("Alterações da vaga salvas!")
      void invalidate()
    },
  })
}

export function useDeleteVaga() {
  const invalidate = useInvalidateVagas()
  return useMutation({
    mutationFn: async (id: string) => unwrap(await deleteVagaAction(id)),
    onSuccess: () => {
      toastSuccess("Vaga excluída!")
      void invalidate()
    },
  })
}
