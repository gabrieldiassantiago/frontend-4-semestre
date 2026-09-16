import { API_BASE_URL, getHeaders, handleResponse } from "@/lib/http/client"
import type {
  Vaga,
  CreateVagaDto,
  UpdateVagaDto,
  VagaFilters,
  VagaProximasParams,
} from "@/lib/types/vaga.types"

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
 * Busca vagas próximas a uma coordenada geográfica.
 * GET /vagas/proximas?latitude={lat}&longitude={lng}&raioKm={raio}
 */
export async function getVagasProximas(params: VagaProximasParams): Promise<Vaga[]> {
  const queryParams = new URLSearchParams()
  queryParams.set("latitude", String(params.latitude))
  queryParams.set("longitude", String(params.longitude))
  if (params.raioKm != null) {
    queryParams.set("raioKm", String(params.raioKm))
  }

  const res = await fetch(`${API_BASE_URL}/vagas/proximas?${queryParams.toString()}`, {
    method: "GET",
    headers: getHeaders(),
    credentials: "include",
  })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = await handleResponse<any>(res)
  if (Array.isArray(data)) return data
  if (data && Array.isArray(data.content)) return data.content
  if (data && Array.isArray(data.vagas)) return data.vagas
  return []
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
