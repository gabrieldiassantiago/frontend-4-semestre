"use client"

import { useState } from "react"
import { Plus, Sparkles, X } from "lucide-react"
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
        title="Quais benefícios a vaga oferece?"
        description="Destaque tudo o que compõe o pacote de valor para atrair e reter talentos."
        action={
          <Badge variant={selectedBenefits.length > 0 ? "primary" : "neutral"}>
            {selectedBenefits.length}{" "}
            {selectedBenefits.length === 1 ? "selecionado" : "selecionados"}
          </Badge>
        }
      />

      {BENEFIT_CATALOG.map((group) => (
        <StepCard key={group.title}>
          <fieldset>
            <legend className="flex items-center gap-2.5 text-base font-bold tracking-tight text-foreground">
              <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
                <group.icon className="size-4" aria-hidden />
              </span>
              {group.title}
            </legend>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
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
            <span className="flex items-center gap-2 text-base font-bold tracking-tight text-foreground">
              <Sparkles className="size-4 text-primary" aria-hidden />
              Benefício exclusivo da sua empresa
            </span>
            <span className="mt-1 block text-xs text-muted-foreground">
              Oferece day-off de aniversário, auxílio pet ou bônus anual? Adicione abaixo.
            </span>
            <span className="mt-4 flex flex-col gap-2.5 sm:flex-row">
              <input
                type="text"
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
                placeholder="Ex: Day off no mês de aniversário, Auxílio Educação..."
                className="field-input sm:flex-1"
              />
              <button
                type="submit"
                disabled={!custom.trim()}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-foreground px-5 py-2.5 text-sm font-bold text-background transition-all hover:opacity-90 disabled:opacity-40"
              >
                <Plus className="size-4" aria-hidden />
                Adicionar
              </button>
            </span>
          </label>
        </form>

        {customBenefits.length > 0 && (
          <div className="mt-5 border-t border-border/60 pt-4">
            <p className="mb-2.5 text-xs font-semibold text-muted-foreground">
              Adicionados manualmente:
            </p>
            <ul className="flex list-none flex-wrap gap-2">
              {customBenefits.map((label) => (
                <li key={label}>
                  <span className="inline-flex items-center gap-2 rounded-full border border-foreground/20 bg-surface py-1.5 pl-3.5 pr-2 text-xs font-bold text-foreground">
                    {label}
                    <button
                      type="button"
                      onClick={() => toggle(label)}
                      aria-label={`Remover ${label}`}
                      className="grid size-5 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-foreground hover:text-background"
                    >
                      <X className="size-3" aria-hidden />
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </StepCard>
    </div>
  )
}