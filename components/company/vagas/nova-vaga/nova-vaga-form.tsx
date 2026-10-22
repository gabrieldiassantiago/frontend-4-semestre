"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { AlertCircle, CheckCircle2, ExternalLink, X } from "lucide-react"
import { ROUTES } from "@/lib/config/routes"
import { RouteSkeleton } from "@/components/ui/route-skeleton"
import { useCreateVaga, useUpdateVaga } from "@/lib/queries/use-vagas"
import { useCompanyIdentity } from "@/lib/queries/use-company-profile"
import { ShareVagaButton } from "@/components/shared/vaga/share-vaga-button"
import type { CreateVagaDto, UpdateVagaDto, Vaga } from "@/lib/types/vaga.types"
import { cn } from "@/lib/utils"

import { EDIT_STEPS, FLOW_STEPS, buildDescriptionTemplate, stripHtml, validateStep } from "./flow/steps"
import type { DraftErrors, StepId, VagaDraft } from "./flow/types"
import { FlowProvider, type FlowMode } from "./flow/flow-context"
import { STEP_HEADING_ID } from "./flow/primitives"
import { StepRail } from "./flow/step-rail"
import { LivePreview } from "./flow/live-preview"
import { FLOW_GRID, FlowFooter } from "./flow/flow-footer"
import { StepTitulo } from "./flow/steps/step-titulo"
import { StepPerfil } from "./flow/steps/step-perfil"
import { StepLocal } from "./flow/steps/step-local"
import { StepSalario } from "./flow/steps/step-salario"
import { ESSENTIAL_BENEFITS, StepBeneficios } from "./flow/steps/step-beneficios"
import { StepDescricao } from "./flow/steps/step-descricao"
import { StepProcesso } from "./flow/steps/step-processo"
import { StepRevisao } from "./flow/steps/step-revisao"

const INITIAL_DRAFT: VagaDraft = {
  titulo: "",
  categoria: "DESENVOLVIMENTO_SOFTWARE",
  nivelExperiencia: "PLENO",
  modalidade: "HIBRIDO",
  salario: 8500,
  cidade: "São Paulo",
  estado: "SP",
  latitude: -23.5505,
  longitude: -46.6333,
  beneficios: ESSENTIAL_BENEFITS,
  descricao: "",
  etapas: ["TRIAGEM", "ENTREVISTA_RH", "PROPOSTA"],
  metaTags: [],
}

const EASE = [0.22, 1, 0.36, 1] as const

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

