"use client"

import { useState } from "react"
import { Plus, Wand2, X } from "lucide-react"
import { BENEFIT_CATALOG } from "@/lib/data/benefits-catalog"
import { Chip, QuestionHeader } from "../primitives"
import { isEnterSubmit } from "../steps"
import type { StepProps } from "../types"

export const ESSENTIAL_BENEFITS = [
  "Plano de Saúde (Bradesco/Amil/Unimed)",
  "Vale Refeição (VR / Swile / Caju / Flash)",
  "Auxílio Home Office (R$ Luz/Internet)",
  "Horário 100% Flexível",
]

const CATALOG_LABELS = new Set(BENEFIT_CATALOG.flatMap((group) => group.items.map((item) => item.label)))

export function StepBeneficios({ draft, update }: StepProps) {
  const [custom, setCustom] = useState("")
  const selected = draft.beneficios

  const toggle = (label: string) =>
    update({
      beneficios: selected.includes(label)
        ? selected.filter((item) => item !== label)
        : [...selected, label],
    })

  const addCustom = () => {
    const value = custom.trim()
    if (!value) return
    if (!selected.includes(value)) update({ beneficios: [...selected, value] })
    setCustom("")
  }

  const applyEssentials = () =>
    update({ beneficios: Array.from(new Set([...selected, ...ESSENTIAL_BENEFITS])) })

  const customBenefits = selected.filter((label) => !CATALOG_LABELS.has(label))

  return (
    <div>
      <QuestionHeader stepId="beneficios" />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-surface p-3 pl-4">
        <p className="text-sm text-strong-foreground" aria-live="polite">
          <strong className="font-bold tabular-nums text-foreground">{selected.length}</strong>{" "}
          {selected.length === 1 ? "benefício selecionado" : "benefícios selecionados"}
        </p>
        <div className="flex gap-2">
          {selected.length > 0 && (
            <button
              type="button"
              onClick={() => update({ beneficios: [] })}
              className="rounded-lg px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Limpar
            </button>
          )}
          <button
            type="button"
            onClick={applyEssentials}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-strong-foreground transition-colors hover:bg-muted"
          >
            <Wand2 className="size-3.5 text-primary" aria-hidden />
            Pacote essencial
          </button>
        </div>
      </div>

      <div className="space-y-7">
        {BENEFIT_CATALOG.map((group) => {
          const count = group.items.filter((item) => selected.includes(item.label)).length
          return (
            <fieldset key={group.title}>
              <legend className="mb-3 flex items-center gap-2 text-sm font-semibold text-strong-foreground">
                <group.icon className="size-4 text-primary" aria-hidden />
                {group.title}
                {count > 0 && (
                  <span className="rounded-full bg-primary-subtle px-2 py-0.5 text-[11px] font-bold tabular-nums text-primary-subtle-foreground">
                    {count}
                  </span>
                )}
              </legend>
              <div className="flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <Chip
                    key={item.id}
                    selected={selected.includes(item.label)}
                    onClick={() => toggle(item.label)}
                  >
                    {item.label}
                  </Chip>
                ))}
              </div>
            </fieldset>
          )
        })}

        <div className="rounded-panel border border-dashed border-border-strong p-5">
          <label htmlFor="beneficio-custom" className="text-sm font-semibold text-strong-foreground">
            Benefício exclusivo da sua empresa
          </label>
          <div className="mt-3 flex gap-2">
            <input
              id="beneficio-custom"
              type="text"
              value={custom}
              onChange={(event) => setCustom(event.target.value)}
              onKeyDown={(event) => {
                if (isEnterSubmit(event)) {
                  event.preventDefault()
                  event.stopPropagation()
                  addCustom()
                }
              }}
              placeholder="Ex: Day off no aniversário"
              className="field-input flex-1"
            />
            <button
              type="button"
              onClick={addCustom}
              disabled={!custom.trim()}
              aria-label="Adicionar benefício"
              className="grid size-12 shrink-0 place-items-center rounded-xl bg-foreground text-background transition-all hover:opacity-90 active:scale-95 disabled:opacity-30"
            >
              <Plus className="size-4" aria-hidden />
            </button>
          </div>

          {customBenefits.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-2">
              {customBenefits.map((label) => (
                <li key={label}>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-primary bg-primary-subtle py-1.5 pl-3.5 pr-1.5 text-sm font-medium text-primary-subtle-foreground">
                    {label}
                    <button
                      type="button"
                      onClick={() => toggle(label)}
                      aria-label={`Remover ${label}`}
                      className="grid size-6 place-items-center rounded-full transition-colors hover:bg-primary hover:text-primary-foreground"
                    >
                      <X className="size-3.5" aria-hidden />
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
