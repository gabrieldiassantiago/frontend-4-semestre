"use client"

import { Building2, Home, Laptop } from "lucide-react"
import {
  CATEGORIA_LABELS,
  NIVEL_LABELS,
  type NivelExperiencia,
  type VagaCategoria,
  type VagaModalidade,
} from "@/lib/types/vaga.types"
import { Chip, QuestionHeader, TileGroup, type TileOption } from "../primitives"
import type { StepProps } from "../types"

const MODALIDADES: TileOption<VagaModalidade>[] = [
  { value: "REMOTO", label: "Remoto", description: "De qualquer lugar", icon: Home },
  { value: "HIBRIDO", label: "Híbrido", description: "Casa e escritório", icon: Laptop },
  { value: "PRESENCIAL", label: "Presencial", description: "Na sede ou filial", icon: Building2 },
]

const CATEGORIAS = Object.entries(CATEGORIA_LABELS) as [VagaCategoria, string][]

const NIVEIS: TileOption<NivelExperiencia>[] = (
  Object.entries(NIVEL_LABELS) as [NivelExperiencia, string][]
).map(([value, label]) => ({ value, label }))

export function StepPerfil({ draft, update }: StepProps) {
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

        <TileGroup
          legend="Senioridade"
          options={NIVEIS}
          value={draft.nivelExperiencia}
          onChange={(nivelExperiencia) => update({ nivelExperiencia })}
          gridClassName="grid-cols-2 sm:grid-cols-3"
        />

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
