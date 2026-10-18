"use client"

import { useState, type ReactNode } from "react"
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { isApiError } from "@/lib/errors"
import { isProtectedPath } from "@/lib/session"
import { SessionWatcher, redirectToLogin } from "./session-watcher"

function createQueryClient() {
  let redirecting = false

  // 401 numa tela protegida significa token vencido/recusado: volta para o login.
  function handleUnauthorized(error: unknown) {
    if (redirecting || typeof window === "undefined") return
    if (!isApiError(error, 401) || !isProtectedPath(window.location.pathname)) return
    redirecting = true
    redirectToLogin(client)
  }

  const client = new QueryClient({
    queryCache: new QueryCache({ onError: handleUnauthorized }),
    mutationCache: new MutationCache({ onError: handleUnauthorized }),
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          // 4xx é regra de negócio/autorização; repetir não muda o resultado.
          if (isApiError(error) && error.status >= 400 && error.status < 500) return false
          return failureCount < 2
        },
      },
      mutations: { retry: false },
    },
  })

  return client
}

export function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(createQueryClient)
  return (
    <QueryClientProvider client={client}>
      <SessionWatcher />
      {children}
    </QueryClientProvider>
  )
}
