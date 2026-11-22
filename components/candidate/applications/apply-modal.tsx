"use client"
import { ROUTES } from "@/lib/config/routes"

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
  MapPin,
  UserRound,
  Wallet,
} from "lucide-react"
import { EntityAvatar } from "@/components/ui/entity-avatar"
import { Modal } from "@/components/ui/modal"
import { Field } from "@/components/ui/form-field"
import { Alert, Skeleton } from "@/components/ui/states"
import { Badge } from "@/components/ui/badge"
import { TickBar } from "@/components/ui/tick-bar"
import { useCandidateProfile, useUploadCandidateResume } from "@/lib/queries/use-candidate-profile"
import { useCriarCandidatura } from "@/lib/queries/use-candidaturas"
import { ApplicationResumePicker, type ResumeSelection } from "./application-resume-picker"
import { getProfileCompletion } from "@/lib/candidate-completion"
import { getErrorMessage, isApiError } from "@/lib/errors"
import { formatCurrency } from "@/lib/format"
import { MODALIDADE_LABELS } from "@/lib/types/vaga.types"
import type { Vaga } from "@/lib/types/vaga.types"
import type { Candidatura } from "@/lib/types/candidatura.types"
import { cn } from "@/lib/utils"
import sucessoVagaAnimation from "@/public/images/sucesso_vaga.json"
import { CompanyLogo } from "@/components/shared/company-logo"
import styles from "./apply-modal.module.css"

const STEPS = [
  { id: 1, label: "Perfil", icon: UserRound },
  { id: 2, label: "Candidatura", icon: FileText },
  { id: 3, label: "Revisão", icon: BadgeCheck },
] as const

const CARTA_MAX = 2000

