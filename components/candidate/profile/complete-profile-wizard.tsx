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
import { updateCandidateProfileMe } from "@/lib/services/candidate.service"
import { useCandidateProfile } from "@/lib/hooks/useCandidateProfile"
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
  const formRef = useRef<HTMLFormElement>(null)
  const [indice, setIndice] = useState(() => PROFILE_STEPS.findIndex((step) => step.id === initialStep))
  const [rascunho, setRascunho] = useState<UpdateCandidateProfileDto>({})
  const [saving, setSaving] = useState(false)
  const [changingStep, setChangingStep] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
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

  if (!profile) {
    return (
      <PageShell className="max-w-lg py-20">
        <ErrorState
          title="Não conseguimos carregar seu perfil"
          description={error ?? undefined}
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
  const atualizar = (patch: UpdateCandidateProfileDto) =>
    setRascunho((atual) => ({ ...atual, ...patch }))

  function aplicarPerfil(atualizado: CandidateProfile) {
    setProfile(atualizado)
    setRascunho(toForm(atualizado))
  }

  async function salvarRascunho() {
    if (previewMode) {
      setProfile({ ...profile, ...rascunho })
      return true
    }

    setSaving(true)
    setSaveError(null)
    try {
      aplicarPerfil(await updateCandidateProfileMe(rascunho))
      return true
    } catch (requestError) {
      setSaveError(messageFrom(requestError, "Não foi possível salvar. Tente novamente."))
      return false
    } finally {
      setSaving(false)
    }
  }

  async function irPara(next: number) {
    if (next === indice || uploadingResume || saving || changingStep || !formRef.current?.reportValidity()) return
    setChangingStep(true)
    try {
      if (["basico", "localizacao", "formacao", "skills", "links"].includes(step.id) && !(await salvarRascunho())) return
      setSaveError(null)
      setIndice(next)
    } finally {
      setChangingStep(false)
    }
  }

  async function avancar() {
    if (uploadingResume || saving || changingStep) return
    setChangingStep(true)
    const precisaSalvar = ["basico", "localizacao", "formacao", "skills", "links"].includes(step.id)
    try {
      if (precisaSalvar && !(await salvarRascunho())) return

      if (ultimo) {
        if (!(await salvarRascunho())) return
        setConcluido(true)
        return
      }
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
    <div className="min-h-dvh bg-background pb-[calc(100px+env(safe-area-inset-bottom))] text-foreground [&_button]:cursor-pointer [&_button:disabled]:cursor-default [&_button:disabled]:opacity-45 [&_button:focus-visible]:outline-2 [&_button:focus-visible]:outline-offset-4 [&_button:focus-visible]:outline-primary">
      <header className="flex h-[72px] items-center justify-between gap-5 border-b border-border px-5 sm:px-8 lg:h-[88px] lg:px-12">
        <Link href="/dashboard" aria-label="Selecta, início"><SelectaLogo /></Link>
        <span className="hidden text-sm text-muted-foreground md:block">Vamos criar seu perfil</span>
        <button type="button" className="whitespace-nowrap rounded-full border border-border-strong px-4 py-3 text-xs font-semibold hover:bg-muted sm:px-5 sm:text-sm" disabled={saving || uploadingResume || changingStep} onClick={async () => {
          if (await salvarRascunho()) router.push("/profile/candidato")
        }}>Salvar e sair</button>
      </header>
      <main className="mx-auto flex w-full max-w-[1180px] flex-col gap-0 px-5 py-6 md:grid md:grid-cols-[280px_minmax(0,1fr)] md:gap-10 md:px-8 md:py-10 lg:grid-cols-[320px_minmax(0,620px)] lg:gap-16 lg:py-14">
        <aside className="min-w-0 md:sticky md:top-8 md:self-start [&>h2]:hidden [&>p]:hidden md:[&>h2]:block md:[&>p]:block [&>h2]:mt-4 [&>h2]:text-3xl [&>h2]:font-semibold [&>h2]:leading-tight [&>h2]:tracking-tight">
          <p className="text-[11px] font-bold tracking-[0.13em] text-primary">SEU PRÓXIMO PASSO</p>
          <h2>Uma boa história<br />abre portas.</h2>
          <p className="mb-5 mt-4 max-w-72 text-sm leading-7 text-muted-foreground">Mostre quem você é e o que quer construir. Vamos por partes.</p>
          <ProfileStepTrail atual={step.id} completion={completion} disabled={saving || uploadingResume || changingStep}
            onSelect={(id) => void irPara(PROFILE_STEPS.findIndex((item) => item.id === id))} />
          <p className="mt-5 text-xs leading-6 text-muted-foreground">Não precisa ter todas as respostas agora.<br />Você pode editar seu perfil depois.</p>
        </aside>
        <section className="min-w-0">
          <motion.header key={step.id} initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduceMotion ? 0 : 0.3 }} className="[&>h1]:mt-3 [&>h1]:text-[29px] [&>h1]:font-semibold [&>h1]:leading-tight [&>h1]:tracking-tight [&>h1]:outline-none lg:[&>h1]:text-4xl [&>p:last-child]:mt-3 [&>p:last-child]:max-w-lg [&>p:last-child]:text-sm [&>p:last-child]:leading-6 [&>p:last-child]:text-muted-foreground">
            <p className="text-[11px] font-bold tracking-[0.13em] text-primary">ETAPA {indice + 1} DE {PROFILE_STEPS.length} · {step.label}</p>
            <h1 ref={titleRef} tabIndex={-1}>{step.title}</h1>
            <p>{step.description}</p>
          </motion.header>
          <form ref={formRef} onSubmit={(event) => { event.preventDefault(); void avancar() }} id="profile-step-form" className="relative mt-6 sm:mt-8 [&_.field-input]:min-w-0 [&_.field-input]:min-h-[52px] [&_.field-input]:rounded-xl [&_.field-input]:border-border-strong [&_.field-input]:text-base [&_.field-input]:shadow-none [&_label]:min-w-0">
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
                      <span className="grid size-12 shrink-0 place-items-center rounded-full bg-primary-subtle text-xl font-semibold text-primary">{profile.userName?.charAt(0).toUpperCase() || "V"}</span>
                      <div><strong>{profile.userName || "Seu perfil"}</strong><span>{profile.userEmail}</span></div>
                      <span className="ml-auto hidden whitespace-nowrap rounded-md bg-muted px-2 py-1 text-[11px] text-muted-foreground sm:block">Sua conta</span>
                    </div>

                    <Field
                      label="Título profissional"
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

                    <Field label="Sobre você" wide hint="Trajetória, interesses e o que você busca.">
                      <textarea
                        rows={3}
                        className="field-input resize-y"
                        value={rascunho.summary || ""}
                        onChange={(event) => atualizar({ summary: event.target.value })}
                        placeholder="Conte sobre sua trajetória, seus pontos fortes e o tipo de oportunidade que você procura."
                      />
                    </Field>

                    <Field label="Telefone">
                      <InputWithIcon
                        icon={Phone}
                        type="tel"
                        value={rascunho.phone || ""}
                        onChange={(event) => atualizar({ phone: event.target.value })}
                        placeholder="(11) 99999-9999"
                      />
                    </Field>

                  </div>
                )}

                {step.id === "localizacao" && (
                  <div className="max-w-xl">
                    <Field
                      label="Sua cidade"
                      hint="Você pode buscar pelo nome da cidade ou usar sua localização atual."
                    >
                      <CityAutocomplete
                        city={rascunho.city}
                        state={rascunho.state}
                        disabled={saving || uploadingResume || changingStep}
                        onChange={(location) => atualizar(location)}
                      />
                    </Field>
                  </div>
                )}

                {step.id === "formacao" && (
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Instituição">
                      <input
                        className="field-input"
                        value={rascunho.institution || ""}
                        onChange={(event) => atualizar({ institution: event.target.value })}
                        placeholder="Ex.: Universidade de São Paulo"
                      />
                    </Field>

                    <Field label="Curso">
                      <input
                        className="field-input"
                        value={rascunho.course || ""}
                        onChange={(event) => atualizar({ course: event.target.value })}
                        placeholder="Ex.: Administração, Enfermagem ou curso de Gastronomia"
                      />
                    </Field>

                    <Field label="Semestre atual">
                      <input
                        type="number"
                        min={1}
                        max={20}
                        className="field-input"
                        value={rascunho.currentSemester || ""}
                        onChange={(event) =>
                          atualizar({ currentSemester: Number(event.target.value) || undefined })
                        }
                      />
                    </Field>

                    <Field label="Previsão de formatura">
                      <input
                        type="number"
                        min={new Date().getFullYear()}
                        max={new Date().getFullYear() + 10}
                        className="field-input"
                        value={rascunho.expectedGraduationYear || ""}
                        onChange={(event) =>
                          atualizar({
                            expectedGraduationYear: Number(event.target.value) || undefined,
                          })
                        }
                      />
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

                {step.id === "links" && <ProfessionalLinks form={rascunho} onChange={atualizar} />}

                {step.id === "experiencias" && (
                  <ExperienceEditor
                    experiences={profile.experiences ?? []}
                    onProfileChange={aplicarPerfil}
                  />
                )}

                {step.id === "projetos" && (
                  <ProjectEditor projects={profile.projects ?? []} onProfileChange={aplicarPerfil} />
                )}

                {step.id === "curriculo" && <ResumeUpload profile={profile} onProfileChange={aplicarPerfil} onUploadingChange={setUploadingResume} />}

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

            {saveError && (
              <div className="mt-6">
                <Alert tone="danger">{saveError}</Alert>
              </div>
            )}
          </form>

          <p className="mt-6 text-xs text-muted-foreground">{step.id === "experiencias" || step.id === "projetos" ? "Salve cada item antes de continuar." : "Seu progresso é salvo a cada etapa."}</p>
        </section>
      </main>
      <footer className="fixed inset-x-0 bottom-0 z-40 bg-background pb-[env(safe-area-inset-bottom)]">
        <div className="h-[3px] bg-border [&>span]:block [&>span]:h-full [&>span]:bg-primary [&>span]:transition-[width] motion-reduce:[&>span]:transition-none" role="progressbar" aria-label="Preenchimento do perfil" aria-valuenow={completion.value} aria-valuemin={0} aria-valuemax={100}>
          <span style={{ width: completion.value + "%" }} />
        </div>
        <div className="mx-auto flex min-h-20 max-w-[1120px] items-center justify-between gap-5 px-5 py-3 sm:min-h-[88px] sm:px-8 sm:py-4">
          <button type="button" className="inline-flex min-h-12 items-center gap-2 text-sm font-semibold underline underline-offset-4" disabled={saving || uploadingResume || changingStep || indice === 0} onClick={() => void irPara(indice - 1)}><ArrowLeft size={18} aria-hidden />Voltar</button>
          <span className="hidden text-xs text-muted-foreground sm:block">{completion.value}% do perfil preenchido</span>
          <button type="submit" form="profile-step-form" className="flex min-h-[50px] min-w-[152px] items-center justify-center gap-3 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary-hover sm:px-6" disabled={saving || uploadingResume || changingStep}>
            {saving || changingStep ? <Loader2 size={18} className="animate-spin" aria-hidden /> : null}
            {saving ? "Salvando…" : changingStep ? "Preparando…" : ultimo ? "Concluir perfil" : "Continuar"}
            {!saving && !changingStep && <ArrowRight size={18} aria-hidden />}
          </button>
        </div>
      </footer>
    </div>
  )
}
