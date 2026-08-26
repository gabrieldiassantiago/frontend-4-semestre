"use client"

import { useState } from "react"
import { Plus, X } from "lucide-react"
import { BENEFIT_CATALOG } from "@/lib/data/benefits-catalog"
import { Badge } from "@/components/ui/badge"
import { StepCard, StepHeader, CheckCard } from "./wizard"

export function StepBeneficios({
  selectedBenefits,
  setSelectedBenefits,
}: {
  selectedBenefits: string[]
  setSelectedBenefits: (v: string[]) => void
}) {
  const [custom, setCustom] = useState("")

  const toggle = (label: string) =>
    setSelectedBenefits(
      selectedBenefits.includes(label)
        ? selectedBenefits.filter((item) => item !== label)
        : [...selectedBenefits, label],
    )

  const addCustom = (event: React.FormEvent) => {
    event.preventDefault()
    const value = custom.trim()
    if (!value) return
    if (!selectedBenefits.includes(value)) setSelectedBenefits([...selectedBenefits, value])
    setCustom("")
  }

  // Benefícios digitados pela empresa não estão no catálogo, então aparecem à parte.
  const catalogLabels = new Set(
    BENEFIT_CATALOG.flatMap((group) => group.items.map((item) => item.label)),
  )
  const customBenefits = selectedBenefits.filter((label) => !catalogLabels.has(label))

  return (
    <div className="space-y-6">
      <StepHeader
        step={3}
        title="O que a vaga oferece além do salário?"
        description="Selecione o que já faz parte do pacote desta posição."
        action={
          <Badge variant={selectedBenefits.length > 0 ? "primary" : "neutral"}>
            {selectedBenefits.length} selecionados
          </Badge>
        }
      />

      {BENEFIT_CATALOG.map((group) => (
        <StepCard key={group.title}>
          <fieldset>
            <legend className="flex items-center gap-2 text-sm font-bold text-strong-foreground">
              <group.icon className="size-4 text-primary" aria-hidden />
              {group.title}
            </legend>
            <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
              {group.items.map((item) => (
                <CheckCard
                  key={item.id}
                  label={item.label}
                  checked={selectedBenefits.includes(item.label)}
                  onChange={() => toggle(item.label)}
                />
              ))}
            </div>
          </fieldset>
        </StepCard>
      ))}

      <StepCard>
        <form onSubmit={addCustom}>
          <label className="block">
            <span className="text-sm font-bold text-strong-foreground">
              Benefício próprio da empresa
            </span>
            <span className="mt-1 block text-xs text-muted-foreground">
              Algo que não esteja nas listas acima.
            </span>
            <span className="mt-3 flex flex-col gap-2 sm:flex-row">
              <input
                type="text"
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
                placeholder="Ex: Folga no aniversário, auxílio pet"
                className="field-input sm:flex-1"
              />
              <button
                type="submit"
                disabled={!custom.trim()}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-bold text-strong-foreground transition-colors hover:bg-muted disabled:opacity-50"
              >
                <Plus className="size-4" aria-hidden />
                Adicionar
              </button>
            </span>
          </label>
        </form>

        {customBenefits.length > 0 && (
          <ul className="mt-4 flex list-none flex-wrap gap-2 border-t border-border-subtle pt-4">
            {customBenefits.map((label) => (
              <li key={label}>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-subtle py-1 pl-3 pr-1.5 text-xs font-bold text-primary-subtle-foreground">
                  {label}
                  <button
                    type="button"
                    onClick={() => toggle(label)}
                    aria-label={`Remover ${label}`}
                    className="grid size-5 place-items-center rounded-full transition-colors hover:bg-primary hover:text-primary-foreground"
                  >
                    <X className="size-3" aria-hidden />
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </StepCard>
    </div>
  )
}
