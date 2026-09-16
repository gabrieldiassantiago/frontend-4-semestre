export interface GeocodingResult {
  latitude: number
  longitude: number
  placeName: string
  cidade: string
  estado: string
}

interface MapboxContext {
  id?: string
  short_code?: string
  text?: string
}

interface MapboxFeature {
  center?: [number, number]
  context?: MapboxContext[]
  id?: string
  place_name?: string
  place_type?: string[]
  text?: string
}

interface NominatimAddress {
  city?: string
  town?: string
  municipality?: string
  village?: string
  suburb?: string
  county?: string
  state?: string
  "ISO3166-2-lvl4"?: string
}

interface NominatimSearchResult {
  lat: string
  lon: string
  display_name?: string
  address?: NominatimAddress
}

const ESTADOS_BR: Record<string, string> = {
  acre: "AC",
  alagoas: "AL",
  amapá: "AP",
  amapa: "AP",
  amazonas: "AM",
  bahia: "BA",
  ceará: "CE",
  ceara: "CE",
  "distrito federal": "DF",
  "espírito santo": "ES",
  "espirito santo": "ES",
  goiás: "GO",
  goias: "GO",
  maranhão: "MA",
  maranhao: "MA",
  "mato grosso": "MT",
  "mato grosso do sul": "MS",
  "minas gerais": "MG",
  pará: "PA",
  para: "PA",
  paraíba: "PB",
  paraiba: "PB",
  paraná: "PR",
  parana: "PR",
  pernambuco: "PE",
  piauí: "PI",
  piaui: "PI",
  "rio de janeiro": "RJ",
  "rio grande do norte": "RN",
  "rio grande do sul": "RS",
  rondônia: "RO",
  rondonia: "RO",
  roraima: "RR",
  "santa catarina": "SC",
  "são paulo": "SP",
  "sao paulo": "SP",
  sergipe: "SE",
  tocantins: "TO",
}

function normalizeStateUf(rawState?: string): string {
  if (!rawState) return ""
  const trimmed = rawState.trim()
  if (trimmed.length === 2) return trimmed.toUpperCase()
  const lower = trimmed.toLowerCase()
  return ESTADOS_BR[lower] || trimmed.slice(0, 2).toUpperCase()
}

export async function searchAddress(query: string): Promise<GeocodingResult[]> {
  const trimmed = query.trim()
  if (!trimmed || trimmed.length < 3) return []

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

  if (mapboxToken) {
    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        trimmed
      )}.json?access_token=${mapboxToken}&country=BR&language=pt&types=address,place,locality,neighborhood,poi&limit=6`

      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data.features) && data.features.length > 0) {
          return data.features.map((feature: MapboxFeature) => {
            const [lng, lat] = feature.center ?? [0, 0]

            let cidade = ""
            let estado = ""

            if (feature.place_type?.includes("place")) {
              cidade = feature.text || ""
            }

            if (Array.isArray(feature.context)) {
              for (const ctx of feature.context) {
                if (ctx.id?.startsWith("region")) {
                  if (ctx.short_code && ctx.short_code.startsWith("BR-")) {
                    estado = ctx.short_code.replace("BR-", "").toUpperCase()
                  } else {
                    estado = normalizeStateUf(ctx.text)
                  }
                } else if (!cidade && (ctx.id?.startsWith("place") || ctx.id?.startsWith("locality"))) {
                  cidade = ctx.text || ""
                }
              }
            }

            return {
              latitude: Number(lat.toFixed(6)),
              longitude: Number(lng.toFixed(6)),
              placeName: feature.place_name || feature.text || trimmed,
              cidade: cidade || "Localidade",
              estado: estado || "UF",
            }
          })
        }
      }
    } catch (err) {
      console.warn("Mapbox geocoding error, falling back to OpenStreetMap Nominatim:", err)
    }
  }

  try {
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      trimmed
    )}&format=json&addressdetails=1&countrycodes=br&limit=6`

    const res = await fetch(nominatimUrl, {
      headers: {
        "User-Agent": "InterfaceEmpregos/1.0",
      },
    })

    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data)) {
        return data.map((item: NominatimSearchResult) => {
          const lat = parseFloat(item.lat)
          const lng = parseFloat(item.lon)
          const addr = item.address || {}

          const cidade =
            addr.city ||
            addr.town ||
            addr.municipality ||
            addr.village ||
            addr.suburb ||
            addr.county ||
            ""

          const isoState = addr["ISO3166-2-lvl4"]
          let estado = ""
          if (isoState && isoState.startsWith("BR-")) {
            estado = isoState.replace("BR-", "").toUpperCase()
          } else {
            estado = normalizeStateUf(addr.state)
          }

          return {
            latitude: Number(lat.toFixed(6)),
            longitude: Number(lng.toFixed(6)),
            placeName: item.display_name || trimmed,
            cidade: cidade || "Localidade",
            estado: estado || "UF",
          }
        })
      }
    }
  } catch (err) {
    console.error("Geocoding Nominatim fallback error:", err)
  }

  return []
}

export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<GeocodingResult | null> {
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

  if (mapboxToken) {
    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxToken}&language=pt&limit=1`
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        const feature = data.features?.[0]
        if (feature) {
          let cidade = ""
          let estado = ""

          if (feature.place_type?.includes("place")) {
            cidade = feature.text || ""
          }

          if (Array.isArray(feature.context)) {
            for (const ctx of feature.context) {
              if (ctx.id?.startsWith("region")) {
                if (ctx.short_code && ctx.short_code.startsWith("BR-")) {
                  estado = ctx.short_code.replace("BR-", "").toUpperCase()
                } else {
                  estado = normalizeStateUf(ctx.text)
                }
              } else if (!cidade && (ctx.id?.startsWith("place") || ctx.id?.startsWith("locality"))) {
                cidade = ctx.text || ""
              }
            }
          }

          return {
            latitude: Number(lat.toFixed(6)),
            longitude: Number(lng.toFixed(6)),
            placeName: feature.place_name || `${lat}, ${lng}`,
            cidade: cidade || "Localidade",
            estado: estado || "UF",
          }
        }
      }
    } catch (err) {
      console.warn("Reverse geocode Mapbox error, falling back to Nominatim:", err)
    }
  }

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`
    const res = await fetch(url, {
      headers: {
        "User-Agent": "InterfaceEmpregos/1.0",
      },
    })

    if (res.ok) {
      const item = await res.json()
      const addr = item.address || {}

      const cidade =
        addr.city ||
        addr.town ||
        addr.municipality ||
        addr.village ||
        addr.suburb ||
        addr.county ||
        ""

      const isoState = addr["ISO3166-2-lvl4"]
      let estado = ""
      if (isoState && isoState.startsWith("BR-")) {
        estado = isoState.replace("BR-", "").toUpperCase()
      } else {
        estado = normalizeStateUf(addr.state)
      }

      return {
        latitude: Number(lat.toFixed(6)),
        longitude: Number(lng.toFixed(6)),
        placeName: item.display_name || `${lat}, ${lng}`,
        cidade: cidade || "Localidade",
        estado: estado || "UF",
      }
    }
  } catch (err) {
    console.error("Reverse geocoding error:", err)
  }

  return null
}