/** Descrições antigas podem estar em texto puro; o editor espera HTML. */
function toEditorHtml(value: string) {
  if (/<[a-z][\s\S]*>/i.test(value)) return value
  return value
    .split(/\n{2,}|\r\n\r\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br>")}</p>`)
    .join("")
}

function draftFromVaga(vaga: Vaga): VagaDraft {
  return {
    titulo: vaga.titulo,
    categoria: vaga.categoria,
    nivelExperiencia: vaga.nivelExperiencia ?? "JUNIOR",
    modalidade: vaga.modalidade,
    salario: vaga.salario,
    cidade: vaga.cidade,
    estado: vaga.estado,
    latitude: vaga.latitude ?? INITIAL_DRAFT.latitude,
    longitude: vaga.longitude ?? INITIAL_DRAFT.longitude,
    beneficios: vaga.beneficios ? vaga.beneficios.split(",").map((item) => item.trim()).filter(Boolean) : [],
    descricao: toEditorHtml(vaga.descricao ?? ""),
    etapas: [...(vaga.etapas ?? [])]
      .sort((a, b) => a.ordem - b.ordem)
      .map((item) => item.etapa)
      .filter((etapa) => etapa !== "INSCRICAO" && etapa !== "CONTRATACAO"),
    metaTags: vaga.metaTags ?? [],
  }
}

export function NovaVagaForm() {
  return <VagaFlow />
}

/**
 * Fluxo em etapas para criar uma vaga ou editar uma existente.
 * Na edição todas as seções ficam acessíveis e é possível salvar de qualquer uma delas.
 */
export function VagaFlow({ vaga }: { vaga?: Vaga }) {
  const mode: FlowMode = vaga ? "edit" : "create"
  const editing = mode === "edit"
  const steps = editing ? EDIT_STEPS : FLOW_STEPS
  const reduceMotion = useReducedMotion()
  const company = useCompanyIdentity()
  const { profile, error: profileError, isLoading: loadingCompany } = company
  const createVaga = useCreateVaga()
  const updateVaga = useUpdateVaga()
  const companyProfileId = company.companyProfileId
  const companyName = company.companyName || vaga?.nomeEmpresa || "Sua empresa"

  const initialDraft = useMemo(() => (vaga ? draftFromVaga(vaga) : INITIAL_DRAFT), [vaga])
  const [draft, setDraft] = useState<VagaDraft>(initialDraft)
  const [current, setCurrent] = useState(0)
  const [maxReached, setMaxReached] = useState(editing ? steps.length - 1 : 0)
  const [direction, setDirection] = useState(1)
  const [errors, setErrors] = useState<DraftErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [doneId, setDoneId] = useState<string | null>(null)
  const [editorKey, setEditorKey] = useState(0)
  const hasNavigated = useRef(false)

  const step = steps[current]
  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(initialDraft), [draft, initialDraft])

  const update = useCallback((patch: Partial<VagaDraft>) => {
    setDraft((prev) => ({ ...prev, ...patch }))
    // Corrigir um campo limpa o aviso dele, sem esperar o próximo "Continuar".
    setErrors((prev) => {
      const touched = Object.keys(patch).filter((key) => key in prev)
      if (!touched.length) return prev
      const next = { ...prev }
      for (const key of touched) delete next[key as keyof DraftErrors]
      return next
    })
  }, [])

  // Sugere a sede da empresa como local; roda uma vez para não desfazer ajustes manuais.
  const prefilledLocation = useRef(editing)
  useEffect(() => {
    if (prefilledLocation.current || !profile) return
    prefilledLocation.current = true
    const patch: Partial<VagaDraft> = {}
    if (profile.city) patch.cidade = profile.city
    if (profile.state) patch.estado = profile.state.toUpperCase()
    if (Object.keys(patch).length) setDraft((prev) => ({ ...prev, ...patch }))
  }, [profile])

  // Evita perder alterações ao fechar a aba no meio da edição.
  useEffect(() => {
    if (!editing || !dirty || doneId) return
    const onBeforeUnload = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener("beforeunload", onBeforeUnload)
    return () => window.removeEventListener("beforeunload", onBeforeUnload)
  }, [editing, dirty, doneId])

  function goTo(index: number) {
    const target = Math.max(0, Math.min(steps.length - 1, index))
    if (target === current) return

    // Primeira visita à descrição: entrega um rascunho pronto com base nas respostas.
    if (steps[target].id === "descricao" && !stripHtml(draft.descricao)) {
      setDraft((prev) => ({ ...prev, descricao: buildDescriptionTemplate(prev) }))
      setEditorKey((key) => key + 1)
    }

    hasNavigated.current = true
    setDirection(target > current ? 1 : -1)
    setErrors({})
    setFormError(null)
    setCurrent(target)
    setMaxReached((prev) => Math.max(prev, target))
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" })
  }

  function goToStepId(id: StepId) {
    goTo(steps.findIndex((item) => item.id === id))
  }

  function handleNext() {
    const stepErrors = validateStep(step.id, draft)
    if (Object.keys(stepErrors).length) {
      setErrors(stepErrors)
      return
    }
    goTo(current + 1)
  }

  function regenerateDescription() {
    setDraft((prev) => ({ ...prev, descricao: buildDescriptionTemplate(prev) }))
    setEditorKey((key) => key + 1)
  }

  async function handleSubmit() {
    if (!editing && !companyProfileId) {
      setFormError(
        company.isOwner
          ? "Identificador da empresa não encontrado. Faça login novamente."
          : "Ainda não foi possível identificar a empresa vinculada à sua conta. Peça ao proprietário para publicar a primeira vaga.",
      )
      return
    }

    // Revalida tudo: a pessoa pode ter voltado e apagado um campo anterior.
    for (const [index, item] of steps.entries()) {
      const stepErrors = validateStep(item.id, draft)
      if (Object.keys(stepErrors).length) {
        goTo(index)
        setErrors(stepErrors)
        return
      }
    }

    setSubmitting(true)
    setFormError(null)

    const common = {
      titulo: draft.titulo.trim(),
      salario: Number(draft.salario),
      descricao: draft.descricao.trim(),
      latitude: Number(draft.latitude),
      longitude: Number(draft.longitude),
      cidade: draft.cidade.trim(),
      estado: draft.estado.trim().toUpperCase(),
      categoria: draft.categoria,
      modalidade: draft.modalidade,
      nivelExperiencia: draft.nivelExperiencia,
      metaTags: draft.metaTags,
    }

    try {
      if (vaga) {
        const dto: UpdateVagaDto = { ...common, beneficios: draft.beneficios.join(", ") || undefined }
        await updateVaga.mutateAsync({ id: vaga.id, dto })
        setDoneId(vaga.id)
      } else {
        const dto: CreateVagaDto = {
          ...common,
          beneficios: draft.beneficios.join(", "),
          companyProfileId: companyProfileId!,
          etapas: draft.etapas,
        }
        const created = await createVaga.mutateAsync(dto)
        setDoneId(created.id)
      }
    } catch (error) {
      setFormError(error instanceof Error ? error.message : editing ? "Erro ao salvar a vaga." : "Erro ao publicar a vaga.")
    } finally {
      setSubmitting(false)
    }
  }

  const visibleError =
    formError ?? (!editing && profileError ? "Não foi possível identificar sua empresa. Faça login novamente." : null)

  if (loadingCompany && !editing) return <RouteSkeleton variant="form" />

  if (doneId) {
    return <DoneScreen id={doneId} titulo={draft.titulo} mode={mode} reduceMotion={Boolean(reduceMotion)} />
  }

  const stepProps = { draft, update, errors }
  const progress = ((current + 1) / steps.length) * 100
  const offset = reduceMotion ? 0 : 40

  return (
    <FlowProvider value={{ steps, mode }}>
      <div className="flex min-h-[calc(100dvh-4rem)] flex-col bg-background">
        <div className="sticky top-16 z-20 border-b border-border bg-background/90 backdrop-blur-md">
          <div className="mx-auto flex h-14 w-full max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
            <Link
              href={ROUTES.company.jobs}
              aria-label={editing ? "Sair da edição e voltar para minhas vagas" : "Sair e voltar para minhas vagas"}
              className="grid size-9 shrink-0 place-items-center rounded-full text-strong-foreground transition-colors hover:bg-muted"
            >
              <X className="size-4" aria-hidden />
            </Link>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-sm font-semibold text-foreground">
                {editing ? (
                  <>
                    Editar vaga <span className="font-normal text-muted-foreground">· {vaga?.titulo}</span>
                  </>
                ) : (
                  "Nova vaga"
                )}
              </h1>
              <p className="truncate text-xs text-muted-foreground">{companyName}</p>
            </div>
            {editing ? (
              <div className="flex shrink-0 items-center gap-2">
                <span
                  aria-live="polite"
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
                    dirty ? "bg-warning-subtle text-warning-foreground" : "bg-muted text-muted-foreground",
                  )}
                >
                  <span aria-hidden className={cn("size-1.5 rounded-full", dirty ? "bg-warning" : "bg-subtle-foreground")} />
                  {dirty ? "Alterações não salvas" : "Sem alterações"}
                </span>
                <Link
                  href={`/vaga/${vaga?.id}`}
                  target="_blank"
                  className="hidden min-h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:inline-flex"
                >
                  Página pública
                  <ExternalLink aria-hidden className="size-3.5" />
                </Link>
              </div>
            ) : (
              <p className="shrink-0 text-xs font-medium text-muted-foreground" aria-live="polite">
                <span className="font-semibold tabular-nums text-foreground">{current + 1}</span>/{steps.length}
                <span className="ml-1.5 lg:hidden">· {step.label}</span>
              </p>
            )}
          </div>
          {editing ? (
            <nav aria-label="Seções da vaga" className="mx-auto flex w-full max-w-7xl gap-1 overflow-x-auto px-4 pb-2 sm:px-6 lg:hidden">
              {steps.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  aria-current={index === current ? "step" : undefined}
                  onClick={() => goTo(index)}
                  className={cn(
                    "shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                    index === current ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground",
                  )}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          ) : (
            <div
              className="h-0.5 w-full bg-border-subtle"
              role="progressbar"
              aria-label="Progresso da publicação"
              aria-valuemin={1}
              aria-valuemax={steps.length}
              aria-valuenow={current + 1}
            >
              <motion.div
                className="h-full bg-primary"
                initial={false}
                animate={{ width: `${progress}%` }}
                transition={{ duration: reduceMotion ? 0 : 0.5, ease: EASE }}
              />
            </div>
          )}
        </div>

        <div className={`${FLOW_GRID} flex-1`}>
          <aside className="hidden lg:block">
            <div className="sticky top-36 py-10">
              <StepRail current={current} maxReached={maxReached} draft={draft} onSelect={goTo} />
            </div>
          </aside>

          <main className="min-w-0 py-8 sm:py-12">
            <div className="mx-auto max-w-2xl">
              {visibleError && (
                <div
                  role="alert"
                  className="mb-6 flex items-start justify-between gap-3 rounded-2xl border border-danger-border bg-danger-subtle p-4 text-danger-foreground"
                >
                  <p className="flex items-start gap-2.5 text-sm font-medium">
                    <AlertCircle className="mt-px size-4 shrink-0" aria-hidden />
                    {visibleError}
                  </p>
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

              <AnimatePresence mode="wait" custom={direction} initial={false}>
                <motion.div
                  key={step.id}
                  custom={direction}
                  variants={{
                    enter: (dir: number) => ({ opacity: 0, x: dir * offset }),
                    center: { opacity: 1, x: 0 },
                    exit: (dir: number) => ({ opacity: 0, x: dir * -offset }),
                  }}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: reduceMotion ? 0.1 : 0.28, ease: EASE }}
                  onAnimationComplete={(definition) => {
                    // Leva o foco ao novo título para leitores de tela anunciarem a etapa.
                    if (definition !== "center" || !hasNavigated.current || step.id === "titulo") return
                    document.getElementById(STEP_HEADING_ID)?.focus({ preventScroll: true })
                  }}
                >
                  {step.id === "titulo" && <StepTitulo {...stepProps} onEnter={editing ? handleSubmit : handleNext} />}
                  {step.id === "perfil" && <StepPerfil {...stepProps} />}
                  {step.id === "local" && <StepLocal {...stepProps} />}
                  {step.id === "salario" && <StepSalario {...stepProps} onEnter={editing ? handleSubmit : handleNext} />}
                  {step.id === "beneficios" && <StepBeneficios {...stepProps} />}
                  {step.id === "descricao" && (
                    <StepDescricao {...stepProps} editorKey={editorKey} onRegenerate={regenerateDescription} />
                  )}
                  {step.id === "processo" && <StepProcesso {...stepProps} />}
                  {step.id === "revisao" && (
                    <StepRevisao
                      draft={draft}
                      onEdit={goToStepId}
                      preview={
                        <LivePreview
                          draft={draft}
                          companyName={companyName}
                          logoUrl={company.logoUrl ?? undefined}
                          className="mb-6 xl:hidden"
                        />
                      }
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </main>

          <aside className="hidden xl:block">
            <div className="sticky top-36 py-10">
              <LivePreview draft={draft} companyName={companyName} logoUrl={company.logoUrl ?? undefined} />
            </div>
          </aside>
        </div>

        <FlowFooter
          isFirst={current === 0}
          isLast={current === steps.length - 1}
          submitting={submitting}
          dirty={dirty}
          onBack={() => goTo(current - 1)}
          onNext={handleNext}
          onPublish={handleSubmit}
        />
      </div>
    </FlowProvider>
  )
}

function DoneScreen({
  id,
  titulo,
  mode,
  reduceMotion,
}: {
  id: string
  titulo: string
  mode: FlowMode
  reduceMotion: boolean
}) {
  const editing = mode === "edit"
  return (
    <div className="mx-auto flex min-h-[calc(100svh-9rem)] max-w-lg flex-col items-center justify-center px-4 py-12 text-center">
      <motion.span
        initial={reduceMotion ? false : { scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
        className="grid size-16 place-items-center rounded-full bg-success-subtle text-success shadow-[0_0_0_8px_var(--success-subtle)]"
      >
        <CheckCircle2 className="size-8" aria-hidden />
      </motion.span>
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.3 }}
      >
        <h1 className="mt-6 text-2xl font-bold tracking-tight text-foreground text-balance">
          {editing ? "Alterações salvas!" : "Vaga publicada!"}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
          <strong className="font-semibold text-strong-foreground">{titulo}</strong>{" "}
          {editing ? "foi atualizada e as mudanças já estão no ar." : "já está no ar e pronta para receber candidaturas."}
        </p>

        <div className="mt-7 flex w-full flex-col gap-2.5 sm:flex-row sm:justify-center">
          {!editing && <ShareVagaButton path={`/vaga/${id}`} title={titulo} />}
          <Link
            href={`/vaga/${id}`}
            className="inline-flex items-center justify-center rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-strong-foreground transition-colors hover:bg-muted"
          >
            Ver página pública
          </Link>
          <Link
            href={ROUTES.company.jobs}
            className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            Minhas vagas
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
