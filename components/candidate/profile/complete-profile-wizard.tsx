"use client"

import { useEffect, useMemo, useState, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  PartyPopper,
  Phone,
} from "lucide-react"
import { PageShell } from "@/components/ui/page"
import { Field, InputWithIcon } from "@/components/ui/form-field"
import { Alert, ErrorState, Skeleton } from "@/components/ui/states"
import { toastSuccess } from "@/lib/toast"
import { useCandidateProfile, useSaveCandidateProfile } from "@/lib/queries/use-candidate-profile"
import {
  PROFILE_STEPS,
  getProfileCompletion,
  type ProfileStepId,
} from "@/lib/candidate-completion"
import type { CandidateProfile, UpdateCandidateProfileDto } from "@/lib/types/candidate.types"
import { SelectaLogo } from "@/components/ui/selecta-logo"
import { CityAutocomplete } from "./city-autocomplete"
import { ProfilePreview } from "./profile-preview"
import { ProfileStepTrail } from "./profile-step-trail"
import { ExperienceEditor } from "./experience-editor"
import { ProjectEditor } from "./project-editor"
import { ProfessionalLinks } from "./professional-links"
import { ResumeUpload } from "./resume-upload"
import { SkillsInput } from "./skills-input"
import { formatPhone, phoneError, validateProfile } from "@/lib/utils/profile-validation"
import { messageFrom, toForm } from "./profile-form.utils"

