import { ApiError } from "@/lib/errors"
import type {
  AvancarEtapaDto,
  Candidatura,
  CandidaturaDetalhe,
  CandidaturaFeedback,
  CandidaturaFilters,
  CreateCandidaturaDto,
  CreateFeedbackDto,
  DecidirCandidaturaDto,
  EtapaProcesso,
} from "@/lib/types/candidatura.types"
import { getAuthToken } from "./auth.service"

const API_BASE_URL = 'http://localhost:8080'

function getHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }
  const token = getAuthToken()
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  return headers
}

/**
 * Igual ao handleResponse dos outros serviços, mas preserva o status HTTP.
 * O fluxo de candidatura depende disso: 409 é regra de negócio (duplicada ou
 * vaga inativa) e merece uma mensagem específica, não um erro genérico.
 */
async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorMessage = "Ocorreu um erro na requisição."
    try {
      const errorData = await res.json()
      errorMessage = errorData.message || errorData.error || errorMessage
    } catch {
      // Corpo vazio ou não-JSON: mantém a mensagem padrão.
    }
    throw new ApiError(errorMessage, res.status)
  }

  const text = await res.text()
  return text ? (JSON.parse(text) as T) : ({} as T)
}

function buildQuery(params: Record<string, string | undefined>) {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") search.set(key, value)
  })
  const query = search.toString()
  return query ? `?${query}` : ""
}

// ── Candidato ──────────────────────────────────────────────────────────────

/**
 * Se candidatar a uma vaga.
 * POST /candidaturas
 * 409 = candidatura duplicada ou vaga inativa. 403 = usuário não é CANDIDATE.
 */
export async function criarCandidatura(dto: CreateCandidaturaDto): Promise<Candidatura> {
  const res = await fetch(`${API_BASE_URL}/candidaturas`, {
    method: "POST",
    headers: getHeaders(),
    credentials: "include",
    body: JSON.stringify(dto),
  })
  return handleResponse<Candidatura>(res)
}

/**
 * Minhas candidaturas.
 * GET /candidaturas/me
 */
export async function getMinhasCandidaturas(): Promise<Candidatura[]> {
  const res = await fetch(`${API_BASE_URL}/candidaturas/me`, {
    method: "GET",
    headers: getHeaders(),
    credentials: "include",
  })
  return handleResponse<Candidatura[]>(res)
}

/**
 * Acompanhamento: candidatura + timeline + feedbacks.
 * GET /candidaturas/:id
 */
export async function getCandidaturaDetalhe(id: string): Promise<CandidaturaDetalhe> {
  const res = await fetch(`${API_BASE_URL}/candidaturas/${id}`, {
    method: "GET",
    headers: getHeaders(),
    credentials: "include",
  })
  return handleResponse<CandidaturaDetalhe>(res)
}

/**
 * Feedbacks recebidos, opcionalmente de uma etapa específica.
 * GET /candidaturas/:id/feedbacks
 */
export async function getMeusFeedbacks(
  id: string,
  etapa?: EtapaProcesso,
): Promise<CandidaturaFeedback[]> {
  const res = await fetch(`${API_BASE_URL}/candidaturas/${id}/feedbacks${buildQuery({ etapa })}`, {
    method: "GET",
    headers: getHeaders(),
    credentials: "include",
  })
  return handleResponse<CandidaturaFeedback[]>(res)
}

/**
 * Desistir do processo. Não apaga nada: a candidatura vira CANCELADA.
 * DELETE /candidaturas/:id
 */
