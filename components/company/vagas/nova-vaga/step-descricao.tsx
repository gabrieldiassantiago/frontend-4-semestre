"use client"

import { FileText } from "lucide-react"
import { Field } from "@/components/ui/form-field"
import { formatCurrency } from "@/lib/format"
import {
  CATEGORIA_LABELS,
  MODALIDADE_LABELS,
  NIVEL_LABELS,
  type VagaCategoria,
  type VagaModalidade,
  type NivelExperiencia,
} from "@/lib/types/vaga.types"
import { StepCard, StepHeader } from "./wizard"
import { RichTextEditor } from "./rich-text-editor"

export function StepDescricao({
  titulo,
  categoria,
  nivelExperiencia,
  modalidade,
  salario,
  cidade,
  estado,
  selectedBenefits,
  descricao,
  setDescricao,
  onApplyTemplate,
  error,
}: {
  titulo: string
  categoria: VagaCategoria
  nivelExperiencia: NivelExperiencia
  modalidade: VagaModalidade
  salario: number
  cidade: string
  estado: string
  selectedBenefits: string[]
  descricao: string
  setDescricao: (v: string) => void
  onApplyTemplate: () => void
  error?: string
}) {
  const resumo = [
    { label: "Título", value: titulo || "Não informado" },
    { label: "Área", value: CATEGORIA_LABELS[categoria] },
    { label: "Senioridade", value: NIVEL_LABELS[nivelExperiencia] },
    { label: "Modelo", value: MODALIDADE_LABELS[modalidade] },
    { label: "Local", value: cidade && estado ? `${cidade}, ${estado}` : "Não informado" },
    { label: "Salário", value: formatCurrency(salario) },
    { label: "Benefícios", value: `${selectedBenefits.length} selecionados` },
  ]

  // Contagem aproximada de caracteres (ignora tags HTML)
  const charCount = descricao.replace(/<[^>]*>/g, "").length

  return (
    <div className="space-y-6">
      <StepHeader
        step={4}
        title="Descreva os desafios da vaga"
        description="Revise o texto antes de publicar. Ele é a primeira impressão do candidato."
        action={
          <button
            type="button"
            onClick={onApplyTemplate}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-xs font-bold text-strong-foreground transition-colors hover:bg-muted"
          >
            <FileText className="size-4" aria-hidden />
            Gerar modelo de texto
          </button>
        }
      />

      <StepCard>
        <Field
          label="Descrição da vaga"
          error={error}
          hint={`${charCount} caracteres • use os botões acima para formatar o texto`}
        >
          <RichTextEditor
            value={descricao}
            onChange={setDescricao}
            error={error}
            placeholder="Fale sobre a missão da vaga, responsabilidades, requisitos e diferenciais..."
          />
        </Field>
      </StepCard>

      <StepCard className="bg-surface">
        <h3 className="text-sm font-bold text-strong-foreground">Revisão final</h3>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          {resumo.map((item) => (
            <div key={item.label} className="min-w-0">
              <dt className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                {item.label}
              </dt>
              <dd className="mt-0.5 truncate text-sm font-semibold text-foreground">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
      </StepCard>
    </div>
  )
}