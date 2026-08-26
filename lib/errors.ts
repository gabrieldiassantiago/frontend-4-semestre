/**
 * Erro de requisição que carrega o status HTTP.
 * Necessário porque o módulo de candidatura trata 409 (duplicada / vaga
 * inativa) e 404 (não é sua) com mensagens diferentes de um erro genérico.
 */
export class ApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

export function isApiError(error: unknown, status?: number): error is ApiError {
  if (!(error instanceof ApiError)) return false
  return status === undefined || error.status === status
}

/**
 * Extrai uma mensagem legível de um erro desconhecido.
 * Antes estava duplicado em auth-screen, verify-email-screen e company-registration-form.
 */
export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message

  if (typeof error === "object" && error !== null) {
    const payload = error as {
      response?: { data?: { message?: unknown } }
      message?: unknown
    }

    const apiMessage = payload.response?.data?.message
    if (typeof apiMessage === "string" && apiMessage) return apiMessage
    if (Array.isArray(apiMessage) && typeof apiMessage[0] === "string") return apiMessage[0]

    if (typeof payload.message === "string" && payload.message) return payload.message
  }

  if (typeof error === "string" && error) return error

  return fallback
}
