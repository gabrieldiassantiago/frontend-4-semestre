"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { Lottie } from "lottie-react";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Check,
  CircleAlert,
  FileText,
  LoaderCircle,
  Sparkles,
  UserRound,
} from "lucide-react"
import { Modal } from "@/components/ui/modal"
import { Field } from "@/components/ui/form-field"
import { Alert, Skeleton } from "@/components/ui/states"
import { EntityAvatar } from "@/components/ui/entity-avatar"
import { Badge } from "@/components/ui/badge"
import { useCandidateProfile } from "@/lib/hooks/useCandidateProfile"
import { revalidarCandidatura } from "@/lib/hooks/useCandidaturas"
import { ApplicationResumePicker, type ResumeSelection } from "./application-resume-picker"
import { uploadCandidateResume } from "@/lib/services/candidate.service"
import { criarCandidatura } from "@/lib/services/candidatura.service"
import { getProfileCompletion } from "@/lib/candidate-completion"
import { getErrorMessage, isApiError } from "@/lib/errors"
import { formatCurrency } from "@/lib/format"
import { MODALIDADE_LABELS, NIVEL_LABELS } from "@/lib/types/vaga.types"
import type { Vaga } from "@/lib/types/vaga.types"
import type { Candidatura } from "@/lib/types/candidatura.types"
import { cn } from "@/lib/utils"
import sucessoVagaAnimation from "../../public/images/sucesso_vaga.json"

const STEPS = [
  { id: 1, label: "Perfil", icon: UserRound },
  { id: 2, label: "Candidatura", icon: FileText },
  { id: 3, label: "Revisão", icon: BadgeCheck },
] as const

const CARTA_MAX = 2000

/** Trilha compacta dos 3 passos, exibida no cabeçalho do diálogo. */
function StepTrack({ current }: { current: number }) {
  return (
    <ol className="flex items-center gap-1.5">
      {STEPS.map((step, index) => {
        const active = step.id === current
        const done = step.id < current

        return (
          <li key={step.id} className="flex items-center gap-1.5">
            <span
              aria-current={active ? "step" : undefined}
              className={cn(
                "flex items-center gap-1.5 rounded-full py-1 pl-1 pr-2.5 text-[11px] font-bold transition-colors",
                active && "bg-primary-subtle text-primary-subtle-foreground",
                done && "text-success-foreground",
                !active && !done && "text-subtle-foreground",
              )}
            >
              <span
                className={cn(
                  "grid size-5 shrink-0 place-items-center rounded-full text-[10px]",
                  active && "bg-primary text-primary-foreground",
                  done && "bg-success text-strong-contrast",
                  !active && !done && "border border-border-strong",
                )}
              >
                {done ? <Check className="size-3" aria-hidden /> : step.id}
              </span>
              <span className="hidden sm:inline">{step.label}</span>
            </span>

            {index < STEPS.length - 1 && (
              <span aria-hidden className={cn("h-px w-3", done ? "bg-success" : "bg-border")} />
            )}
          </li>
        )
      })}
    </ol>
  )
}

/**
 * Candidatura em três passos: conferir o perfil, escrever a carta e revisar.
 * Separar o envio da leitura do perfil evita o caso mais frustrante do fluxo —
 * descobrir que o perfil estava vazio só depois de já ter se candidatado.
 */
