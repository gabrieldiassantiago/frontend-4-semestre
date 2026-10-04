"use server"

import { apiFetch } from "@/lib/server/api"
import { fail, type ActionResult } from "@/lib/actions/result"
import type { CompanyProfile, UpdateCompanyProfileDto } from "@/lib/types/company.types"

export async function getCompanyProfileMeAction(): Promise<ActionResult<CompanyProfile>> {
  return apiFetch<CompanyProfile>("/company-profile/me")
}

export async function updateCompanyProfileMeAction(dto: UpdateCompanyProfileDto): Promise<ActionResult<CompanyProfile>> {
  return apiFetch<CompanyProfile>("/company-profile/me", { method: "PUT", body: dto })
}

export async function uploadCompanyLogoAction(formData: FormData): Promise<ActionResult<CompanyProfile>> {
  const file = formData.get("file")
  if (!(file instanceof File) || file.size === 0) return fail("Selecione uma imagem não vazia.", 400)
  if (file.size > 2 * 1024 * 1024) return fail("A imagem deve ter no máximo 2 MB.", 400)
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return fail("Envie uma imagem JPEG, PNG ou WebP.", 400)
  const body = new FormData()
  body.set("file", file)
  return apiFetch<CompanyProfile>("/company-profile/me/logo", { method: "POST", body })
}

export async function deleteCompanyLogoAction(): Promise<ActionResult<CompanyProfile>> {
  return apiFetch<CompanyProfile>("/company-profile/me/logo", { method: "DELETE" })
}
