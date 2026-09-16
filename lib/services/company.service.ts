import { apiRequest } from "@/lib/http/client"
import type { CompanyProfile, UpdateCompanyProfileDto } from "@/lib/types/company.types"

export async function getCompanyProfileMe(): Promise<CompanyProfile> {
  return apiRequest<CompanyProfile>(`/company-profile/me`, {
    method: "GET",
  })
}

export async function updateCompanyProfileMe(dto: UpdateCompanyProfileDto): Promise<CompanyProfile> {
  return apiRequest<CompanyProfile>(`/company-profile/me`, {
    method: "PUT",
    body: JSON.stringify(dto),
  })
}
