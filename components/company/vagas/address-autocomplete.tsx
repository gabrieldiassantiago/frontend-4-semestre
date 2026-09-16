"use client"

import { useState, useEffect, useRef, useTransition } from "react"
import { MapPin, Search, CheckCircle2, Navigation, Loader2, X, AlertCircle } from "lucide-react"
import { searchAddress, reverseGeocode, type GeocodingResult } from "@/lib/services/geocoding.service"

interface AddressAutocompleteProps {
  onSelectLocation: (loc: {
    latitude: number
    longitude: number
    cidade: string
    estado: string
    address?: string
  }) => void
  initialCity?: string
  initialState?: string
  initialCoords?: { latitude: number; longitude: number } | null
  error?: string
  disabled?: boolean
}

export function AddressAutocomplete({
  onSelectLocation,
  initialCity = "",
  initialState = "",
  initialCoords = null,
  error,
  disabled = false,
}: AddressAutocompleteProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<GeocodingResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [isLocating, setIsLocating] = useState(false)
  const [selectedResult, setSelectedResult] = useState<GeocodingResult | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)

  const [, startTransition] = useTransition()
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Inicializa com dados recebidos se houver
  useEffect(() => {
    if (initialCoords && (initialCity || initialState)) {
      setSelectedResult({
        latitude: initialCoords.latitude,
        longitude: initialCoords.longitude,
        cidade: initialCity,
        estado: initialState,
        placeName: `${initialCity}${initialState ? ` - ${initialState}` : ""}`,
      })
    }
  }, [initialCoords, initialCity, initialState])

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleInputChange = (val: string) => {
    setQuery(val)
    setLocationError(null)

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }

    if (val.trim().length < 3) {
      setResults([])
      setIsOpen(false)
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    debounceTimeoutRef.current = setTimeout(async () => {
      try {
        const items = await searchAddress(val)
        startTransition(() => {
          setResults(items)
          setIsOpen(items.length > 0)
          setIsSearching(false)
        })
      } catch {
        setIsSearching(false)
      }
    }, 350)
  }

  const handleSelect = (item: GeocodingResult) => {
    setSelectedResult(item)
    setQuery("")
    setIsOpen(false)
    setResults([])
    setLocationError(null)
    onSelectLocation({
      latitude: item.latitude,
      longitude: item.longitude,
      cidade: item.cidade,
      estado: item.estado,
      address: item.placeName,
    })
  }

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocalização não é suportada por este navegador.")
      return
    }

    setIsLocating(true)
    setLocationError(null)

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        try {
          const res = await reverseGeocode(latitude, longitude)
          const finalResult: GeocodingResult = res || {
            latitude: Number(latitude.toFixed(6)),
            longitude: Number(longitude.toFixed(6)),
            cidade: initialCity || "Minha Localização",
            estado: initialState || "BR",
            placeName: `Coordenadas: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
          }
          handleSelect(finalResult)
        } catch {
          setLocationError("Não foi possível identificar o endereço exato das coordenadas.")
        } finally {
          setIsLocating(false)
        }
      },
      (err) => {
        setIsLocating(false)
        if (err.code === err.PERMISSION_DENIED) {
          setLocationError("Permissão de localização negada pelo navegador.")
        } else {
          setLocationError("Falha ao obter localização atual.")
        }
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
    )
  }

  const handleClearSelected = () => {
    setSelectedResult(null)
    setQuery("")
  }

  return (
    <div className="space-y-3" ref={containerRef}>
      {selectedResult ? (
        <div className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary-subtle/40 p-3.5 transition-colors">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
              <MapPin className="size-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-strong-foreground">
                {selectedResult.cidade} - {selectedResult.estado}
              </p>
              <p className="text-xs text-muted-foreground line-clamp-1">
                {selectedResult.placeName}
              </p>
              <div className="mt-1 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded bg-surface px-1.5 py-0.5 text-[11px] font-medium text-subtle-foreground border border-border">
                  <span className="size-1.5 rounded-full bg-success inline-block" />
                  Lat: {selectedResult.latitude.toFixed(4)}, Lng: {selectedResult.longitude.toFixed(4)}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClearSelected}
            disabled={disabled}
            className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline px-2 py-1"
          >
            <X className="size-3.5" />
            Alterar
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="relative">
            <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-subtle-foreground">
              {isSearching ? (
                <Loader2 className="size-4 animate-spin text-primary" />
              ) : (
                <Search className="size-4" />
              )}
            </div>
            <input
              type="text"
              value={query}
              disabled={disabled}
              onChange={(e) => handleInputChange(e.target.value)}
              onFocus={() => {
                if (results.length > 0) setIsOpen(true)
              }}
              placeholder="Digite o endereço ou local da vaga (ex: Av. Paulista, São Paulo)"
              aria-label="Buscar endereço da vaga"
              className="field-input pl-10 pr-24"
            />

            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={disabled || isLocating}
              title="Detectar minha localização"
              className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 rounded-lg bg-surface border border-border px-2.5 py-1 text-xs font-semibold text-strong-foreground hover:bg-muted transition-colors disabled:opacity-50"
            >
              {isLocating ? (
                <Loader2 className="size-3.5 animate-spin text-primary" />
              ) : (
                <Navigation className="size-3.5 text-primary" />
              )}
              <span>GPS</span>
            </button>
          </div>

          {locationError && (
            <p className="flex items-center gap-1.5 text-xs text-danger">
              <AlertCircle className="size-3.5" />
              {locationError}
            </p>
          )}

          {isOpen && results.length > 0 && (
            <ul
              role="listbox"
              className="relative z-30 max-h-60 w-full overflow-y-auto rounded-xl border border-border bg-card p-1 shadow-overlay"
            >
              {results.map((item, idx) => (
                <li key={`${item.latitude}-${item.longitude}-${idx}`}>
                  <button
                    type="button"
                    onClick={() => handleSelect(item)}
                    className="flex w-full items-start gap-2.5 rounded-lg px-3 py-2 text-left transition-colors hover:bg-primary-subtle hover:text-primary-subtle-foreground"
                  >
                    <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-strong-foreground">
                          {item.cidade} - {item.estado}
                        </span>
                        <span className="shrink-0 text-[11px] text-muted-foreground">
                          {item.latitude.toFixed(2)}, {item.longitude.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{item.placeName}</p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {error && !selectedResult && (
        <p className="text-xs font-medium text-danger">{error}</p>
      )}
    </div>
  )
}