function StepTrack({ current }: { current: number }) {
  return (
    <ol aria-label={`Etapa ${current} de ${STEPS.length}`} className="flex items-center">
      {STEPS.map((step, index) => {
        const active = step.id === current
        const done = step.id < current
        return (
          <li key={step.id} aria-current={active ? "step" : undefined} className={cn("flex items-center", index < STEPS.length - 1 && "flex-1")}>
            <span className="flex items-center gap-2">
              <span
                aria-hidden
                className={cn(
                  "grid size-8 shrink-0 place-items-center rounded-full text-xs font-semibold tabular-nums transition-colors",
                  active ? "bg-primary text-primary-foreground ring-4 ring-primary/15" : done ? "bg-mint text-ink" : "border border-border bg-card text-muted-foreground",
                )}
              >
                {done ? <Check className="size-3.5" strokeWidth={3} /> : step.id}
              </span>
              <span className={cn("text-xs font-medium transition-colors", active ? "text-ink" : done ? "text-strong-foreground" : "text-muted-foreground")}>
                {step.label}
                {done && <span className="sr-only"> (concluída)</span>}
              </span>
            </span>
            {index < STEPS.length - 1 && (
              <span aria-hidden className={cn("mx-3 h-0.5 flex-1 rounded-full transition-colors", done ? "bg-mint" : "bg-border")} />
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
  const { profile, loading: loadingProfile } = useCandidateProfile()
  const uploadResume = useUploadCandidateResume({ silent: true })
  const criarCandidatura = useCriarCandidatura()
  const reduceMotion = useReducedMotion()
  const stepContent = useRef<HTMLDivElement>(null)


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
  }, [open, vaga?.id])

  function changeStep(next: number) {
    if (submitting || loadingProfile || checkingResume) return
    setStep(next)
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
          const updated = await uploadResume.mutateAsync(resume.file)
          if (!updated.resumeUrl) throw new Error("O envio do currículo não foi confirmado. Tente novamente.")
          uploadedResume.current = updated.resumeUrl
        }
        curriculoUrl = uploadedResume.current ?? undefined
      }
      const candidatura = await criarCandidatura.mutateAsync({
        vagaId: vaga.id,
        cartaApresentacao: carta.trim() || undefined,
        curriculoUrl,
      })
      setCriada(candidatura)
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
        className={styles.dialog}
        footer={
          <>
            <button type="button" onClick={onClose} className="btn-secondary rounded-full">
              Ver outras vagas
            </button>
            <Link href={ROUTES.candidate.application(criada.id)} className="btn-primary rounded-full px-5">
              Acompanhar processo
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </>
        }
      >
        <div className="flex flex-col items-center py-2 text-center">
          <div className="flex size-48 items-center justify-center">
            {reduceMotion ? <BadgeCheck aria-hidden className="size-24 text-success" /> : <Lottie
              src={sucessoVagaAnimation}
              loop={true}
              autoplay
              aria-label="Candidatura enviada com sucesso"
              className="size-32"
            />}
          </div>

          <h3 className="mt-1 text-lg font-semibold tracking-tight text-foreground text-balance">
            Você fez a sua parte! Agora é com a {company}
          </h3>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground text-pretty">
            Sua candidatura para {vaga.titulo} foi recebida. Acompanhe as próximas etapas e os feedbacks da empresa pelo seu painel.
          </p>
        </div>
      </Modal>
    )
  }

  const footer =
    step === 1 ? (
      <>
        <button type="button" onClick={onClose} className="btn-ghost rounded-full">
          Cancelar
        </button>
        <button type="button" onClick={avancar} disabled={loadingProfile} className="btn-primary min-w-32 rounded-full px-5">
          Continuar
          <ArrowRight className="size-4" aria-hidden />
        </button>
      </>
    ) : step === 2 ? (
      <>
        <button type="button" onClick={() => changeStep(1)} disabled={checkingResume} className="btn-ghost rounded-full">
          <ArrowLeft className="size-4" aria-hidden />
          Voltar
        </button>
        <button type="button" onClick={avancar} disabled={checkingResume} className="btn-primary min-w-32 rounded-full px-5">
          {checkingResume ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : null}
          {checkingResume ? "Verificando arquivo..." : "Revisar candidatura"}
          {!checkingResume && <ArrowRight className="size-4" aria-hidden />}
        </button>
      </>
    ) : (
      <>
        <button
          type="button"
          onClick={() => changeStep(2)}
          disabled={submitting}
          className="btn-ghost rounded-full"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Voltar
        </button>
        <button type="button" onClick={() => void enviar()} disabled={submitting} className="btn-primary rounded-full px-5">
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
      className={cn(styles.dialog, "sm:max-w-[600px] sm:rounded-[28px]")}
      bodyClassName="bg-surface"
      footer={footer}
      footerStart={<span className="text-xs">Etapa <span className="font-semibold text-foreground">{step}</span> de 3</span>}
      header={
        <div className="flex flex-col gap-5">
          <div className="flex items-start gap-4">
            <CompanyLogo name={company} url={vaga.logoUrlEmpresa} size="lg" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-muted-foreground">Candidatura para {company}</p>
              <h2 className="mt-0.5 text-lg font-semibold leading-snug tracking-tight text-ink">{vaga.titulo}</h2>
              <p className="mt-2.5 flex flex-wrap items-center gap-1.5 text-xs text-strong-foreground [&>span]:inline-flex [&>span]:min-h-7 [&>span]:items-center [&>span]:rounded-full [&>span]:bg-surface [&>span]:px-2.5">
                <span>{MODALIDADE_LABELS[vaga.modalidade]}</span>
                {vaga.cidade && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin aria-hidden className="size-3" />
                    {[vaga.cidade, vaga.estado].filter(Boolean).join(", ")}
                  </span>
                )}
                <span className="inline-flex items-center gap-1">
                  <Wallet aria-hidden className="size-3" />
                  {vaga.salarioACombinar || !(vaga.salario > 0) ? "A combinar" : formatCurrency(vaga.salario)}
                </span>
              </p>
            </div>
          </div>
          <StepTrack current={step} />
        </div>
      }
    >
      <div className="relative">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={step} ref={stepContent} tabIndex={-1} className="outline-none"
            initial={{ opacity: 0, x: reduceMotion ? 0 : 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: reduceMotion ? 0 : -12 }}
            transition={{ duration: reduceMotion ? 0 : 0.16, ease: "easeOut" }}
            onAnimationComplete={() => stepContent.current?.focus({ preventScroll: true })}>

            {step === 1 && (
              <div className="flex flex-col gap-5">
                <div>
                  <h3 className="text-base font-semibold tracking-tight text-foreground text-balance">
                    Confira o que a empresa vai ver
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground text-pretty">
                    Seu perfil será compartilhado com a {company}. Confira suas informações antes de continuar.
                  </p>
                </div>

                {loadingProfile ? (
                  <div className="flex flex-col gap-3">
                    <Skeleton className="h-20 rounded-card" />
                    <Skeleton className="h-32 rounded-card" />
                  </div>
                ) : (
                  <>
                    <div className="rounded-2xl border border-border/60 bg-card p-4">
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="font-semibold text-ink">Perfil {completion.value}% completo</span>
                        {completion.ready && (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-mint-strong">
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
                        className="mt-3"
                      >
                        <TickBar value={completion.value} ticks={32} className="h-5" />
                      </div>
                    </div>

                    {profile && (
                      <div className="rounded-2xl border border-border/60 bg-card p-4">
                        <div className="flex items-center gap-3">
                          <EntityAvatar name={profile.userName} src={profile.profileImageUrl} size="md" className="size-12 rounded-full" />
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
                            {(profile.skills ?? []).slice(0, 8).map((skill: string) => (
                              <Badge key={skill} variant="primary" size="sm">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {completion.missing.length > 0 && (
                      <details className="rounded-2xl border border-border/60 bg-card p-4">
                        <summary className="cursor-pointer text-xs font-semibold text-strong-foreground">
                          Oportunidades para melhorar seu perfil ({completion.missing.length})
                        </summary>
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
                          href={ROUTES.candidate.completeProfile}
                          className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary-hover"
                        >
                          Completar perfil agora
                          <ArrowRight className="size-4" aria-hidden />
                        </Link>
                      </details>
                    )}
                  </>
                )}
              </div>
            )}


            {step === 2 && (
              <div className="flex flex-col gap-5">
                <div>
                  <h3 className="text-base font-semibold tracking-tight text-foreground text-balance">
                    Conte por que essa vaga é para você
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground text-pretty">
                    A carta e o currículo são opcionais. Use este espaço para apresentar seu interesse na oportunidade.
                  </p>
                </div>

                <Field
                  label="Carta de apresentação (opcional)"
                  hint={`${carta.length}/${CARTA_MAX} caracteres`}
                >
                  <textarea
                    rows={5}
                    value={carta}
                    maxLength={CARTA_MAX}
                    onChange={(event) => setCarta(event.target.value)}
                    className="field-input resize-y bg-card"
                    placeholder={`Ex.: Tenho interesse na vaga de ${vaga.titulo} porque...`}
                  />
                </Field>

                <ApplicationResumePicker existingUrl={profile?.resumeUrl} value={resume} onChange={selection => { setResume(selection); uploadedResume.current = null }} onBusyChange={setCheckingResume} />
              </div>
            )}


            {step === 3 && (
              <div className="flex flex-col gap-5">
                <div>
                  <h3 className="text-base font-semibold tracking-tight text-foreground text-balance">
                    Tudo certo para enviar?
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground text-pretty">
                    Depois do envio você acompanha cada etapa e recebe os feedbacks da empresa por aqui.
                  </p>
                </div>

                <dl className="divide-y divide-border-subtle overflow-hidden rounded-2xl border border-border/60 bg-card">
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
                      {MODALIDADE_LABELS[vaga.modalidade]}
                    </dd>
                  </div>
                  {vaga.salario > 0 && !vaga.salarioACombinar && (
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