export function ApplyModal({
  vaga,
  open,
  onClose,
  onApplied,
}: {
  vaga: Vaga | null
  open: boolean
  onClose: () => void
  onApplied?: (candidatura: Candidatura) => void
}) {
  const { profile, loading: loadingProfile, setProfile } = useCandidateProfile()
  const reduceMotion = useReducedMotion()
  const transitionTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const stepContent = useRef<HTMLDivElement>(null)
  const [transitioning, setTransitioning] = useState(false)

  const [step, setStep] = useState(1)
  const [carta, setCarta] = useState("")
  const [resume, setResume] = useState<ResumeSelection>(null)
  const [checkingResume, setCheckingResume] = useState(false)
  const uploadedResume = useRef<string | null>(null)
  const submitLock = useRef(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [criada, setCriada] = useState<Candidatura | null>(null)

  useEffect(() => {
    if (transitionTimer.current) clearTimeout(transitionTimer.current)
    transitionTimer.current = null
    setTransitioning(false)
    if (!open) return
    setStep(1)
    setCarta("")
    setResume(null)
    setCheckingResume(false)
    uploadedResume.current = null
    submitLock.current = false
    setError(null)
    setCriada(null)
    setSubmitting(false)
    return () => { if (transitionTimer.current) clearTimeout(transitionTimer.current) }
  }, [open, vaga?.id])

  function changeStep(next: number) {
    if (transitionTimer.current || submitting || loadingProfile || checkingResume) return
    if (reduceMotion) { setStep(next); return }
    setTransitioning(true)
    transitionTimer.current = setTimeout(() => {
      setStep(next)
      setTransitioning(false)
      transitionTimer.current = null
    }, 220)
  }

  const completion = useMemo(() => getProfileCompletion(profile), [profile])

  if (!vaga) return null

  const company = vaga.nomeEmpresa ?? "Empresa confidencial"

  const avancar = () => {
    if (checkingResume) return
    changeStep(Math.min(step + 1, 3))
  }

  const enviar = async () => {
    if (submitLock.current || checkingResume) return
    submitLock.current = true
    setSubmitting(true)
    setError(null)

    try {
      let curriculoUrl = resume?.source === "profile" ? resume.url : undefined
      if (resume?.source === "file") {
        if (!uploadedResume.current) {
          const updated = await uploadCandidateResume(resume.file)
          if (!updated.resumeUrl) throw new Error("O envio do currículo não foi confirmado. Tente novamente.")
          uploadedResume.current = updated.resumeUrl
          await setProfile(updated)
        }
        curriculoUrl = uploadedResume.current
      }
      const candidatura = await criarCandidatura({
        vagaId: vaga.id,
        cartaApresentacao: carta.trim() || undefined,
        curriculoUrl,
      })
      setCriada(candidatura)
      await revalidarCandidatura(candidatura.id)
      onApplied?.(candidatura)
    } catch (requestError) {
      if (isApiError(requestError, 409)) {
        setError(
          getErrorMessage(
            requestError,
            "Você já se candidatou a esta vaga ou ela não está mais aceitando candidaturas.",
          ),
        )
      } else if (isApiError(requestError, 403)) {
        setError("Apenas contas de candidato podem se candidatar a vagas.")
      } else {
        setError(getErrorMessage(requestError, "Não foi possível enviar sua candidatura."))
      }
    } finally {
      submitLock.current = false
      setSubmitting(false)
    }
  }

  if (criada) {
    return (
      <Modal
        open={open}
        onClose={onClose}
        title="Candidatura enviada"
        size="sm"
        footer={
          <>
            <button type="button" onClick={onClose} className="btn-secondary">
              Ver outras vagas
            </button>
            <Link href={`/candidaturas/${criada.id}`} className="btn-primary">
              Acompanhar processo
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </>
        }
      >
        <div className="flex flex-col items-center py-2 text-center">
          <div className="-my-2 flex size-64 items-center justify-center">
            <Lottie
              src={sucessoVagaAnimation}
              loop
              autoplay

              aria-label="Candidatura enviada com sucesso"
              className="size-20"
            />
          </div>

          <h3 className="mt-2 text-lg font-bold tracking-tight text-foreground text-balance">
            Candidatura enviada para {company}
          </h3>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground text-pretty">
            Você entrou na etapa de inscrição de {vaga.titulo}. Cada avanço no processo gera um
            e-mail e aparece no acompanhamento, junto com os feedbacks da empresa.
          </p>
        </div>
      </Modal>
    )
  }

  const footer =
    step === 1 ? (
      <>
        <button type="button" onClick={onClose} className="btn-secondary">
          Cancelar
        </button>
        <button type="button" onClick={avancar} disabled={transitioning || loadingProfile} className="btn-primary min-w-28">
          {transitioning ? "Continuando…" : "Continuar"}
          {transitioning ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : <ArrowRight className="size-4" aria-hidden />}
        </button>
      </>
    ) : step === 2 ? (
      <>
        <button type="button" onClick={() => changeStep(1)} disabled={transitioning || checkingResume} className="btn-secondary">
          <ArrowLeft className="size-4" aria-hidden />
          Voltar
        </button>
        <button type="button" onClick={avancar} disabled={transitioning || checkingResume} className="btn-primary">
          {transitioning ? "Preparando…" : "Revisar"}
          {transitioning ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : <ArrowRight className="size-4" aria-hidden />}
        </button>
      </>
    ) : (
      <>
        <button
          type="button"
          onClick={() => changeStep(2)}
          disabled={submitting || transitioning}
          className="btn-secondary"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Voltar
        </button>
        <button type="button" onClick={() => void enviar()} disabled={submitting} className="btn-primary">
          {submitting && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
          {submitting ? "Enviando" : "Enviar candidatura"}
        </button>
      </>
    )

  return (
    <Modal
      open={open}
      onClose={() => { if (!submitLock.current && !checkingResume) onClose() }}
      title={`Candidatar-se para ${vaga.titulo}`}
      size="md"
      footer={footer}
      header={
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <EntityAvatar name={company} size="sm" />
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-muted-foreground">{company}</p>
              <h2 className="truncate text-sm font-bold tracking-tight text-foreground">
                {vaga.titulo}
              </h2>
            </div>
          </div>
          <StepTrack current={step} />
        </div>
      }
    >
      <div className="relative min-h-[320px]" aria-busy={transitioning}>
        <AnimatePresence>
          {transitioning && <motion.div key="step-loading" role="status" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-card/80 backdrop-blur-[2px]">
            <span className="flex items-center gap-3 rounded-full border border-border bg-card px-5 py-3 text-sm text-muted-foreground shadow-sm"><LoaderCircle className="size-5 animate-spin text-primary" aria-hidden />Preparando próxima etapa…</span>
          </motion.div>}
        </AnimatePresence>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={step} ref={stepContent} tabIndex={-1} className="outline-none"
            initial={{ opacity: 0, y: reduceMotion ? 0 : 10 }} animate={{ opacity: transitioning ? 0.4 : 1, y: 0 }} exit={{ opacity: 0, y: reduceMotion ? 0 : -6 }}
            transition={{ duration: reduceMotion ? 0 : 0.18, ease: "easeOut" }}
            onAnimationComplete={() => { if (!transitioning) stepContent.current?.focus({ preventScroll: true }) }}>

            {step === 1 && (
              <div className="flex flex-col gap-5">
                <div>
                  <h3 className="text-base font-bold tracking-tight text-foreground text-balance">
                    Confira o que a empresa vai ver
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground text-pretty">
                    A {company} recebe o seu perfil junto com a candidatura. Vale um último olhar antes de
                    enviar.
                  </p>
                </div>

                {loadingProfile ? (
                  <div className="flex flex-col gap-3">
                    <Skeleton className="h-20 rounded-card" />
                    <Skeleton className="h-32 rounded-card" />
                  </div>
                ) : (
                  <>
                    <div
                      className={cn(
                        "rounded-card border p-4",
                        completion.ready
                          ? "border-success-border bg-success-subtle"
                          : "border-border bg-muted",
                      )}
                    >
                      <div className="flex items-center justify-between gap-3 text-xs font-bold">
                        <span
                          className={
                            completion.ready ? "text-success-foreground" : "text-strong-foreground"
                          }
                        >
                          Perfil {completion.value}% completo
                        </span>
                        {completion.ready && (
                          <span className="flex items-center gap-1.5 text-success-foreground">
                            <BadgeCheck className="size-4" aria-hidden />
                            Pronto para enviar
                          </span>
                        )}
                      </div>

                      <div
                        role="progressbar"
                        aria-valuenow={completion.value}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label="Progresso do perfil"
                        className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-background"
                      >
                        <div
                          className={cn(
                            "h-full rounded-full transition-[width] duration-500",
                            completion.ready ? "bg-success" : "bg-primary",
                          )}
                          style={{ width: `${completion.value}%` }}
                        />
                      </div>
                    </div>

                    {profile && (
                      <div className="rounded-card border border-border p-4">
                        <div className="flex items-center gap-3">
                          <EntityAvatar name={profile.userName} size="md" className="rounded-full" />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-foreground">
                              {profile.userName || "Minha conta"}
                            </p>
                            <p className="mt-0.5 truncate text-xs text-muted-foreground">
                              {profile.headline || "Sem título profissional"}
                            </p>
                          </div>
                        </div>

                        {(profile.skills ?? []).length > 0 && (
                          <div className="mt-3.5 flex flex-wrap gap-1.5">
                            {(profile.skills ?? []).slice(0, 8).map((skill) => (
                              <Badge key={skill} variant="primary" size="sm">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {completion.missing.length > 0 && (
                      <div className="rounded-card border border-border p-4">
                        <h4 className="flex items-center gap-2 text-sm font-bold text-foreground">
                          <Sparkles className="size-4 text-primary" aria-hidden />
                          Deixe seu perfil mais forte
                        </h4>
                        <ul className="mt-3 flex flex-col gap-2">
                          {completion.missing.slice(0, 4).map((item) => (
                            <li
                              key={item.id}
                              className="flex items-center gap-2.5 text-sm text-muted-foreground"
                            >
                              <span
                                aria-hidden
                                className="grid size-5 shrink-0 place-items-center rounded-full border border-dashed border-border-strong"
                              />
                              <span className="min-w-0 flex-1 text-pretty">{item.label}</span>
                              {item.required && (
                                <Badge variant="warning" size="sm">
                                  Recomendado
                                </Badge>
                              )}
                            </li>
                          ))}
                        </ul>

                        <Link
                          href="/profile/candidato/completar"
                          className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary-hover"
                        >
                          Completar perfil agora
                          <ArrowRight className="size-4" aria-hidden />
                        </Link>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}


            {step === 2 && (
              <div className="flex flex-col gap-5">
                <div>
                  <h3 className="text-base font-bold tracking-tight text-foreground text-balance">
                    Conte por que essa vaga é para você
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground text-pretty">
                    Os dois campos são opcionais, mas uma carta curta e específica é o que mais diferencia
                    candidaturas na triagem.
                  </p>
                </div>

                <Field
                  label="Carta de apresentação"
                  hint={`${carta.length}/${CARTA_MAX} caracteres`}
                >
                  <textarea
                    rows={7}
                    value={carta}
                    maxLength={CARTA_MAX}
                    onChange={(event) => setCarta(event.target.value)}
                    className="field-input resize-none"
                    placeholder={`Ex.: Tenho interesse na vaga de ${vaga.titulo} porque...`}
                  />
                </Field>

                <ApplicationResumePicker existingUrl={profile?.resumeUrl} value={resume} onChange={selection => { setResume(selection); uploadedResume.current = null }} onBusyChange={setCheckingResume} />
              </div>
            )}


            {step === 3 && (
              <div className="flex flex-col gap-5">
                <div>
                  <h3 className="text-base font-bold tracking-tight text-foreground text-balance">
                    Tudo certo para enviar?
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground text-pretty">
                    Depois do envio você acompanha cada etapa e recebe os feedbacks da empresa por aqui.
                  </p>
                </div>

                <dl className="divide-y divide-border-subtle rounded-card border border-border">
                  <div className="flex items-start justify-between gap-4 px-4 py-3">
                    <dt className="text-sm text-muted-foreground">Vaga</dt>
                    <dd className="min-w-0 text-right text-sm font-semibold text-foreground text-pretty">
                      {vaga.titulo}
                    </dd>
                  </div>
                  <div className="flex items-start justify-between gap-4 px-4 py-3">
                    <dt className="text-sm text-muted-foreground">Empresa</dt>
                    <dd className="min-w-0 text-right text-sm font-semibold text-foreground">{company}</dd>
                  </div>
                  <div className="flex items-start justify-between gap-4 px-4 py-3">
                    <dt className="text-sm text-muted-foreground">Formato</dt>
                    <dd className="text-right text-sm font-semibold text-foreground">
                      {MODALIDADE_LABELS[vaga.modalidade]} · {NIVEL_LABELS[vaga.nivelExperiencia]}
                    </dd>
                  </div>
                  {vaga.salario > 0 && (
                    <div className="flex items-start justify-between gap-4 px-4 py-3">
                      <dt className="text-sm text-muted-foreground">Salário</dt>
                      <dd className="text-right text-sm font-semibold text-foreground">
                        {formatCurrency(vaga.salario)}
                      </dd>
                    </div>
                  )}
                  <div className="flex items-start justify-between gap-4 px-4 py-3">
                    <dt className="text-sm text-muted-foreground">Carta</dt>
                    <dd className="text-right text-sm font-semibold text-foreground">
                      {carta.trim() ? `${carta.trim().length} caracteres` : "Não enviada"}
                    </dd>
                  </div>
                  <div className="flex items-start justify-between gap-4 px-4 py-3">
                    <dt className="text-sm text-muted-foreground">Currículo</dt>
                    <dd className="min-w-0 truncate text-right text-sm font-semibold text-foreground">
                      {resume?.source === "file" ? resume.file.name : resume?.source === "profile" ? "Currículo salvo no perfil" : "Não anexado"}
                    </dd>
                  </div>
                </dl>

                {!completion.ready && (
                  <Alert tone="info">
                    Seu perfil está {completion.value}% completo. Você pode enviar agora e completar
                    depois — as empresas veem sempre a versão mais recente.
                  </Alert>
                )}

                {error && (
                  <div className="flex items-start gap-2.5 rounded-xl border border-danger-border bg-danger-subtle px-4 py-3">
                    <CircleAlert className="mt-0.5 size-4 shrink-0 text-danger-foreground" aria-hidden />
                    <p role="alert" className="text-sm font-medium leading-relaxed text-danger-foreground">
                      {error}
                    </p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </Modal>
  )
}
