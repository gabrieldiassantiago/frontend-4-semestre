const states = new Set(["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"])

export function hasCompanyLocation(value: { city?: string; state?: string; latitude?: number; longitude?: number }) {
  return Boolean(value.city?.trim() && !["Localidade", "Minha Localização"].includes(value.city.trim())
    && states.has(value.state ?? "")
    && typeof value.latitude === "number" && Number.isFinite(value.latitude) && Math.abs(value.latitude) <= 90
    && typeof value.longitude === "number" && Number.isFinite(value.longitude) && Math.abs(value.longitude) <= 180)
}
