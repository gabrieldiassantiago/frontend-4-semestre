"use client"

import { useMutation, useMutationState, useQuery, useQueryClient } from "@tanstack/react-query"
import { getPreferencesAction, savePreferencesAction } from "@/actions/preferences"
import { unwrap } from "@/lib/actions/result"
import { getErrorMessage } from "@/lib/errors"
import { toastError, toastSuccess } from "@/lib/toast"
import type { UserPreferences } from "@/lib/types/preferences"
import { queryKeys } from "./keys"

type Change = { key: keyof UserPreferences; checked: boolean; label: string }

const preferencesKey = queryKeys.preferences.me()

export function usePreferences() {
  const client = useQueryClient()
  const query = useQuery({
    queryKey: preferencesKey,
    queryFn: async () => unwrap(await getPreferencesAction()),
  })

  const update = useMutation({
    mutationKey: preferencesKey,
    scope: { id: "update-user-preferences" },
    mutationFn: async ({ key, checked }: Change) => {
      await client.cancelQueries({ queryKey: preferencesKey })
      const current = client.getQueryData<UserPreferences>(preferencesKey)
      if (!current) throw new Error("Recarregue as preferências para tentar novamente.")
      return unwrap(await savePreferencesAction({ ...current, [key]: checked }))
    },
    onSuccess: (preferences, change) => {
      client.setQueryData(preferencesKey, preferences)
      if (change.key === "personalizedJobs") {
        void client.invalidateQueries({ queryKey: queryKeys.vagas.all })
      }
      toastSuccess(`Preferência salva · ${change.label}`)
    },
    onError: async (error, change) => {
      toastError(`Falha ao salvar “${change.label}”. ${getErrorMessage(error, "Tente novamente.")}`)
      await client.invalidateQueries({ queryKey: preferencesKey })
    },
  })

  const pending = useMutationState({
    filters: { mutationKey: preferencesKey, status: "pending" },
    select: mutation => mutation.state.variables as Change,
  })
  const preferences = query.data && { ...query.data }
  if (preferences) {
    for (const change of pending) preferences[change.key] = change.checked
  }

  return {
    preferences,
    loading: query.isPending,
    error: getErrorMessage(query.error, "Não foi possível carregar suas preferências."),
    refetch: query.refetch,
    pending,
    update: update.mutate,
  }
}
