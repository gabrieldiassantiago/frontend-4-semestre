/**
 * Utilitários para cálculo e formatação de distâncias geográficas.
 */

/**
 * Calcula a distância em quilômetros entre duas coordenadas usando a fórmula de Haversine.
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (
    lat1 == null ||
    lon1 == null ||
    lat2 == null ||
    lon2 == null ||
    Number.isNaN(lat1) ||
    Number.isNaN(lon1) ||
    Number.isNaN(lat2) ||
    Number.isNaN(lon2)
  ) {
    return 0
  }

  const R = 6371 // Raio da Terra em km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * Formata uma distância em km para exibição amigável em pt-BR.
 * Ex: 0.4 -> "400 m", 3.24 -> "3,2 km", 15.6 -> "16 km"
 */
export function formatDistance(km?: number | null): string {
  if (km == null || Number.isNaN(km)) return ""

  if (km < 1) {
    const meters = Math.max(10, Math.round(km * 1000))
    return `${meters} m`
  }

  if (km < 10) {
    return `${km.toLocaleString("pt-BR", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    })} km`
  }

  return `${Math.round(km).toLocaleString("pt-BR")} km`
}
