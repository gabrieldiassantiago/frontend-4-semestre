"use server"

import { apiFetch } from "@/lib/server/api"
import type { CreateEtapaDto, TipoEtapa } from "@/lib/types/etapa.types"

export async function getEtapasAction() {
  return apiFetch<TipoEtapa[]>("/etapas")
}

export async function getEtapasSistemaAction() {
  return apiFetch<TipoEtapa[]>("/etapas/default")
}

export async function createEtapaAction(dto: CreateEtapaDto) {
  return apiFetch<TipoEtapa>("/etapas", { method: "POST", body: dto })
}
