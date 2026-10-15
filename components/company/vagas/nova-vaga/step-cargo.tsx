"use client"

import { Building2, Laptop, Home, Sparkles } from "lucide-react"
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
        description="Comece com um título claro e direto — é assim que os candidatos ideais encontrarão sua vaga."
      />

      <StepCard>
        <Field
          label="Título da vaga"
          hint="Evite códigos internos ou siglas pouco conhecidas. Escreva como o candidato buscaria."
          error={error}
        >
          <input
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Ex: Desenvolvedor(a) Full Stack Node e React"
            aria-invalid={Boolean(error)}
            className="field-input text-base font-medium"
          />
        </Field>

        <div className="mt-5 border-t border-border/60 pt-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <Sparkles className="size-3.5 text-primary" aria-hidden />
              Sugestões rápidas:
            </span>
            {TITULO_SUGESTOES.map((sugestao) => {
              const isSelected = titulo === sugestao
              return (
                <button
                  key={sugestao}
                  type="button"
                  onClick={() => setTitulo(sugestao)}
                  className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all active:scale-95 ${
                    isSelected
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-surface text-foreground hover:border-foreground/50 hover:bg-muted"
                  }`}
                >
                  {sugestao}
                </button>
              )
            })}
          </div>
        </div>
      </StepCard>

      <StepCard>
        <RadioCards
          legend="Área de atuação"
          hint="Categorizar bem aumenta a precisão das recomendações para os talentos certos."
          options={CATEGORIA_OPTIONS}
          value={categoria}
          onChange={setCategoria}
          columns={4}
        />
      </StepCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <StepCard>
          <RadioCards
            legend="Senioridade esperada"
            hint="Define o nível de autonomia e experiência da pessoa."
            options={NIVEL_OPTIONS}
            value={nivelExperiencia}
            onChange={setNivelExperiencia}
            columns={2}
          />
        </StepCard>

        <StepCard>
          <RadioCards
            legend="Modelo de trabalho"
            hint="Informe a rotina presencial ou remota exigida pela posição."
            options={MODALIDADE_OPTIONS}
            value={modalidade}
            onChange={setModalidade}
          />
        </StepCard>
      </div>
    </div>
  )
}