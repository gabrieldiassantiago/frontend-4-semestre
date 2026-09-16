"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import { AlertCircle, Check, Loader2, LocateFixed, MapPin, Search, X } from "lucide-react"
import { reverseGeocode, searchAddress, type GeocodingResult } from "@/lib/services/geocoding.service"

type CityAutocompleteProps = {
  city?: string
  state?: string
  disabled?: boolean
  onChange: (location: { city?: string; state?: string }) => void
}

function formatLocation(city?: string, state?: string) {
  if (city && state) return `${city}, ${state}`
  return city || state || ""
}

function parseManualLocation(value: string, currentState?: string) {
  const match = value.trim().match(/^(.+?)(?:\s*[-,]\s*|\s+)([A-Za-z]{2})$/)
  if (!match) return { city: value, state: currentState }

  return {
    city: match[1].trim(),
    state: match[2].toUpperCase(),
  }
}

export function CityAutocomplete({ city = "", state = "", disabled, onChange }: CityAutocompleteProps) {
  const [query, setQuery] = useState(formatLocation(city, state))
  const [results, setResults] = useState<GeocodingResult[]>([])
  const [open, setOpen] = useState(false)
  const [searching, setSearching] = useState(false)
  const [locating, setLocating] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [, startTransition] = useTransition()
  const wrapperRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setQuery(formatLocation(city, state))
  }, [city, state])

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false)
    }

    document.addEventListener("mousedown", closeOnOutsideClick)
    return () => document.removeEventListener("mousedown", closeOnOutsideClick)
  }, [])

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  function selectLocation(item: GeocodingResult) {
    setQuery(formatLocation(item.cidade, item.estado))
    setResults([])
    setOpen(false)
    setMessage(null)
    onChange({ city: item.cidade, state: item.estado })
  }

  function updateQuery(value: string) {
    setQuery(value)
    setMessage(null)
    onChange(parseManualLocation(value, state))

    if (debounceRef.current) clearTimeout(debounceRef.current)

    const trimmed = value.trim()
    if (trimmed.length < 3) {
      setResults([])
      setOpen(false)
      setSearching(false)
      return
    }

    setSearching(true)
    debounceRef.current = setTimeout(async () => {
      try {
        const matches = await searchAddress(trimmed)
        startTransition(() => {
          setResults(matches)
          setOpen(matches.length > 0)
          setSearching(false)
        })
      } catch {
        setResults([])
        setOpen(false)
        setSearching(false)
        setMessage("Não consegui buscar cidades agora. Você ainda pode preencher manualmente.")
      }
    }, 320)
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setMessage("Seu navegador não permite detectar localização.")
      return
    }

    setLocating(true)
    setMessage(null)

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const location = await reverseGeocode(coords.latitude, coords.longitude)
          if (location) {
            selectLocation(location)
          } else {
            setMessage("Não consegui identificar sua cidade. Busque pelo nome dela.")
          }
        } catch {
          setMessage("Não consegui identificar sua cidade. Busque pelo nome dela.")
        } finally {
          setLocating(false)
        }
      },
      () => {
        setLocating(false)
        setMessage("Não foi possível acessar sua localização.")
      },
      { enableHighAccuracy: false, maximumAge: 300000, timeout: 8000 },
    )
  }

  function clearLocation() {
    setQuery("")
    setResults([])
    setOpen(false)
    setMessage(null)
    onChange({ city: "", state: "" })
  }

  const hasLocation = Boolean(city || state)

  return (
    <div ref={wrapperRef} className="space-y-2">
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-subtle-foreground">
          {searching ? <Loader2 className="size-4 animate-spin text-primary" /> : <Search className="size-4" />}
        </span>
        <input
          value={query}
          disabled={disabled}
          onChange={(event) => updateQuery(event.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          className="field-input pr-[116px] pl-11"
          placeholder="Busque sua cidade"
          aria-label="Buscar cidade"
          autoComplete="address-level2"
        />
        <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
          {hasLocation && (
            <button
              type="button"
              onClick={clearLocation}
              disabled={disabled}
              className="grid size-9 place-items-center rounded-lg text-subtle-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Limpar localização"
            >
              <X className="size-4" />
            </button>
          )}
          <button
            type="button"
            onClick={useCurrentLocation}
            disabled={disabled || locating}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 text-xs font-semibold text-strong-foreground transition-colors hover:bg-muted disabled:opacity-50"
          >
            {locating ? <Loader2 className="size-3.5 animate-spin text-primary" /> : <LocateFixed className="size-3.5 text-primary" />}
            <span className="hidden sm:inline">{locating ? "Buscando" : "Atual"}</span>
          </button>
        </div>

        {open && (
          <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 overflow-hidden rounded-xl border border-border bg-card shadow-overlay">
            <ul role="listbox" className="max-h-64 overflow-y-auto p-1">
              {results.map((item) => (
                <li key={`${item.latitude}-${item.longitude}-${item.placeName}`}>
                  <button
                    type="button"
                    onClick={() => selectLocation(item)}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors hover:bg-muted"
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary-subtle text-primary">
                      <MapPin className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-strong-foreground">
                        {item.cidade} - {item.estado}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">{item.placeName}</span>
                    </span>
                    {city === item.cidade && state === item.estado && <Check className="size-4 text-primary" />}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {state && (
        <p className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
          <MapPin className="size-3.5" />
          {formatLocation(city, state)}
        </p>
      )}

      {message && (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <AlertCircle className="size-3.5 text-primary" />
          {message}
        </p>
      )}
    </div>
  )
}
