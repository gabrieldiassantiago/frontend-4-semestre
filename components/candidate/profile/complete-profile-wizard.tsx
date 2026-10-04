"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { ROUTES } from "@/lib/config/routes"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { ArrowLeft, ArrowRight, ChevronDown, Loader2 } from "lucide-react"
import { PageShell } from "@/components/ui/page"
import { Alert, ErrorState, Skeleton } from "@/components/ui/states"
import { toastSuccess } from "@/lib/toast"
import { useCandidateProfile, useSaveCandidateProfile } from "@/lib/queries/use-candidate-profile"
import {
  PROFILE_STEPS,
  getProfileCompletion,
  getStepStatus,
  type ProfileStepId,
} from "@/lib/candidate-completion"
import type { CandidateProfile, UpdateCandidateProfileDto } from "@/lib/types/candidate.types"
import { SelectaLogo } from "@/components/ui/selecta-logo"
import { cn } from "@/lib/utils"
import { ExperienceEditor } from "./experience-editor"
import { ProjectEditor } from "./project-editor"
import { ProfessionalLinks } from "./professional-links"
import { ResumeUpload } from "./resume-upload"
import { validateProfile } from "@/lib/utils/profile-validation"
import { messageFrom, toForm } from "./profile-form.utils"
import { BasicStep, EducationStep, LocationStep, ReviewStep, SkillsStep } from "./wizard/wizard-steps"
import { WizardSidebar } from "./wizard/wizard-sidebar"
import { WizardComplete } from "./wizard/wizard-complete"

const FORM_STEPS: ProfileStepId[] = ["basico", "localizacao", "formacao", "skills", "links"]

