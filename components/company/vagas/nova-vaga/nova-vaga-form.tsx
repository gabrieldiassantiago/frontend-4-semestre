"use client"

import { RouteSkeleton } from "@/components/ui/route-skeleton"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { AlertCircle, ArrowLeft, CheckCircle2, X } from "lucide-react"
import { createVaga } from "@/lib/services/vagas.service"
import { useCompanyProfile } from "@/lib/hooks/useCompanyProfile"
import { ShareVagaButton } from "@/components/vaga/share-vaga-button"
import {
  CATEGORIA_LABELS,
  MODALIDADE_LABELS,
  NIVEL_LABELS,
  type VagaCategoria,
  type VagaModalidade,
  type NivelExperiencia,
  type CreateVagaDto,
} from "@/lib/types/vaga.types"

import { Stepper, TOTAL_STEPS } from "./wizard"
import { StepCargo } from "./step-cargo"
import { StepLocalSalario } from "./step-local-salario"
import { StepBeneficios } from "./step-beneficios"
import { StepDescricao } from "./step-descricao"
import { NovaVagaFooter } from "./nova-vaga-footer"

const DEFAULT_BENEFITS = [
  "Plano de Saúde (Bradesco/Amil/Unimed)",
  "Vale Refeição (VR / Swile / Caju / Flash)",
  "Auxílio Home Office (R$ Luz/Internet)",
  "Horário 100% Flexível",
]

/** Campos com erro, indexados pelo nome do campo. */
type FieldErrors = Partial<Record<"titulo" | "cidade" | "salario" | "descricao", string>>

function buildTemplate(
  titulo: string,
  categoria: VagaCategoria,
  nivel: NivelExperiencia,
  modalidade: VagaModalidade,
): string {
  const cargo = titulo.trim() || CATEGORIA_LABELS[categoria]

  return `### Sobre a vaga
Estamos em busca de **${cargo} (${NIVEL_LABELS[nivel]})** para atuar em formato **${MODALIDADE_LABELS[modalidade]}**.

### Responsabilidades
- Atuar no desenvolvimento e na entrega de soluções da área de ${CATEGORIA_LABELS[categoria]}.
- Participar de reuniões de alinhamento, planejamento e acompanhamento de entregas.
- Propor melhorias de processo e compartilhar conhecimento com o time.

### Requisitos
- Experiência compatível com o nível ${NIVEL_LABELS[nivel]}.
- Autonomia e boa capacidade de resolução de problemas.
- Comunicação clara e trabalho colaborativo.

### Diferenciais
- Vivência com metodologias ágeis.
- Cases ou projetos anteriores relevantes na área.`
}

