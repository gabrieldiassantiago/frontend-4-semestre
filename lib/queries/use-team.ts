"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createTeamMemberAction, getTeamAction, removeTeamMemberAction, updateTeamMemberAction } from "@/actions/team"
import { unwrap } from "@/lib/actions/result"
import { getErrorMessage } from "@/lib/errors"
import { toastSuccess } from "@/lib/toast"
import { queryKeys } from "./keys"
import type { CreateTeamMemberDto, UpdateTeamMemberDto } from "@/lib/types/team.types"

export function useTeam() {
  const query = useQuery({
    queryKey: queryKeys.team.all,
    queryFn: async () => unwrap(await getTeamAction()),
  })

  return {
    team: query.data ?? null,
    isLoading: query.isPending,
    error: query.error ? getErrorMessage(query.error, "Erro ao carregar a equipe.") : null,
    refetch: query.refetch,
  }
}

function useInvalidateTeam() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.team.all })
}

export function useCreateTeamMember() {
  const invalidate = useInvalidateTeam()
  return useMutation({
    mutationFn: async (dto: CreateTeamMemberDto) => unwrap(await createTeamMemberAction(dto)),
    onSuccess: (member) => {
      void invalidate()
      toastSuccess(`${member.name} agora tem acesso à empresa.`)
    },
  })
}

export function useUpdateTeamMember() {
  const invalidate = useInvalidateTeam()
  return useMutation({
    mutationFn: async ({ memberId, dto }: { memberId: string; dto: UpdateTeamMemberDto }) =>
      unwrap(await updateTeamMemberAction(memberId, dto)),
    onSuccess: () => {
      void invalidate()
      toastSuccess("Acesso atualizado.")
    },
  })
}

export function useRemoveTeamMember() {
  const invalidate = useInvalidateTeam()
  return useMutation({
    mutationFn: async (memberId: string) => unwrap(await removeTeamMemberAction(memberId)),
    onSuccess: () => {
      void invalidate()
      toastSuccess("Membro removido da equipe.")
    },
  })
}
