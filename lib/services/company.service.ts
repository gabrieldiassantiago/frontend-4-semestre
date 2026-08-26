/**
 * Re-exports das funções de perfil de empresa do api.ts central.
 */
export { getCompanyProfileMe, updateCompanyProfileMe } from "@/lib/api"

export type {
  CompanyProfile,
  UpdateCompanyProfileDto,
} from "@/lib/api"