export function NovaVagaForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const [maxReached, setMaxReached] = useState(1)

  const { profile, error: profileError, isLoading: loadingCompany } = useCompanyProfile()
  const companyProfileId = profile?.id ?? null
  const companyName = profile?.companyName || "Sua empresa"

  const [titulo, setTitulo] = useState("")
  const [categoria, setCategoria] = useState<VagaCategoria>("DESENVOLVIMENTO_SOFTWARE")
  const [nivelExperiencia, setNivelExperiencia] = useState<NivelExperiencia>("PLENO")
  const [modalidade, setModalidade] = useState<VagaModalidade>("HIBRIDO")
  const [salario, setSalario] = useState(8500)
  const [cidade, setCidade] = useState("São Paulo")
  const [estado, setEstado] = useState("SP")
  const [latitude, setLatitude] = useState<number>(-23.5505)
  const [longitude, setLongitude] = useState<number>(-46.6333)
  const [selectedBenefits, setSelectedBenefits] = useState<string[]>(DEFAULT_BENEFITS)
  const [descricao, setDescricao] = useState(() =>
    buildTemplate("", "DESENVOLVIMENTO_SOFTWARE", "PLENO", "HIBRIDO"),
  )

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [publishedId, setPublishedId] = useState<string | null>(null)

  /**
   * Sugere a sede da empresa como local da vaga. Só roda uma vez, para não
   * desfazer um endereço que a pessoa já tenha ajustado à mão.
   */
  const prefilledLocation = useRef(false)
  useEffect(() => {
    if (prefilledLocation.current || !profile) return
    prefilledLocation.current = true
    if (profile.city) setCidade(profile.city)
    if (profile.state) setEstado(profile.state.toUpperCase())
  }, [profile])

  /** Valida apenas os campos que pertencem à etapa informada. */
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

  async function handlePublish() {
    if (!companyProfileId) {
      setFormError("Identificador da empresa não encontrado. Faça login novamente.")
      return
    }

    // Revalida tudo: a empresa pode ter voltado e apagado um campo anterior.
    for (const step of [1, 2, 4]) {
      const errors = validateStep(step)
      if (Object.keys(errors).length > 0) {
        goToStep(step)
        setFieldErrors(errors)
        setFormError("Revise os campos destacados antes de publicar.")
        return
      }
    }

    setSubmitting(true)
    setFormError(null)

    try {
      const dto: CreateVagaDto = {
        titulo: titulo.trim(),
        salario: Number(salario),
        descricao: descricao.trim(),
        beneficios: selectedBenefits.join(", "),
        companyProfileId,
        latitude: Number(latitude),
        longitude: Number(longitude),
        cidade: cidade.trim(),
        estado: estado.trim().toUpperCase(),
        categoria,
        modalidade,
        nivelExperiencia,
      }

      const vaga = await createVaga(dto)
      setPublishedId(vaga.id)
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Erro ao publicar a vaga.")
    } finally {
      setSubmitting(false)
    }
  }

  const visibleError =
    formError ??
    (profileError ? "Não foi possível identificar sua empresa. Faça login novamente." : null)

  if (loadingCompany) return <RouteSkeleton variant="form" />

  // Confirmação: publicar termina em uma ação útil (divulgar a vaga), não num redirect seco.
  if (publishedId) {
    return (
      <div className="mx-auto flex min-h-[calc(100svh-9rem)] max-w-lg flex-col items-center justify-center px-4 py-12 text-center">
        <span className="grid size-14 place-items-center rounded-full bg-success-subtle text-success">
          <CheckCircle2 className="size-7" aria-hidden />
        </span>
        <h1 className="mt-5 text-2xl font-bold tracking-tight text-foreground text-balance">
          Vaga publicada com sucesso!
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
          <strong className="font-semibold text-strong-foreground">{titulo}</strong> já está no ar e
          pronta para receber candidaturas.
        </p>

        <div className="mt-6 flex w-full flex-col gap-2.5 sm:flex-row sm:justify-center">
          <ShareVagaButton path={`/vaga/${publishedId}`} title={titulo} />
          <Link
            href={`/vaga/${publishedId}`}
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
              <h1 className="truncate font-bold tracking-tight text-foreground">Publicar vaga</h1>
            </div>
          </div>

          <Stepper current={currentStep} maxReached={maxReached} onSelect={goToStep} />
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 pt-8 sm:px-6">
        {visibleError && (
          <div
            role="alert"
            className="mb-6 flex items-start justify-between gap-3 rounded-xl border border-danger-border bg-danger-subtle p-4 text-danger-foreground"
          >
            <p className="flex items-start gap-2.5 text-sm font-medium">
              <AlertCircle className="mt-px size-4 shrink-0" aria-hidden />
              {visibleError}
            </p>
            {/* Só erros do formulário são dispensáveis: sem empresa não há o que publicar. */}
            {formError && (
              <button
                type="button"
                onClick={() => setFormError(null)}
                aria-label="Fechar aviso"
                className="shrink-0 rounded-md p-0.5 transition-colors hover:bg-danger-border/50"
              >
                <X className="size-4" aria-hidden />
              </button>
            )}
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
            onApplyTemplate={() =>
              setDescricao(buildTemplate(titulo, categoria, nivelExperiencia, modalidade))
            }
            error={fieldErrors.descricao}
          />
        )}
      </main>

      <NovaVagaFooter
        currentStep={currentStep}
        onBack={() => goToStep(Math.max(1, currentStep - 1))}
        onAdvance={handleAdvance}
        onPublish={handlePublish}
        submitting={submitting}
        titulo={titulo}
        salario={salario}
        modalidade={modalidade}
      />
    </div>
  )
}
