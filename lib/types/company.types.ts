export interface CompanyProfile {
  id: string
  userId: string
  companyName?: string
  cnpj?: string
  description?: string
  industry?: string
  website?: string
  city?: string
  state?: string
  latitude?: number
  longitude?: number
  logoUrl?: string
  createdAt?: string
  updatedAt?: string
}

export interface UpdateCompanyProfileDto {
  companyName?: string
  cnpj?: string
  description?: string
  industry?: string
  website?: string
  city?: string
  state?: string
  latitude?: number
  longitude?: number
}