export function CompleteProfileWizard({
  initialStep = "basico",
  previewMode = false,
}: {
  initialStep?: ProfileStepId
  previewMode?: boolean
}) {
  const router = useRouter()
  const reduceMotion = useReducedMotion()
  const [uploadingResume, setUploadingResume] = useState(false)
  const { profile, loading, error, refetch, setProfile } = useCandidateProfile()

  const titleRef = useRef<HTMLHeadingElement>(null)
  const errorRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const [indice, setIndice] = useState(() => PROFILE_STEPS.findIndex((step) => step.id === initialStep))
  const [rascunho, setRascunho] = useState<UpdateCandidateProfileDto>({})
  const saveProfile = useSaveCandidateProfile()
  const saving = saveProfile.isPending
  const [changingStep, setChangingStep] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [editorOpen, setEditorOpen] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof UpdateCandidateProfileDto, string>>>({})
  const [concluido, setConcluido] = useState(false)

  useEffect(() => {
    if (profile) setRascunho(toForm(profile))
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
      <PageShell className="max-w-4xl" aria-busy="true">
        <span className="sr-only">Carregando perfil</span>
        <Skeleton className="h-3 w-40" />
        <Skeleton className="mt-4 h-9 w-72" />
        <Skeleton className="mt-8 h-[420px] rounded-card" />
      </PageShell>
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

  const step = PROFILE_STEPS[indice]
  const ultimo = indice === PROFILE_STEPS.length - 1
  const stepItems = completion.items.filter((item) => item.step === step.id)
  const optionalStep = stepItems.length > 0 && stepItems.every((item) => !item.required)
  const canSkip = optionalStep && stepItems.every((item) => !item.done)
  const atualizar = (patch: UpdateCandidateProfileDto) =>
    setRascunho((atual) => ({ ...atual, ...patch }))

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
      // Cria o perfil com os dados disponíveis; as etapas seguintes o atualizam.
      const profileExiste = Boolean(profile?.id)
      const atualizado = await saveProfile.mutateAsync({ dto: rascunho, hasExistingProfile: profileExiste })
      aplicarPerfil(atualizado)
      return true
    } catch (requestError) {
      setSaveError(messageFrom(requestError, "Não foi possível salvar. Tente novamente."))
      return false
    }
  }

  async function irPara(next: number) {
    if (next === indice || editorOpen || uploadingResume || saving || changingStep || (next > indice && !validar(true))) return
    setChangingStep(true)
    try {
      if (["basico", "localizacao", "formacao", "skills", "links"].includes(step.id) && !(await salvarRascunho())) return
      setSaveError(null)
      setFieldErrors({})
      setIndice(next)
    } finally {
      setChangingStep(false)
    }
  }

  async function avancar() {
    if (editorOpen || uploadingResume || saving || changingStep || !validar(true)) return
    setChangingStep(true)
    const precisaSalvar = ["basico", "localizacao", "formacao", "skills", "links"].includes(step.id)
    try {
      if (precisaSalvar && !(await salvarRascunho())) return

      if (ultimo) {
        if (!(await salvarRascunho())) return
        setConcluido(true)
        return
      }
      setFieldErrors({})
      setIndice((valor) => valor + 1)
    } finally {
      setChangingStep(false)
    }
  }

  if (concluido) {
    return (
      <PageShell className="max-w-lg py-16">
        <div className="flex flex-col items-center rounded-card border border-border bg-card px-6 py-12 text-center shadow-card">
          <span className="grid size-14 place-items-center rounded-2xl bg-success-subtle text-success-foreground">
            <PartyPopper className="size-6" aria-hidden />
          </span>
          <h1 className="mt-5 text-xl font-bold tracking-tight text-foreground text-balance">
            Perfil {completion.ready ? "pronto para se candidatar" : "salvo"}
          </h1>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground text-pretty">
            {completion.ready
              ? "Suas informações já aparecem para as empresas nos processos seletivos."
              : `Faltam ${completion.missingRequired.length} ${completion.missingRequired.length === 1 ? "item obrigatório" : "itens obrigatórios"
              } para você se candidatar com o perfil completo.`}
          </p>

          <div className="mt-6 flex w-full flex-col gap-2 sm:flex-row">
            <Link href="/dashboard" className="btn-primary flex-1">
              Ver vagas
              <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Link href="/profile/candidato" className="btn-secondary flex-1">
              Revisar perfil
            </Link>
          </div>
        </div>
      </PageShell>
    )
  }

  return (
    <div className="min-h-dvh bg-surface pb-[env(safe-area-inset-bottom)] text-foreground [&_button]:cursor-pointer [&_button:disabled]:cursor-default [&_button:disabled]:opacity-45 [&_button:focus-visible]:outline-2 [&_button:focus-visible]:outline-offset-4 [&_button:focus-visible]:outline-primary">
      <header className="bg-card flex h-16 items-center justify-between gap-3 border-b border-border px-4 sm:h-[72px] sm:px-8 lg:h-[88px] lg:px-12">
        <Link href="/dashboard" aria-label="Selecta, início"><SelectaLogo className="h-7 sm:h-9" /></Link>
        <span className="hidden text-sm text-muted-foreground md:block">Vamos criar seu perfil</span>
        <button type="button" className="whitespace-nowrap rounded-full border border-border-strong px-4 py-3 text-xs font-semibold hover:bg-muted sm:px-5 sm:text-sm" disabled={editorOpen || saving || uploadingResume || changingStep} onClick={async () => {
          if (await salvarRascunho()) router.push("/profile/candidato")
        }}>Salvar e sair</button>
      </header>
      <main className="mx-auto flex w-full max-w-[1480px] flex-col gap-0 px-4 pb-8 pt-4 md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 md:px-6 md:py-8 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-10 lg:px-10 lg:py-10">
        <aside className="hidden min-w-0 md:sticky md:top-8 md:block md:self-start [&>h2]:mt-4 [&>h2]:text-3xl [&>h2]:font-semibold [&>h2]:leading-tight [&>h2]:tracking-tight">
          <p className="text-[11px] font-bold tracking-[0.13em] text-primary">SEU PRÓXIMO PASSO</p>
          <h2>Seu próximo passo<br />começa aqui.</h2>
          <div className="mt-6 rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center justify-between text-xs font-semibold"><span>Seu perfil</span><span className="text-primary">{completion.value}% completo</span></div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-all" style={{ width: completion.value + "%" }} /></div>
          </div>
          <p className="mb-5 mt-4 max-w-72 text-sm leading-7 text-muted-foreground">Mostre quem você é e o que quer construir. Vamos por partes.</p>
          <ProfileStepTrail atual={step.id} completion={completion} disabled={editorOpen || saving || uploadingResume || changingStep}
            onSelect={(id) => void irPara(PROFILE_STEPS.findIndex((item) => item.id === id))} />
          <p className="mt-5 text-xs leading-6 text-muted-foreground">Não precisa ter todas as respostas agora.<br />Você pode editar seu perfil depois.</p>
        </aside>
        <section className="min-w-0 rounded-[28px] border border-border bg-card p-5 shadow-sm sm:p-8 lg:p-10 xl:p-12">
          <nav aria-label="Navegação da etapa" className="sticky top-0 z-30 -mx-1 mb-5 flex items-center justify-between gap-2 border-b border-border bg-card px-1 py-2 md:mb-6 md:gap-3 md:py-3">
            <button type="button" aria-label="Voltar à etapa anterior" className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center gap-2 rounded-lg px-2 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground" disabled={editorOpen || saving || uploadingResume || changingStep || indice === 0} onClick={() => void irPara(indice - 1)}>
              <ArrowLeft size={17} aria-hidden /><span className="hidden md:inline">Voltar</span>
            </button>
            <label className="min-w-0 flex-1 md:hidden">
              <span className="block text-[10px] font-medium text-muted-foreground">Etapa {indice + 1} de {PROFILE_STEPS.length} · Trocar</span>
              <select aria-label="Ir para outra etapa" value={step.id} disabled={editorOpen || saving || uploadingResume || changingStep} onChange={(event) => void irPara(PROFILE_STEPS.findIndex((item) => item.id === event.target.value))} className="min-h-11 w-full min-w-0 truncate rounded-md bg-background text-base font-semibold text-foreground">
                {PROFILE_STEPS.map((item, index) => <option key={item.id} value={item.id}>{index + 1}. {item.label}</option>)}
              </select>
            </label>
            <span className="hidden text-xs tabular-nums text-muted-foreground md:block">Etapa {indice + 1} de {PROFILE_STEPS.length}</span>
            <button type="submit" form="profile-step-form" className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary-hover" disabled={editorOpen || saving || uploadingResume || changingStep}>
              {saving || changingStep ? <Loader2 size={17} className="animate-spin" aria-hidden /> : null}
              {saving ? "Salvando…" : changingStep ? "Aguarde…" : ultimo ? "Concluir" : canSkip ? "Pular" : "Continuar"}
              {!saving && !changingStep && <ArrowRight size={17} aria-hidden />}
            </button>
          </nav>
          {saveError && (
            <div ref={errorRef} className="mb-5 scroll-mt-24">
              <Alert tone="danger">{saveError}</Alert>
            </div>
          )}
          <motion.header key={step.id} initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduceMotion ? 0 : 0.3 }} className="[&>h1]:text-2xl [&>h1]:font-semibold [&>h1]:leading-tight [&>h1]:tracking-tight [&>h1]:outline-none md:[&>h1]:mt-3 md:[&>h1]:text-[29px] lg:[&>h1]:text-4xl [&>p:last-child]:mt-2 [&>p:last-child]:max-w-lg [&>p:last-child]:text-sm [&>p:last-child]:leading-6 [&>p:last-child]:text-muted-foreground">
            <p className="hidden text-[11px] font-bold tracking-[0.13em] text-primary md:block">ETAPA {indice + 1} DE {PROFILE_STEPS.length} · {step.label}</p>
            <h1 ref={titleRef} tabIndex={-1}><span className="md:hidden">{step.label}</span><span className="hidden md:inline">{step.title}</span></h1>
            <p>{step.description}</p>
          </motion.header>
          {optionalStep && <p className="mt-2 text-xs font-medium text-primary">Opcional · você pode preencher depois.</p>}
          <form ref={formRef} noValidate onSubmit={(event) => { event.preventDefault(); void avancar() }} id="profile-step-form" className="relative mt-6 sm:mt-8 [&_.field-input]:min-w-0 [&_.field-input]:min-h-[52px] [&_.field-input]:rounded-xl [&_.field-input]:border-border-strong [&_.field-input]:text-base [&_.field-input]:shadow-none [&_label]:min-w-0">
            <AnimatePresence>
              {changingStep && (
                <motion.div
                  role="status"
                  aria-live="polite"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-20 grid min-h-48 place-items-center rounded-xl bg-background/75 backdrop-blur-[2px]"
                >
                  <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-strong-foreground shadow-card">
                    <Loader2 className="size-4 animate-spin text-primary" />
                    Preparando etapa
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence mode="wait">
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }}
                animate={{ opacity: changingStep ? 0.45 : 1, y: 0 }}
                exit={{ opacity: 0, y: reduceMotion ? 0 : -8 }}
                transition={{ duration: reduceMotion ? 0 : 0.25, ease: [0.22, 1, 0.36, 1] }}
              >
                {step.id === "basico" && (
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="col-span-full mb-0.5 flex min-w-0 items-center gap-3 border-b border-border pb-5 [&>div]:min-w-0 [&_strong]:block [&_strong]:text-sm [&_div_span]:mt-1 [&_div_span]:block [&_div_span]:text-xs [&_div_span]:break-all [&_div_span]:text-muted-foreground">
                      <span className="grid size-12 shrink-0 place-items-center rounded-full bg-primary-subtle text-xl font-semibold text-primary">{profile?.userName?.charAt(0).toUpperCase() || "V"}</span>
                      <div><strong>{profile?.userName || "Seu perfil"}</strong><span>{profile?.userEmail}</span></div>
                      <span className="ml-auto hidden whitespace-nowrap rounded-md bg-muted px-2 py-1 text-[11px] text-muted-foreground sm:block">Sua conta</span>
                    </div>

                    <Field
                      error={fieldErrors.headline}
                      label="Título profissional *"
                      wide
                      hint="Uma linha que resume o que você faz ou quer fazer."
                    >
                      <input
                        className="field-input"
                        value={rascunho.headline || ""}
                        onChange={(event) => atualizar({ headline: event.target.value })}
                        placeholder="Ex.: Assistente administrativo, vendedor ou auxiliar de enfermagem"
                      />
                    </Field>

                    <Field error={fieldErrors.summary} label="Sobre você *" wide hint="Trajetória, interesses e o que você busca.">
                      <textarea
                        rows={3}
                        className="field-input resize-y"
                        value={rascunho.summary || ""}
                        onChange={(event) => atualizar({ summary: event.target.value })}
                        placeholder="Conte sobre sua trajetória, seus pontos fortes e o tipo de oportunidade que você procura."
                      />
                    </Field>

                    <Field label="Telefone *" error={fieldErrors.phone} hint="Celular ou telefone fixo com DDD.">
                      <InputWithIcon
                        icon={Phone}
                        type="tel"
                        autoComplete="tel"
                        inputMode="tel"
                        value={formatPhone(rascunho.phone || "")}
                        aria-invalid={Boolean(fieldErrors.phone)}
                        onBlur={() => setFieldErrors((errors) => ({ ...errors, phone: rascunho.phone ? phoneError(rascunho.phone) : "Informe seu telefone de contato." }))}
                        onChange={(event) => atualizar({ phone: formatPhone(event.target.value) })}
                        placeholder="(11) 99999-9999"
                      />
                    </Field>

                  </div>
                )}

                {step.id === "localizacao" && (
                  <div className="w-full">
                    <Field
                      label="Sua cidade"
                      hint="Você pode buscar pelo nome da cidade ou usar sua localização atual."
                    >
                      <CityAutocomplete
                        city={rascunho.city}
                        state={rascunho.state}
                        disabled={editorOpen || saving || uploadingResume || changingStep}
                        onChange={(location) => atualizar(location)}
                      />
                    </Field>
                  </div>
                )}

                {step.id === "formacao" && (
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Instituição *" error={fieldErrors.institution}>
                      <input
                        className="field-input"
                        value={rascunho.institution || ""}
                        onChange={(event) => atualizar({ institution: event.target.value })}
                        placeholder="Ex.: Universidade de São Paulo"
                      />
                    </Field>

                    <Field label="Curso *" error={fieldErrors.course}>
                      <input
                        className="field-input"
                        value={rascunho.course || ""}
                        onChange={(event) => atualizar({ course: event.target.value })}
                        placeholder="Ex.: Administração, Enfermagem ou curso de Gastronomia"
                      />
                    </Field>

                    <Field label="Semestre atual *" error={fieldErrors.currentSemester}>
                      <select className="field-input" value={rascunho.currentSemester ?? ""} aria-invalid={Boolean(fieldErrors.currentSemester)} onChange={(event) => atualizar({ currentSemester: event.target.value ? Number(event.target.value) : undefined })}>
                        <option value="">Selecione seu semestre</option>
                        {Array.from({ length: 20 }, (_, index) => index + 1).map((semester) => <option key={semester} value={semester}>{semester}º semestre</option>)}
                      </select>
                    </Field>
                    <Field label="Previsão de formatura *" error={fieldErrors.expectedGraduationYear} hint="Selecione o ano em que você espera concluir o curso.">
                      <select className="field-input" value={rascunho.expectedGraduationYear ?? ""} aria-invalid={Boolean(fieldErrors.expectedGraduationYear)} onChange={(event) => atualizar({ expectedGraduationYear: event.target.value ? Number(event.target.value) : undefined })}>
                        <option value="">Selecione o ano</option>
                        {Array.from({ length: 11 }, (_, index) => new Date().getFullYear() + index).map((year) => <option key={year} value={year}>{year}</option>)}
                      </select>
                    </Field>
                  </div>
                )}

                {step.id === "skills" && (
                  <Field
                    label="Suas habilidades"
                    hint="Inclua ao menos três. Técnicas e comportamentais contam."
                  >
                    <SkillsInput
                      skills={rascunho.skills ?? []}
                      onChange={(skills) => atualizar({ skills })}
                    />
                  </Field>
                )}

                {step.id === "links" && <ProfessionalLinks form={rascunho} onChange={atualizar} errors={fieldErrors} />}

                {!profile && ["experiencias", "projetos", "curriculo"].includes(step.id) && (
                  <div className="space-y-4">
                    <Alert tone="info">
                      Salve seu rascunho para começar a adicionar experiências, projetos ou currículo. Você pode completar os outros dados depois.
                    </Alert>
                    <button type="button" className="btn-secondary" disabled={saving || changingStep} onClick={() => void salvarRascunho()}>
                      Salvar rascunho
                    </button>
                  </div>
                )}

                {step.id === "experiencias" && profile && (
                  <ExperienceEditor
                    experiences={profile?.experiences ?? []}
                    onProfileChange={aplicarPerfil}
                    onEditingChange={setEditorOpen}
                  />
                )}

                {step.id === "projetos" && profile && (
                  <ProjectEditor projects={profile.projects ?? []} onProfileChange={aplicarPerfil} onEditingChange={setEditorOpen} />
                )}

                {step.id === "curriculo" && profile && <ResumeUpload profile={profile} onProfileChange={aplicarPerfil} onUploadingChange={setUploadingResume} />}

                {step.id === "revisao" && (
                  <div className="flex flex-col gap-5">
                    {completion.missing.length === 0 ? (
                      <Alert tone="success">
                        Tudo preenchido. Seu perfil está completo para qualquer processo seletivo.
                      </Alert>
                    ) : (
                      <div className="rounded-card border border-border bg-muted/50 p-5">
                        <h3 className="text-sm font-bold text-foreground">
                          {completion.missingRequired.length > 0
                            ? "Pendências antes de se candidatar"
                            : "Itens opcionais que fortalecem seu perfil"}
                        </h3>
                        <ul className="mt-3 flex flex-col gap-2">
                          {completion.missing.map((item) => (
                            <li key={item.id} className="flex items-center justify-between gap-3">
                              <span className="min-w-0 text-sm text-strong-foreground">
                                {item.label}
                                {!item.required && (
                                  <span className="ml-2 text-xs text-subtle-foreground">
                                    opcional
                                  </span>
                                )}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  setIndice(
                                    PROFILE_STEPS.findIndex((passo) => passo.id === item.step),
                                  )
                                }
                                className="shrink-0 text-xs font-bold text-primary transition-colors hover:text-primary-hover"
                              >
                                Preencher
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <ProfilePreview profile={profile} form={rascunho} />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

          </form>

          {editorOpen && <p role="status" className="mt-5 rounded-xl bg-primary-subtle px-4 py-3 text-sm text-primary">Salve ou cancele o item em edição para continuar.</p>}
          <p className="mt-6 text-xs text-muted-foreground">{step.id === "experiencias" || step.id === "projetos" ? "Salve cada item antes de continuar." : "Seu progresso é salvo a cada etapa."}</p>

        </section>
      </main>
    </div>
  )
}
