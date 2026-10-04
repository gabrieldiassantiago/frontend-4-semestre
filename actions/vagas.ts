"use server"

import { apiFetch, buildQuery } from "@/lib/server/api"
import { ok, type ActionResult } from "@/lib/actions/result"
import type { CreateVagaDto, UpdateVagaDto, Vaga, VagaFilters, VagaProximasParams } from "@/lib/types/vaga.types"

export interface GetVagasResult {
  vagas: Vaga[]
  totalPages: number
  totalElements: number
}

export async function getVagasAction(filters?: VagaFilters): Promise<ActionResult<GetVagasResult>> {
  const query = buildQuery((filters ?? {}) as Record<string, string | number | boolean | undefined>)
  const result = await apiFetch<unknown>(`/vagas${query}`)
  if (!result.ok) return result as ActionResult<GetVagasResult>
  const data = result.data as any
  if (Array.isArray(data)) {
    const pageSize = filters?.size ?? 10
    const totalPages = Math.max(1, Math.ceil(data.length / pageSize))
    return ok({ vagas: data, totalPages, totalElements: data.length })
  }
  if (data && Array.isArray(data.content)) {
    return ok({
      vagas: data.content,
      totalPages: typeof data.totalPages === "number" ? data.totalPages : 1,
      totalElements: typeof data.totalElements === "number" ? data.totalElements : data.content.length,
    })
  }
  if (data && Array.isArray(data.vagas)) {
    return ok({
      vagas: data.vagas,
      totalPages: typeof data.totalPages === "number" ? data.totalPages : 1,
      totalElements: typeof data.totalElements === "number" ? data.totalElements : data.vagas.length,
    })
  }
  return ok({ vagas: [], totalPages: 1, totalElements: 0 })
}

export async function recordSearchMetadataAction(input: {
  query?: string
  searchTag: string
  metadataJson: string
}): Promise<ActionResult<void>> {
  return apiFetch<void>("/vagas/search-metadata", { method: "POST", body: input })
}

/** GET /vagas/proximas — o backend pode responder lista pura ou página (`content`/`vagas`). */
export async function getVagasProximasAction(params: VagaProximasParams): Promise<ActionResult<Vaga[]>> {
  const query = buildQuery({ latitude: params.latitude, longitude: params.longitude, raioKm: params.raioKm })
  const result = await apiFetch<unknown>(`/vagas/proximas${query}`)
  if (!result.ok) return result
  const data = result.data as Vaga[] | { content?: Vaga[]; vagas?: Vaga[] } | null
  if (Array.isArray(data)) return ok(data)
  if (data && Array.isArray(data.content)) return ok(data.content)
  if (data && Array.isArray(data.vagas)) return ok(data.vagas)
  return ok([])
}

export async function getVagaByIdAction(id: string): Promise<ActionResult<Vaga>> {
  return apiFetch<Vaga>(`/vagas/${encodeURIComponent(id)}`)
}

export async function getVagasByEmpresaAction(companyProfileId: string): Promise<ActionResult<Vaga[]>> {
  return apiFetch<Vaga[]>(`/vagas/empresa/${encodeURIComponent(companyProfileId)}`)
}

export async function createVagaAction(dto: CreateVagaDto): Promise<ActionResult<Vaga>> {
  return apiFetch<Vaga>("/vagas", { method: "POST", body: dto })
}

export async function updateVagaAction(id: string, dto: UpdateVagaDto): Promise<ActionResult<Vaga>> {
  return apiFetch<Vaga>(`/vagas/${encodeURIComponent(id)}`, { method: "PUT", body: dto })
}

export async function deleteVagaAction(id: string): Promise<ActionResult<void>> {
  return apiFetch<void>(`/vagas/${encodeURIComponent(id)}`, { method: "DELETE" })
}
