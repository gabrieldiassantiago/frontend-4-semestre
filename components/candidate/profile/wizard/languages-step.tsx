"use client"

import { useState } from "react"
import { Check, Languages, Plus, X } from "lucide-react"
import { cn } from "@/lib/utils"

export type LanguageLevel = "basico" | "intermediario" | "avancado" | "fluente"

export interface LanguageDraft {
  id: string
  name: string
  level: LanguageLevel
}

export const LANGUAGE_LEVELS: { id: LanguageLevel; label: string; hint: string }[] = [
  { id: "basico", label: "Básico", hint: "Entendo frases simples" },
  { id: "intermediario", label: "Intermediário", hint: "Converso sobre o dia a dia" },
  { id: "avancado", label: "Avançado", hint: "Uso no trabalho com segurança" },
  { id: "fluente", label: "Fluente / Nativo", hint: "Domínio total" },
]

const POPULAR = ["Inglês", "Espanhol", "Francês", "Alemão", "Italiano", "Libras", "Mandarim"]

export function LanguagesStep({
  items,
  onChange,
}: {
  items: LanguageDraft[]
  onChange: (items: LanguageDraft[]) => void
}) {
  const [custom, setCustom] = useState("")
  const taken = new Set(items.map((item) => item.name.toLowerCase()))

  function add(name: string) {
    const value = name.trim()
    if (!value || taken.has(value.toLowerCase())) return
    onChange([...items, { id: crypto.randomUUID(), name: value, level: "intermediario" }])
    setCustom("")
  }

  const update = (id: string, level: LanguageLevel) =>
    onChange(items.map((item) => (item.id === id ? { ...item, level } : item)))

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div>
        <p className="text-sm font-semibold text-strong-foreground">Escolha um idioma</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {POPULAR.map((name) => {
            const selected = taken.has(name.toLowerCase())
            return (
              <button
                key={name}
                type="button"
                disabled={selected}
                onClick={() => add(name)}
                className={cn(
                  "inline-flex min-h-10 items-center gap-1.5 rounded-full border px-4 text-sm font-semibold transition-colors",
                  selected
                    ? "border-primary bg-primary-subtle text-primary-subtle-foreground"
                    : "border-border bg-card text-strong-foreground hover:border-primary hover:text-primary",
                )}
              >
                {selected ? <Check className="size-3.5" aria-hidden /> : <Plus className="size-3.5" aria-hidden />}
                {name}
              </button>
            )
          })}
        </div>

        <form
          className="mt-3 flex gap-2"
          onSubmit={(event) => {
            event.preventDefault()
            add(custom)
          }}
        >
          <label className="sr-only" htmlFor="custom-language">
            Outro idioma
          </label>
          <input
            id="custom-language"
            className="field-input"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            placeholder="Outro idioma (ex.: Japonês)"
            maxLength={40}
          />
          <button type="submit" className="btn-secondary min-h-11 shrink-0 px-4" disabled={!custom.trim()}>
            Adicionar
          </button>
        </form>
      </div>

      {items.length === 0 ? (
        <div className="flex items-center gap-3 rounded-2xl border border-dashed border-border-strong bg-surface px-5 py-6">
          <Languages className="size-5 shrink-0 text-subtle-foreground" aria-hidden />
          <p className="text-sm text-muted-foreground">
            Nenhum idioma adicionado. Pode pular se preferir, você pode voltar aqui depois.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3" aria-label="Idiomas adicionados">
          {items.map((item) => (
            <li key={item.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-xl bg-primary-subtle text-primary-subtle-foreground">
                    <Languages className="size-4" aria-hidden />
                  </span>
                  <p className="text-sm font-bold text-foreground">{item.name}</p>
                </div>
                <button
                  type="button"
                  aria-label={`Remover ${item.name}`}
                  onClick={() => onChange(items.filter((i) => i.id !== item.id))}
                  className="grid size-9 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-danger-foreground"
                >
                  <X className="size-4" aria-hidden />
                </button>
              </div>

              <div role="radiogroup" aria-label={`Nível de ${item.name}`} className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {LANGUAGE_LEVELS.map((level) => {
                  const active = item.level === level.id
                  return (
                    <button
                      key={level.id}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => update(item.id, level.id)}
                      className={cn(
                        "flex min-h-14 flex-col items-start justify-center rounded-xl border px-3 py-2 text-left transition-colors",
                        active
                          ? "border-primary bg-primary-subtle text-primary-subtle-foreground"
                          : "border-border bg-background text-muted-foreground hover:border-border-strong",
                      )}
                    >
                      <span className="text-xs font-bold">{level.label}</span>
                      <span className="mt-0.5 text-[11px] leading-tight opacity-80">{level.hint}</span>
                    </button>
                  )
                })}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
