"use client"

import { Building2, Home, Laptop, Minus, Plus, Users } from "lucide-react"
import {
  CATEGORIA_LABELS,
  type VagaCategoria,
  type VagaModalidade,
} from "@/lib/types/vaga.types"
import { Chip, FieldError, QuestionHeader, TileGroup, type TileOption } from "../primitives"
import type { StepProps } from "../types"

const MODALIDADES: TileOption<VagaModalidade>[] = [
  { value: "REMOTO", label: "Remoto", description: "De qualquer lugar", icon: Home },
  { value: "HIBRIDO", label: "Híbrido", description: "Casa e escritório", icon: Laptop },
  { value: "PRESENCIAL", label: "Presencial", description: "Na sede ou filial", icon: Building2 },
]

const CATEGORIAS = Object.entries(CATEGORIA_LABELS) as [VagaCategoria, string][]

const QUICK_VAGAS = [1, 2, 3, 5, 10]

export function StepPerfil({ draft, update, errors }: StepProps) {
  const vagas = Math.max(1, draft.quantidadeVagas || 1)

  const handleSetVagas = (count: number) => {
    update({ quantidadeVagas: Math.max(1, count) })
  }

  return (
    <div>
      <QuestionHeader stepId="perfil" />

      <div className="space-y-9">
        <TileGroup
          legend="Modelo de trabalho"
          options={MODALIDADES}
          value={draft.modalidade}
          onChange={(modalidade) => update({ modalidade })}
          gridClassName="sm:grid-cols-3"
        />

        {/* Quantidade de vagas disponíveis */}
        <fieldset>
          <div className="mb-3 flex items-center justify-between gap-2">
            <div>
              <legend className="flex items-center gap-1.5 text-sm font-semibold text-strong-foreground">
                <Users className="size-4 text-primary" aria-hidden />
                Quantidade de vagas disponíveis
              </legend>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Número de posições abertas para contratação imediata
              </p>
            </div>
          </div>

          <div className="rounded-2xl border-2 border-border bg-card p-4 transition-colors duration-200 focus-within:border-primary sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleSetVagas(vagas - 1)}
                  disabled={vagas <= 1}
                  aria-label="Diminuir uma vaga"
                  className="grid size-11 place-items-center rounded-xl border border-border bg-background text-foreground transition-colors hover:border-border-strong hover:bg-muted active:scale-95 disabled:pointer-events-none disabled:opacity-40"
                >
                  <Minus className="size-4" aria-hidden />
                </button>

                <div className="flex items-baseline gap-2">
                  <input
                    id="quantidade-vagas"
                    type="number"
                    min="1"
                    max="999"
                    value={vagas}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10)
                      handleSetVagas(isNaN(val) ? 1 : val)
                    }}
                    className="w-16 bg-transparent text-center text-3xl font-bold tabular-nums text-foreground focus:outline-none"
                    aria-label="Número de vagas"
                  />
                  <span className="text-sm font-medium text-muted-foreground">
                    {vagas === 1 ? "vaga aberta" : "vagas abertas"}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleSetVagas(vagas + 1)}
                  aria-label="Aumentar uma vaga"
                  className="grid size-11 place-items-center rounded-xl border border-border bg-background text-foreground transition-colors hover:border-border-strong hover:bg-muted active:scale-95"
                >
                  <Plus className="size-4" aria-hidden />
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 border-t border-border-subtle pt-3 sm:border-t-0 sm:pt-0">
                <span className="text-xs font-medium text-subtle-foreground mr-1 sm:hidden">Sugestões:</span>
                {QUICK_VAGAS.map((num) => (
                  <Chip
                    key={num}
                    selected={vagas === num}
                    onClick={() => handleSetVagas(num)}
                  >
                    {num} {num === 1 ? "vaga" : "vagas"}
                  </Chip>
                ))}
              </div>
            </div>
          </div>
          <FieldError message={errors.quantidadeVagas} />
        </fieldset>

        <fieldset>
          <legend className="mb-3 text-sm font-semibold text-strong-foreground">Área de atuação</legend>
          <div className="flex flex-wrap gap-2">
            {CATEGORIAS.map(([value, label]) => (
              <Chip
                key={value}
                selected={draft.categoria === value}
                onClick={() => update({ categoria: value })}
              >
                {label}
              </Chip>
            ))}
          </div>
        </fieldset>
      </div>
    </div>
  )
}
