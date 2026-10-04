"use client"

import { useCallback } from "react"
import { useRouter } from "next/navigation"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  getCurrentUserAction,
  loginAction,
  logoutAction,
  registerCompanyAction,
  registerUserAction,
  resendCodeAction,
  verifyEmailAction,
} from "@/actions/auth"
import { unwrap } from "@/lib/actions/result"
import { toastSuccess } from "@/lib/toast"
import type {
  CompanyRegistrationPayload,
  LoginPayload,
  RegisterPayload,
  ResendCodePayload,
  VerifyEmailPayload,
} from "@/lib/types/auth.types"

export function useLogin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: LoginPayload) => unwrap(await loginAction(payload)),
    onSuccess: () => {
      // Dados de outra sessão não podem vazar para a conta que acabou de entrar.
      queryClient.clear()
      toastSuccess("Você entrou na sua conta!")
    },
  })
}

export function useCurrentUser() {
  const query = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => unwrap(await getCurrentUserAction()),
  })

  return {
    user: query.data ?? null,
    loading: query.isPending,
    error: query.error ?? null,
  }
}

export function useRegisterUser() {
  return useMutation({
    mutationFn: async (payload: RegisterPayload) => unwrap(await registerUserAction(payload)),
    onSuccess: () => toastSuccess("Conta criada! Confirme seu e-mail."),
  })
}

export function useRegisterCompany() {
  return useMutation({
    mutationFn: async (payload: CompanyRegistrationPayload) => unwrap(await registerCompanyAction(payload)),
    onSuccess: () => toastSuccess("Cadastro da empresa realizado!"),
  })
}

export function useVerifyEmail() {
  return useMutation({
    mutationFn: async (payload: VerifyEmailPayload) => unwrap(await verifyEmailAction(payload)),
    onSuccess: () => toastSuccess("E-mail confirmado!"),
  })
}

export function useResendCode() {
  return useMutation({
    mutationFn: async (payload: ResendCodePayload) => unwrap(await resendCodeAction(payload)),
    onSuccess: () => toastSuccess("Novo código enviado ao seu e-mail."),
  })
}

export function useLogout(redirectTo: string) {
  const router = useRouter()
  const queryClient = useQueryClient()

  return useCallback(async () => {
    await logoutAction()
    queryClient.clear()
    toastSuccess("Você saiu da sua conta.")
    router.push(redirectTo)
    router.refresh()
  }, [router, redirectTo, queryClient])
}
