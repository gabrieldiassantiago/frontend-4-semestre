"use client"

import { useState, useEffect, useRef, useTransition } from "react"
import { MapPin, Search, Navigation, Loader2, X, AlertCircle } from "lucide-react"
import { searchAddress, reverseGeocode, type GeocodingResult } from "@/lib/services/geocoding.service"
import { hasCompanyLocation } from "@/lib/utils/company-location"

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
  inputId?: string
  label?: string
  placeholder?: string
  onClear?: () => void
  requireCityAndState?: boolean
  showCoordinates?: boolean
}

export function AddressAutocomplete({
  onSelectLocation,
  initialCity = "",
  initialState = "",
  initialCoords = null,
  error,
  disabled = false,
  inputId,
  label = "Buscar endereço da vaga",
  placeholder = "Digite o endereço ou local da vaga (ex: Av. Paulista, São Paulo)",
  onClear,
  requireCityAndState = false,
  showCoordinates = true,
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
  const requestRef = useRef(0)
  const initialLatitude = initialCoords?.latitude
  const initialLongitude = initialCoords?.longitude

  // Inicializa com dados recebidos se houver
  useEffect(() => {
    if (initialLatitude != null && initialLongitude != null && (initialCity || initialState)) {
      setSelectedResult({
        latitude: initialLatitude,
        longitude: initialLongitude,
        cidade: initialCity,
        estado: initialState,
        placeName: `${initialCity}${initialState ? ` - ${initialState}` : ""}`,
      })
    } else {
      setSelectedResult(null)
    }
  }, [initialLatitude, initialLongitude, initialCity, initialState])

  useEffect(() => () => {
    requestRef.current += 1
    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current)
  }, [])

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
    const request = ++requestRef.current
    setQuery(val)
    setResults([])
    setIsOpen(false)
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
        const found = await searchAddress(val)
        if (request !== requestRef.current) return
        const items = requireCityAndState ? found.filter((item) => hasCompanyLocation({ city: item.cidade, state: item.estado, latitude: item.latitude, longitude: item.longitude })) : found
        startTransition(() => {
          setResults(items)
          setIsOpen(items.length > 0)
          setIsSearching(false)
          if (items.length === 0) setLocationError("Nenhum local encontrado. Tente a cidade e o estado ou um endereço mais completo.")
        })
      } catch {
        if (request !== requestRef.current) return
        setIsSearching(false)
        setLocationError("Não foi possível buscar agora. Tente novamente.")
      }
    }, 350)
  }

  const handleSelect = (item: GeocodingResult) => {
    if (requireCityAndState && !hasCompanyLocation({ city: item.cidade, state: item.estado, latitude: item.latitude, longitude: item.longitude })) {
      setLocationError("Não foi possível confirmar cidade e estado. Busque e selecione outro resultado.")
      return
    }
    requestRef.current += 1
    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current)
    setIsSearching(false)
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
    requestRef.current += 1
    setSelectedResult(null)
    setQuery("")
    setResults([])
    setIsOpen(false)
    onClear?.()
  }

  return (
    <div className="space-y-3" ref={containerRef}>
      {selectedResult ? (
        <div className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary-subtle/40 p-3.5 transition-colors">
          <div className="flex min-w-0 items-start gap-3">
            <div className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
              <MapPin className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-strong-foreground">
                {selectedResult.cidade} - {selectedResult.estado}
              </p>
              <p className="text-xs text-muted-foreground line-clamp-1">
                {selectedResult.placeName}
              </p>
              {showCoordinates && <div className="mt-1 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded bg-surface px-1.5 py-0.5 text-[11px] font-medium text-subtle-foreground border border-border">
                  <span className="size-1.5 rounded-full bg-success inline-block" />
                  Lat: {selectedResult.latitude.toFixed(4)}, Lng: {selectedResult.longitude.toFixed(4)}
                </span>
              </div>}
            </div>
          </div>

          <button
            type="button"
            onClick={handleClearSelected}
            disabled={disabled}
            className="flex min-h-11 shrink-0 items-center gap-1 text-xs font-semibold text-primary hover:underline px-2 py-1"
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
              id={inputId}
              type="text"
              value={query}
              disabled={disabled || isLocating}
              onChange={(e) => handleInputChange(e.target.value)}
              onFocus={() => {
                if (results.length > 0) setIsOpen(true)
              }}
              placeholder={placeholder}
              aria-label={label}
              autoComplete="off"
              onKeyDown={(event) => { if (event.key === "Enter") event.preventDefault(); if (event.key === "Escape") setIsOpen(false) }}
              className="field-input pl-10 pr-24 text-base"
            />

            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={disabled || isLocating}
              title="Detectar minha localização"
              className="absolute right-1 top-1/2 min-h-11 -translate-y-1/2 inline-flex items-center gap-1 rounded-lg bg-surface border border-border px-2.5 py-1 text-xs font-semibold text-strong-foreground hover:bg-muted transition-colors disabled:opacity-50"
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
              aria-label="Resultados da busca de localização"
              className="relative z-30 max-h-60 w-full overflow-y-auto rounded-xl border border-border bg-card p-1 shadow-overlay"
            >
              {results.map((item, idx) => (
                <li key={`${item.latitude}-${item.longitude}-${idx}`}>
                  <button
                    type="button"
                    onClick={() => handleSelect(item)}
                    disabled={disabled || isLocating}
                    className="flex min-h-11 w-full items-start gap-2.5 rounded-lg px-3 py-2 text-left transition-colors hover:bg-primary-subtle hover:text-primary-subtle-foreground"
                  >
                    <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-strong-foreground">
                          {item.cidade} - {item.estado}
                        </span>
                        {showCoordinates && <span className="shrink-0 text-[11px] text-muted-foreground">
                          {item.latitude.toFixed(2)}, {item.longitude.toFixed(2)}
                        </span>}
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