export function CompleteProfileWizard({
  initialStep = "basico",
  previewMode = false,
}: {
  initialStep?: ProfileStepId
  previewMode?: boolean
}) {
  const router = useRouter()
  const reduceMotion = useReducedMotion()
  const { profile, loading, error, refetch, setProfile } = useCandidateProfile()
  const saveProfile = useSaveCandidateProfile()
  const saving = saveProfile.isPending

  const titleRef = useRef<HTMLHeadingElement>(null)
  const errorRef = useRef<HTMLDivElement>(null)
  const initializedFor = useRef<string | null>(null)
  const [indice, setIndice] = useState(() =>
    Math.max(0, PROFILE_STEPS.findIndex((step) => step.id === initialStep)),
  )
  const [rascunho, setRascunho] = useState<UpdateCandidateProfileDto>({})
  const [uploading, setUploading] = useState(false)
  const [changingStep, setChangingStep] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [editorOpen, setEditorOpen] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof UpdateCandidateProfileDto, string>>>({})
  const [concluido, setConcluido] = useState(false)

  // Inicializa o rascunho uma vez por perfil para não apagar o que foi digitado
  // quando a foto, o currículo ou uma experiência atualizam o perfil em cache.
  useEffect(() => {
    const key = profile?.id ?? (profile ? "novo" : null)
    if (profile && initializedFor.current !== key) {
      initializedFor.current = key
      setRascunho(toForm(profile))
    }
  }, [profile])

  const completion = useMemo(
    () =>
      getProfileCompletion({
        ...rascunho,
        resumeUrl: profile?.resumeUrl,
        experiences: profile?.experiences,
        projects: profile?.projects,
      }),
    [rascunho, profile],
  )

  useEffect(() => {
    titleRef.current?.focus({ preventScroll: true })
    window.scrollTo({ top: 0, behavior: "instant" })
  }, [indice])

  useEffect(() => {
    if (saveError) errorRef.current?.scrollIntoView({ block: "center", behavior: "instant" })
  }, [saveError])

  if (loading) {
    return (
      <div className="min-h-dvh bg-surface" aria-busy="true">
        <span className="sr-only">Carregando perfil</span>
        <div className="h-16 border-b border-border bg-card" />
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 md:grid-cols-[260px_minmax(0,1fr)] md:px-6">
          <div className="hidden flex-col gap-4 md:flex">
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-80 rounded-2xl" />
          </div>
          <Skeleton className="h-[520px] rounded-[24px]" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <PageShell className="max-w-lg py-20">
        <ErrorState
          title="Não conseguimos carregar seu perfil"
          description={error}
          action={
            <button type="button" onClick={() => refetch()} className="btn-secondary">
              Tentar novamente
            </button>
          }
        />
      </PageShell>
    )
  }

  if (concluido) return <WizardComplete completion={completion} />

  const step = PROFILE_STEPS[indice]
  const ultimo = indice === PROFILE_STEPS.length - 1
  const stepStatus = getStepStatus(completion, step.id)
  const canSkip = stepStatus.optional && !stepStatus.done && stepStatus.pending === completion.items.filter((item) => item.step === step.id).length
  const blocked = editorOpen || uploading || saving || changingStep
  const stepProgress = Math.round(((indice + 1) / PROFILE_STEPS.length) * 100)

  const atualizar = (patch: UpdateCandidateProfileDto) => setRascunho((atual) => ({ ...atual, ...patch }))

  function aplicarPerfil(atualizado: CandidateProfile) {
    setProfile(atualizado)
    setRascunho(toForm(atualizado))
  }

  function validar(requireFields = false) {
    const errors = validateProfile(rascunho, requireFields ? step.id : undefined, requireFields)
    setFieldErrors(errors)
    if (Object.keys(errors).length) {
      setSaveError("Revise os campos destacados antes de continuar.")
      return false
    }
    return true
  }

  async function salvarRascunho() {
    if (!validar()) return false
    if (previewMode) {
      if (profile) setProfile({ ...profile, ...rascunho })
      toastSuccess("Prévia atualizada!")
      return true
    }

    setSaveError(null)
    try {
      const atualizado = await saveProfile.mutateAsync({ dto: rascunho, hasExistingProfile: Boolean(profile?.id) })
      aplicarPerfil(atualizado)
      return true
    } catch (requestError) {
      setSaveError(messageFrom(requestError, "Não foi possível salvar. Tente novamente."))
      return false
    }
  }

  async function irPara(next: number) {
    if (next < 0 || next === indice || blocked || (next > indice && !validar(true))) return
    setChangingStep(true)
    try {
      if (FORM_STEPS.includes(step.id) && !(await salvarRascunho())) return
      setSaveError(null)
      setFieldErrors({})
      setIndice(next)
    } finally {
      setChangingStep(false)
    }
  }

  async function avancar() {
    if (blocked || !validar(true)) return
    setChangingStep(true)
    try {
      if ((FORM_STEPS.includes(step.id) || ultimo) && !(await salvarRascunho())) return
      setSaveError(null)
      setFieldErrors({})
      if (ultimo) setConcluido(true)
      else setIndice((valor) => valor + 1)
    } finally {
      setChangingStep(false)
    }
  }

  const goToStep = (id: ProfileStepId) => void irPara(PROFILE_STEPS.findIndex((item) => item.id === id))

  return (
    <div className="min-h-dvh bg-surface pb-[env(safe-area-inset-bottom)] text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 md:px-6">
          <Link href={ROUTES.candidate.overview} aria-label="Selecta, início">
            <SelectaLogo className="h-7" />
          </Link>
          <p className="hidden text-sm text-muted-foreground md:block">
            <span className="font-semibold text-foreground">Criando seu perfil</span>
            <span aria-hidden> · </span>
            Etapa {indice + 1} de {PROFILE_STEPS.length}
          </p>
          <button
            type="button"
            className="btn-secondary whitespace-nowrap rounded-full px-4 text-sm"
            disabled={blocked}
            onClick={async () => {
              if (await salvarRascunho()) router.push(ROUTES.candidate.profile)
            }}
          >
            Salvar e sair
          </button>
        </div>
        <div className="h-1 bg-muted" aria-hidden>
          <div
            className="h-full bg-primary transition-[width] duration-500 ease-out motion-reduce:transition-none"
            style={{ width: `${stepProgress}%` }}
          />
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-5 md:grid-cols-[240px_minmax(0,1fr)] md:gap-8 md:px-6 md:py-8 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-10">
        <WizardSidebar atual={step.id} completion={completion} disabled={blocked} onSelect={goToStep} />

        <section
          aria-labelledby="wizard-step-title"
          className="flex min-w-0 flex-col rounded-[24px] border border-border bg-card shadow-card"
        >
          <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3 md:hidden">
            <span className="text-xs font-semibold tabular-nums text-muted-foreground">
              Etapa {indice + 1} de {PROFILE_STEPS.length}
            </span>
            <label className="relative inline-flex items-center">
              <span className="sr-only">Ir para outra etapa</span>
              <select
                value={step.id}
                disabled={blocked}
                onChange={(event) => goToStep(event.target.value as ProfileStepId)}
                className="min-h-11 appearance-none rounded-full border border-border bg-background py-2 pl-4 pr-9 text-sm font-semibold text-foreground"
              >
                {PROFILE_STEPS.map((item, index) => (
                  <option key={item.id} value={item.id}>
                    {index + 1}. {item.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 size-4 text-muted-foreground" aria-hidden />
            </label>
          </div>

          <div className="flex-1 px-5 py-6 sm:px-8 sm:py-8 lg:px-10">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: reduceMotion ? 0 : 10 }}
                animate={{ opacity: changingStep ? 0.5 : 1, y: 0 }}
                exit={{ opacity: 0, y: reduceMotion ? 0 : -6 }}
                transition={{ duration: reduceMotion ? 0 : 0.22, ease: [0.22, 1, 0.36, 1] }}
              >
                <header className="max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-primary">{step.label}</p>
                    {stepStatus.optional && (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                        Opcional
                      </span>
                    )}
                  </div>
                  <h1
                    id="wizard-step-title"
                    ref={titleRef}
                    tabIndex={-1}
                    className="mt-2 text-2xl font-bold leading-tight tracking-tight text-foreground outline-none text-balance sm:text-3xl"
                  >
                    {step.title}
                  </h1>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">{step.description}</p>
                </header>

                {saveError && (
                  <div ref={errorRef} className="mt-6 scroll-mt-24">
                    <Alert tone="danger">{saveError}</Alert>
                  </div>
                )}

                <form
                  id="profile-step-form"
                  noValidate
                  onSubmit={(event) => {
                    event.preventDefault()
                    void avancar()
                  }}
                  className="mt-7 sm:mt-8"
                >
                  {step.id === "basico" && (
                    <BasicStep
                      form={rascunho}
                      onChange={atualizar}
                      errors={fieldErrors}
                      setErrors={setFieldErrors}
                      profile={profile}
                      onPhotoUpdated={setProfile}
                      onUploadingChange={setUploading}
                    />
                  )}
                  {step.id === "localizacao" && <LocationStep form={rascunho} onChange={atualizar} disabled={blocked} />}
                  {step.id === "formacao" && <EducationStep form={rascunho} onChange={atualizar} errors={fieldErrors} />}
                  {step.id === "skills" && <SkillsStep form={rascunho} onChange={atualizar} />}
                  {step.id === "links" && (
                    <div className="max-w-2xl">
                      <ProfessionalLinks form={rascunho} onChange={atualizar} errors={fieldErrors} />
                    </div>
                  )}

                  {!profile && ["experiencias", "projetos", "curriculo"].includes(step.id) && (
                    <div className="flex flex-col items-start gap-4">
                      <Alert tone="info">
                        Salve seu rascunho para começar a adicionar experiências, projetos ou currículo.
                      </Alert>
                      <button type="button" className="btn-secondary" disabled={blocked} onClick={() => void salvarRascunho()}>
                        Salvar rascunho
                      </button>
                    </div>
                  )}

                  {step.id === "experiencias" && profile && (
                    <ExperienceEditor
                      experiences={profile.experiences ?? []}
                      onProfileChange={aplicarPerfil}
                      onEditingChange={setEditorOpen}
                    />
                  )}
                  {step.id === "projetos" && profile && (
                    <ProjectEditor projects={profile.projects ?? []} onProfileChange={aplicarPerfil} onEditingChange={setEditorOpen} />
                  )}
                  {step.id === "curriculo" && profile && (
                    <ResumeUpload profile={profile} onProfileChange={aplicarPerfil} onUploadingChange={setUploading} />
                  )}
                  {step.id === "revisao" && (
                    <ReviewStep
                      completion={completion}
                      profile={profile}
                      form={rascunho}
                      onGoTo={(id) => setIndice(PROFILE_STEPS.findIndex((item) => item.id === id))}
                    />
                  )}
                </form>
              </motion.div>
            </AnimatePresence>
          </div>

          <footer className="sticky bottom-0 z-30 rounded-b-[24px] border-t border-border bg-card/95 px-5 py-3 backdrop-blur supports-[backdrop-filter]:bg-card/85 sm:px-8 lg:px-10">
            <p role="status" aria-live="polite" className={cn("mb-2 text-xs", editorOpen ? "font-semibold text-primary" : "sr-only")}>
              {editorOpen
                ? "Salve ou cancele o item em edição para continuar."
                : changingStep
                  ? "Salvando e abrindo a próxima etapa"
                  : ""}
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="btn-ghost min-h-11 gap-1.5 px-3"
                disabled={blocked || indice === 0}
                onClick={() => void irPara(indice - 1)}
              >
                <ArrowLeft className="size-4" aria-hidden />
                Voltar
              </button>
              <span className="hidden flex-1 text-center text-xs text-muted-foreground lg:block">
                {step.id === "experiencias" || step.id === "projetos"
                  ? "Salve cada item antes de continuar."
                  : "Seu progresso é salvo a cada etapa."}
              </span>
              <button
                type="submit"
                form="profile-step-form"
                className={cn("ml-auto min-h-11 gap-2 px-5 lg:ml-0", canSkip && !ultimo ? "btn-secondary" : "btn-primary")}
                disabled={blocked}
              >
                {(saving || changingStep) && <Loader2 className="size-4 animate-spin" aria-hidden />}
                {saving || changingStep ? "Salvando…" : ultimo ? "Concluir perfil" : canSkip ? "Pular etapa" : "Continuar"}
                {!saving && !changingStep && <ArrowRight className="size-4" aria-hidden />}
              </button>
            </div>
          </footer>
        </section>
      </main>
    </div>
  )
}
