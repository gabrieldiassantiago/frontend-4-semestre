"use client"

import { Building2, Laptop, Home } from "lucide-react"
import { Field } from "@/components/ui/form-field"
import {
  CATEGORIA_LABELS,
  NIVEL_LABELS,
  type VagaCategoria,
  type VagaModalidade,
  type NivelExperiencia,
} from "@/lib/types/vaga.types"
import { StepCard, StepHeader, RadioCards, type Choice } from "./wizard"

const TITULO_SUGESTOES = [
  "Desenvolvedor(a) Backend Java",
  "Product Designer UX/UI",
  "Analista de Marketing Digital",
  "Enfermeiro(a) Plantonista",
  "Tech Lead",
]

const MODALIDADE_OPTIONS: Choice<VagaModalidade>[] = [
  { value: "REMOTO", label: "Remoto", description: "De qualquer lugar", icon: Home },
  { value: "HIBRIDO", label: "Híbrido", description: "Casa e escritório", icon: Laptop },
  { value: "PRESENCIAL", label: "Presencial", description: "Na sede ou filial", icon: Building2 },
]

const CATEGORIA_OPTIONS = (Object.entries(CATEGORIA_LABELS) as [VagaCategoria, string][]).map(
  ([value, label]) => ({ value, label }),
)

const NIVEL_OPTIONS = (Object.entries(NIVEL_LABELS) as [NivelExperiencia, string][]).map(
  ([value, label]) => ({ value, label }),
)

export function StepCargo({
  titulo,
  setTitulo,
  categoria,
  setCategoria,
  nivelExperiencia,
  setNivelExperiencia,
  modalidade,
  setModalidade,
  error,
}: {
  titulo: string
  setTitulo: (v: string) => void
  categoria: VagaCategoria
  setCategoria: (v: VagaCategoria) => void
  nivelExperiencia: NivelExperiencia
  setNivelExperiencia: (v: NivelExperiencia) => void
  modalidade: VagaModalidade
  setModalidade: (v: VagaModalidade) => void
  error?: string
}) {
  return (
    <div className="space-y-6">
      <StepHeader
        step={1}
        title="Qual função você está contratando?"
        description="Um título claro é o que faz a vaga aparecer nas buscas certas."
      />

      <StepCard>
        <Field
          label="Título da vaga"
          hint="Evite códigos internos. Escreva como o candidato buscaria."
          error={error}
        >
          <input
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Ex: Desenvolvedor(a) Full Stack Node e React"
            aria-invalid={Boolean(error)}
            className="field-input"
          />
        </Field>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Sugestões:</span>
          {TITULO_SUGESTOES.map((sugestao) => (
            <button
              key={sugestao}
              type="button"
              onClick={() => setTitulo(sugestao)}
              className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-strong-foreground transition-colors hover:bg-primary-subtle hover:text-primary-subtle-foreground"
            >
              {sugestao}
            </button>
          ))}
        </div>
      </StepCard>

      <StepCard>
        <RadioCards
          legend="Área de atuação"
          hint="Categorizar bem aumenta o match com os candidatos certos."
          options={CATEGORIA_OPTIONS}
          value={categoria}
          onChange={setCategoria}
          columns={4}
        />
      </StepCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <StepCard>
          <RadioCards
            legend="Senioridade"
            options={NIVEL_OPTIONS}
            value={nivelExperiencia}
            onChange={setNivelExperiencia}
            columns={2}
          />
        </StepCard>

        <StepCard>
          <RadioCards
            legend="Modelo de trabalho"
            options={MODALIDADE_OPTIONS}
            value={modalidade}
            onChange={setModalidade}
          />
        </StepCard>
      </div>
    </div>
  )
}
