"use client"

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import {
  createTeamMemberAction,
  getTeamAction,
  removeTeamMemberAction,
  updateTeamMemberAction,
} from "@/actions/team"
import { unwrap } from "@/lib/actions/result"
import { getErrorMessage } from "@/lib/errors"
import { toastSuccess } from "@/lib/toast"
import { queryKeys } from "./keys"
import {
  mapCompanyMembersApi,
  type CompanyMembersApiDto,
  type CreateTeamMemberDto,
  type TeamResponse,
  type UpdateTeamMemberDto,
} from "@/lib/types/team.types"

export function useTeam() {
  const query = useQuery<
    CompanyMembersApiDto,
    Error,
    TeamResponse
  >({
    queryKey: queryKeys.team.all,
    queryFn: async () => {
      const response = await getTeamAction()
      const data = unwrap(response)

      if (!data) {
        throw new Error("Não foi possível carregar a equipe.")
      }

      return data
    },
    select: mapCompanyMembersApi,
  })

  return {
    team: query.data ?? null,
    isLoading: query.isPending,
    error: query.error
      ? getErrorMessage(query.error, "Erro ao carregar a equipe.")
      : null,
    refetch: query.refetch,
  }
}

function useInvalidateTeam() {
  const queryClient = useQueryClient()

  return () =>
    queryClient.invalidateQueries({
      queryKey: queryKeys.team.all,
    })
}

export function useCreateTeamMember() {
  const invalidate = useInvalidateTeam()

  return useMutation({
    mutationFn: async (dto: CreateTeamMemberDto) =>
      unwrap(await createTeamMemberAction(dto)),
    onSuccess: (member) => {
      void invalidate()
      toastSuccess(`${member.name} agora tem acesso à empresa.`)
    },
  })
}

export function useUpdateTeamMember() {
  const invalidate = useInvalidateTeam()

  return useMutation({
    mutationFn: async ({
      userId,
      dto,
    }: {
      userId: string
      dto: UpdateTeamMemberDto
    }) => unwrap(await updateTeamMemberAction(userId, dto)),
    onSuccess: () => {
      void invalidate()
      toastSuccess("Acesso atualizado.")
    },
  })
}

export function useRemoveTeamMember() {
  const invalidate = useInvalidateTeam()

  return useMutation({
    mutationFn: async (userId: string) =>
      unwrap(await removeTeamMemberAction(userId)),
    onSuccess: () => {
      void invalidate()
      toastSuccess("Membro removido da equipe.")
    },
  })
}
