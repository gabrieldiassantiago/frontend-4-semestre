import { getAuthToken } from "@/lib/api"
import type {
  Vaga,
  CreateVagaDto,
  UpdateVagaDto,
  VagaFilters,
} from "@/lib/types/vaga.types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://projeto-para-processos-seletivos-mais.onrender.com"

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

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorMessage = "Ocorreu um erro na requisição."
    try {
      const errorData = await res.json()
      errorMessage = errorData.message || errorData.error || errorMessage
    } catch {
      // Ignore JSON parse error
    }
    throw new Error(errorMessage)
  }
  const text = await res.text()
  return text ? JSON.parse(text) : ({} as T)
}

/**
 * Busca todas as vagas, com filtros opcionais.
 * GET /vagas
 */
export async function getVagas(filters?: VagaFilters): Promise<Vaga[]> {
  const params = new URLSearchParams()
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.set(key, String(value))
      }
    })
  }
  const query = params.toString()
  const res = await fetch(`${API_BASE_URL}/vagas${query ? `?${query}` : ""}`, {
    method: "GET",
    headers: getHeaders(),
    credentials: "include",
  })
  return handleResponse<Vaga[]>(res)
}

/**
 * Busca uma vaga pelo ID.
 * GET /vagas/:id
 */
export async function getVagaById(id: string): Promise<Vaga> {
  const res = await fetch(`${API_BASE_URL}/vagas/${id}`, {
    method: "GET",
    headers: getHeaders(),
    credentials: "include",
  })
  return handleResponse<Vaga>(res)
}

/**
 * Busca todas as vagas de uma empresa específica.
 * GET /vagas/empresa/:companyProfileId
 */
export async function getVagasByEmpresa(companyProfileId: string): Promise<Vaga[]> {
  const res = await fetch(`${API_BASE_URL}/vagas/empresa/${companyProfileId}`, {
    method: "GET",
    headers: getHeaders(),
    credentials: "include",
  })
  return handleResponse<Vaga[]>(res)
}

/**
 * Cria uma nova vaga (requer autenticação de empresa).
 * POST /vagas
 */
export async function createVaga(dto: CreateVagaDto): Promise<Vaga> {
  const res = await fetch(`${API_BASE_URL}/vagas`, {
    method: "POST",
    headers: getHeaders(),
    credentials: "include",
    body: JSON.stringify(dto),
  })
  return handleResponse<Vaga>(res)
}

/**
 * Atualiza uma vaga existente (requer autenticação de empresa).
 * PUT /vagas/:id
 */
export async function updateVaga(id: string, dto: UpdateVagaDto): Promise<Vaga> {
  const res = await fetch(`${API_BASE_URL}/vagas/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    credentials: "include",
    body: JSON.stringify(dto),
  })
  return handleResponse<Vaga>(res)
}

/**
 * Remove permanentemente uma vaga (requer autenticação de empresa).
 * DELETE /vagas/:id
 */
export async function deleteVaga(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/vagas/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
    credentials: "include",
  })
  await handleResponse<void>(res)
}
