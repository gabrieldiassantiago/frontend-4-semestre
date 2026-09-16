"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AlertCircle, ArrowLeft, CheckCircle2, Loader2, Save, X } from "lucide-react"
import { updateVaga } from "@/lib/services/vagas.service"
import { useCompanyProfile } from "@/lib/hooks/useCompanyProfile"
import {
  CATEGORIA_LABELS,
  MODALIDADE_LABELS,
  NIVEL_LABELS,
  type Vaga,
  type VagaCategoria,
  type VagaModalidade,
  type NivelExperiencia,
} from "@/lib/types/vaga.types"

import { Stepper, TOTAL_STEPS } from "../nova-vaga/wizard"
import { StepCargo } from "../nova-vaga/step-cargo"
import { StepLocalSalario } from "../nova-vaga/step-local-salario"
import { StepBeneficios } from "../nova-vaga/step-beneficios"
import { StepDescricao } from "../nova-vaga/step-descricao"

type FieldErrors = Partial<Record<"titulo" | "cidade" | "salario" | "descricao", string>>

interface EditVagaFormProps {
  vaga: Vaga
}

export function EditVagaForm({ vaga }: EditVagaFormProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [maxReached, setMaxReached] = useState(4) // Edição: todos os steps acessíveis

  const { profile } = useCompanyProfile()
  const companyName = profile?.companyName || "Sua empresa"

  // Campos do formulário pré-preenchidos com a vaga existente
  const [titulo, setTitulo] = useState(vaga.titulo)
  const [categoria, setCategoria] = useState<VagaCategoria>(vaga.categoria)
  const [nivelExperiencia, setNivelExperiencia] = useState<NivelExperiencia>(vaga.nivelExperiencia)
  const [modalidade, setModalidade] = useState<VagaModalidade>(vaga.modalidade)
  const [salario, setSalario] = useState(vaga.salario)
  const [cidade, setCidade] = useState(vaga.cidade)
  const [estado, setEstado] = useState(vaga.estado)
  const [latitude, setLatitude] = useState<number>(vaga.latitude ?? -23.5505)
  const [longitude, setLongitude] = useState<number>(vaga.longitude ?? -46.6333)
  const [selectedBenefits, setSelectedBenefits] = useState<string[]>(
    vaga.beneficios ? vaga.beneficios.split(",").map((b) => b.trim()).filter(Boolean) : [],
  )
  const [descricao, setDescricao] = useState(vaga.descricao)

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [saved, setSaved] = useState(false)

  function validateStep(step: number): FieldErrors {
    if (step === 1 && !titulo.trim()) return { titulo: "Informe o título da vaga." }
    if (step === 2) {
      const errors: FieldErrors = {}
      if (!cidade.trim()) errors.cidade = "Informe a cidade da vaga."
      if (!salario || salario <= 0) errors.salario = "Informe um salário maior que zero."
      return errors
    }
    if (step === 4 && !descricao.trim()) {
      return { descricao: "Escreva a descrição da vaga." }
    }
    return {}
  }

  function goToStep(step: number) {
    setFormError(null)
    setFieldErrors({})
    setCurrentStep(step)
    setMaxReached((prev) => Math.max(prev, step))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function handleAdvance() {
    const errors = validateStep(currentStep)
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      setFormError("Revise os campos destacados para continuar.")
      return
    }
    goToStep(Math.min(TOTAL_STEPS, currentStep + 1))
  }

  async function handleSave() {
    // Revalida tudo antes de salvar
    for (const step of [1, 2, 4]) {
      const errors = validateStep(step)
      if (Object.keys(errors).length > 0) {
        goToStep(step)
        setFieldErrors(errors)
        setFormError("Revise os campos destacados antes de salvar.")
        return
      }
    }

    setSubmitting(true)
    setFormError(null)

    try {
      await updateVaga(vaga.id, {
        titulo: titulo.trim(),
        salario: Number(salario),
        descricao: descricao.trim(),
        beneficios: selectedBenefits.join(", ") || undefined,
        latitude: Number(latitude),
        longitude: Number(longitude),
        cidade: cidade.trim(),
        estado: estado.trim().toUpperCase(),
        categoria,
        modalidade,
        nivelExperiencia,
      })
      setSaved(true)
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Erro ao salvar a vaga.")
    } finally {
      setSubmitting(false)
    }
  }

  // Tela de sucesso
  if (saved) {
    return (
      <div className="mx-auto flex min-h-[calc(100svh-9rem)] max-w-lg flex-col items-center justify-center px-4 py-12 text-center">
        <span className="grid size-14 place-items-center rounded-full bg-success-subtle text-success">
          <CheckCircle2 className="size-7" aria-hidden />
        </span>
        <h1 className="mt-5 text-2xl font-bold tracking-tight text-foreground text-balance">
          Vaga atualizada com sucesso!
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
          As alterações em{" "}
          <strong className="font-semibold text-strong-foreground">{titulo}</strong> foram salvas e
          já estão no ar.
        </p>

        <div className="mt-6 flex w-full flex-col gap-2.5 sm:flex-row sm:justify-center">
          <Link
            href={`/vaga/${vaga.id}`}
            className="inline-flex items-center justify-center rounded-lg border border-border px-4 py-2.5 text-sm font-bold text-strong-foreground transition-colors hover:bg-muted"
          >
            Ver página pública
          </Link>
          <Link
            href="/empresa/vagas"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            Minhas vagas
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface pb-28">
      {/* Header sticky */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/empresa/vagas"
              aria-label="Voltar para minhas vagas"
              className="grid size-9 shrink-0 place-items-center rounded-full border border-border text-strong-foreground transition-colors hover:bg-muted"
            >
              <ArrowLeft className="size-4" aria-hidden />
            </Link>
            <div className="min-w-0">
              <p className="truncate text-xs font-bold uppercase tracking-wide text-primary">
                {companyName}
              </p>
              <h1 className="truncate font-bold tracking-tight text-foreground">
                Editar vaga
                <span className="ml-2 text-muted-foreground font-normal">/ {vaga.titulo}</span>
              </h1>
            </div>
          </div>

          <Stepper current={currentStep} maxReached={maxReached} onSelect={goToStep} />
        </div>
      </header>

      {/* Conteúdo */}
      <main className="mx-auto max-w-4xl px-4 pt-8 sm:px-6">
        {formError && (
          <div
            role="alert"
            className="mb-6 flex items-start justify-between gap-3 rounded-xl border border-danger-border bg-danger-subtle p-4 text-danger-foreground"
          >
            <p className="flex items-start gap-2.5 text-sm font-medium">
              <AlertCircle className="mt-px size-4 shrink-0" aria-hidden />
              {formError}
            </p>
            <button
              type="button"
              onClick={() => setFormError(null)}
              aria-label="Fechar aviso"
              className="shrink-0 rounded-md p-0.5 transition-colors hover:bg-danger-border/50"
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>
        )}

        {currentStep === 1 && (
          <StepCargo
            titulo={titulo}
            setTitulo={setTitulo}
            categoria={categoria}
            setCategoria={setCategoria}
            nivelExperiencia={nivelExperiencia}
            setNivelExperiencia={setNivelExperiencia}
            modalidade={modalidade}
            setModalidade={setModalidade}
            error={fieldErrors.titulo}
          />
        )}

        {currentStep === 2 && (
          <StepLocalSalario
            cidade={cidade}
            setCidade={setCidade}
            estado={estado}
            setEstado={setEstado}
            latitude={latitude}
            setLatitude={setLatitude}
            longitude={longitude}
            setLongitude={setLongitude}
            modalidade={modalidade}
            salario={salario}
            setSalario={setSalario}
            categoria={categoria}
            nivelExperiencia={nivelExperiencia}
            errors={{ cidade: fieldErrors.cidade, salario: fieldErrors.salario }}
          />
        )}

        {currentStep === 3 && (
          <StepBeneficios
            selectedBenefits={selectedBenefits}
            setSelectedBenefits={setSelectedBenefits}
          />
        )}

        {currentStep === 4 && (
          <StepDescricao
            titulo={titulo}
            categoria={categoria}
            nivelExperiencia={nivelExperiencia}
            modalidade={modalidade}
            salario={salario}
            cidade={cidade}
            estado={estado}
            selectedBenefits={selectedBenefits}
            descricao={descricao}
            setDescricao={setDescricao}
            onApplyTemplate={() => {}} // Opcional: pode manter ou remover o template na edição
            error={fieldErrors.descricao}
          />
        )}
      </main>

      {/* Footer sticky com navegação */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
          <button
            type="button"
            disabled={currentStep === 1 || submitting}
            onClick={() => goToStep(Math.max(1, currentStep - 1))}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-bold text-strong-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Voltar
          </button>

          {/* Preview central */}
          <p className="hidden min-w-0 items-center gap-2 text-xs font-semibold text-muted-foreground md:flex">
            <span className="truncate">{titulo || "Vaga sem título"}</span>
            <span aria-hidden>•</span>
            <span className="shrink-0">
              {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(salario)}
            </span>
            <span aria-hidden>•</span>
            <span className="shrink-0">{MODALIDADE_LABELS[modalidade]}</span>
          </p>

          {currentStep === TOTAL_STEPS ? (
            <button
              type="button"
              disabled={submitting}
              onClick={handleSave}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-60"
            >
              {submitting ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <Save className="size-4" aria-hidden />
              )}
              {submitting ? "Salvando..." : "Salvar alterações"}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleAdvance}
              className="inline-flex items-center gap-2 rounded-lg bg-strong px-5 py-2.5 text-sm font-bold text-strong-contrast transition-colors hover:bg-strong/90"
            >
              Continuar
              <ArrowLeft className="size-4 rotate-180" aria-hidden />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