export async function desistirCandidatura(id: string): Promise<Candidatura> {
  const res = await fetch(`${API_BASE_URL}/candidaturas/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
    credentials: "include",
  })
  return handleResponse<Candidatura>(res)
}

// ── Empresa ────────────────────────────────────────────────────────────────

/**
 * Funil das vagas da empresa logada.
 * GET /empresa/candidaturas
 */
export async function getCandidaturasEmpresa(
  filters?: CandidaturaFilters,
): Promise<Candidatura[]> {
  const query = buildQuery({
    vagaId: filters?.vagaId,
    status: filters?.status,
    etapa: filters?.etapa,
    candidatoNome: filters?.candidatoNome,
  })
  const res = await fetch(`${API_BASE_URL}/empresa/candidaturas${query}`, {
    method: "GET",
    headers: getHeaders(),
    credentials: "include",
  })
  return handleResponse<Candidatura[]>(res)
}

/**
 * Candidatura completa do candidato (visão da empresa).
 * GET /empresa/candidaturas/:id
 */
export async function getCandidaturaEmpresaDetalhe(id: string): Promise<CandidaturaDetalhe> {
  const res = await fetch(`${API_BASE_URL}/empresa/candidaturas/${id}`, {
    method: "GET",
    headers: getHeaders(),
    credentials: "include",
  })
  return handleResponse<CandidaturaDetalhe>(res)
}

/**
 * Avançar de etapa. A etapa precisa ser posterior à atual.
 * PATCH /empresa/candidaturas/:id/etapa
 */
export async function avancarEtapa(id: string, dto: AvancarEtapaDto): Promise<Candidatura> {
  const res = await fetch(`${API_BASE_URL}/empresa/candidaturas/${id}/etapa`, {
    method: "PATCH",
    headers: getHeaders(),
    credentials: "include",
    body: JSON.stringify(dto),
  })
  return handleResponse<Candidatura>(res)
}

/**
 * Aprovar ou reprovar. APROVADA move a etapa para CONTRATACAO no backend.
 * PATCH /empresa/candidaturas/:id/status
 */
export async function decidirCandidatura(
  id: string,
  dto: DecidirCandidaturaDto,
): Promise<Candidatura> {
  const res = await fetch(`${API_BASE_URL}/empresa/candidaturas/${id}/status`, {
    method: "PATCH",
    headers: getHeaders(),
    credentials: "include",
    body: JSON.stringify(dto),
  })
  return handleResponse<Candidatura>(res)
}

/**
 * Criar feedback de uma etapa. Não pode ser de etapa futura.
 * POST /empresa/candidaturas/:id/feedbacks
 */
export async function criarFeedback(
  id: string,
  dto: CreateFeedbackDto,
): Promise<CandidaturaFeedback> {
  const res = await fetch(`${API_BASE_URL}/empresa/candidaturas/${id}/feedbacks`, {
    method: "POST",
    headers: getHeaders(),
    credentials: "include",
    body: JSON.stringify(dto),
  })
  return handleResponse<CandidaturaFeedback>(res)
}

/**
 * Feedbacks de uma candidatura (visão da empresa).
 * GET /empresa/candidaturas/:id/feedbacks
 */
export async function getFeedbacksEmpresa(
  id: string,
  etapa?: EtapaProcesso,
): Promise<CandidaturaFeedback[]> {
  const res = await fetch(
    `${API_BASE_URL}/empresa/candidaturas/${id}/feedbacks${buildQuery({ etapa })}`,
    {
      method: "GET",
      headers: getHeaders(),
      credentials: "include",
    },
  )
  return handleResponse<CandidaturaFeedback[]>(res)
}

/**
 * Editar feedback.
 * PUT /empresa/candidaturas/:id/feedbacks/:feedbackId
 */
export async function atualizarFeedback(
  id: string,
  feedbackId: string,
  dto: CreateFeedbackDto,
): Promise<CandidaturaFeedback> {
  const res = await fetch(`${API_BASE_URL}/empresa/candidaturas/${id}/feedbacks/${feedbackId}`, {
    method: "PUT",
    headers: getHeaders(),
    credentials: "include",
    body: JSON.stringify(dto),
  })
  return handleResponse<CandidaturaFeedback>(res)
}

/**
 * Remover feedback.
 * DELETE /empresa/candidaturas/:id/feedbacks/:feedbackId
 */
export async function removerFeedback(id: string, feedbackId: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/empresa/candidaturas/${id}/feedbacks/${feedbackId}`, {
    method: "DELETE",
    headers: getHeaders(),
    credentials: "include",
  })
  await handleResponse<void>(res)
}
