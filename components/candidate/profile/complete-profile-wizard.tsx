"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Check,
  Loader2,
  PartyPopper,
} from "lucide-react"
import { PageShell } from "@/components/ui/page"
import { Badge } from "@/components/ui/badge"
import { Field, InputWithIcon } from "@/components/ui/form-field"
import { Alert, ErrorState, Skeleton } from "@/components/ui/states"
import { MapPin, Phone } from "lucide-react"
import { updateCandidateProfileMe } from "@/lib/services/candidate.service"
import { useCandidateProfile } from "@/lib/hooks/useCandidateProfile"
import {
  PROFILE_STEPS,
  getProfileCompletion,
  type ProfileStepId,
} from "@/lib/candidate-completion"
import type { CandidateProfile, UpdateCandidateProfileDto } from "@/lib/types/candidate.types"
import { cn } from "@/lib/utils"
import { ExperienceEditor } from "./experience-editor"
import { ProjectEditor } from "./project-editor"
import { SkillsInput } from "./skills-input"
import { messageFrom, toForm } from "./profile-form.utils"

const LINKS = [
  { key: "linkedinUrl", label: "LinkedIn", placeholder: "https://linkedin.com/in/seu-perfil" },
  { key: "githubUrl", label: "GitHub", placeholder: "https://github.com/seu-usuario" },
  { key: "portfolioUrl", label: "Portfólio", placeholder: "https://seu-site.com" },
] as const

/**
 * Fluxo guiado de preenchimento do perfil.
 * Cada passo salva ao avançar, então sair no meio nunca perde o que já foi
 * escrito — e o candidato pode voltar depois exatamente de onde parou.
 */
export function CompleteProfileWizard() {
  const router = useRouter()
  const { profile, loading, error, refetch, setProfile } = useCandidateProfile()

  const [indice, setIndice] = useState(0)
  const [rascunho, setRascunho] = useState<UpdateCandidateProfileDto>({})
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [concluido, setConcluido] = useState(false)

  // O rascunho nasce do perfil carregado e é ressincronizado quando uma
  // operação de coleção devolve o perfil inteiro.
  useEffect(() => {
    if (profile) setRascunho(toForm(profile))
  }, [profile])

  const completion = useMemo(
    () =>
      getProfileCompletion({
        ...rascunho,
        experiences: profile?.experiences,
        projects: profile?.projects,
      }),
    [rascunho, profile],
  )

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

  /** Persiste o rascunho. Passos de coleção já salvam sozinhos. */
  async function salvarRascunho() {
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

  async function avancar() {
    const precisaSalvar = ["basico", "formacao", "skills", "links"].includes(step.id)
    if (precisaSalvar && !(await salvarRascunho())) return

    if (ultimo) {
      setConcluido(true)
      return
    }
    setIndice((valor) => valor + 1)
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
              : `Faltam ${completion.missingRequired.length} ${
                  completion.missingRequired.length === 1 ? "item obrigatório" : "itens obrigatórios"
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
    <PageShell className="max-w-4xl">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary-subtle-foreground">
          Passo {indice + 1} de {PROFILE_STEPS.length}
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground text-balance sm:text-3xl">
          {step.title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground text-pretty">
          {step.description}
        </p>
      </header>

      <StepTrail
        atual={step.id}
        onSelect={(id) => setIndice(PROFILE_STEPS.findIndex((item) => item.id === id))}
        className="mt-6"
      />

      <div className="mt-6 overflow-hidden rounded-card border border-border bg-card shadow-card">
        <div className="border-b border-border-subtle px-5 py-3.5 sm:px-7">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-strong-foreground">Perfil completo</span>
            <span className="tabular-nums text-strong-foreground">{completion.value}%</span>
          </div>
          <div
            role="progressbar"
            aria-valuenow={completion.value}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Progresso de preenchimento do perfil"
            className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"
          >
            <div
              className={cn(
                "h-full rounded-full transition-[width] duration-500",
                completion.complete ? "bg-success" : "bg-primary",
              )}
              style={{ width: `${completion.value}%` }}
            />
          </div>
        </div>

        <div className="px-5 py-7 sm:px-7">
          <AnimatePresence mode="wait">
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.18 }}
            >
              {step.id === "basico" && (
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Nome" hint="Gerenciado pela sua conta.">
                    <input value={profile.userName || ""} disabled className="field-input" />
                  </Field>
                  <Field label="E-mail" hint="Gerenciado pela sua conta.">
                    <input value={profile.userEmail || ""} disabled className="field-input" />
                  </Field>

                  <Field
                    label="Título profissional"
                    wide
                    hint="Uma linha que resume o que você faz ou quer fazer."
                  >
                    <input
                      className="field-input"
                      value={rascunho.headline || ""}
                      onChange={(event) => atualizar({ headline: event.target.value })}
                      placeholder="Ex.: Desenvolvedor Front-end Júnior"
                    />
                  </Field>

                  <Field label="Sobre você" wide hint="Trajetória, interesses e o que você busca.">
                    <textarea
                      rows={5}
                      className="field-input resize-y"
                      value={rascunho.summary || ""}
                      onChange={(event) => atualizar({ summary: event.target.value })}
                      placeholder="Ex.: Estudante de Engenharia de Software no 5º semestre, focado em front-end."
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

                  <Field label="Localização">
                    <div className="grid grid-cols-[1fr_88px] gap-2">
                      <InputWithIcon
                        icon={MapPin}
                        value={rascunho.city || ""}
                        onChange={(event) => atualizar({ city: event.target.value })}
                        placeholder="Cidade"
                        aria-label="Cidade"
                      />
                      <input
                        className="field-input"
                        value={rascunho.state || ""}
                        onChange={(event) =>
                          atualizar({ state: event.target.value.toUpperCase().slice(0, 2) })
                        }
                        placeholder="UF"
                        aria-label="Estado (UF)"
                      />
                    </div>
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
                      placeholder="Ex.: Ciência da Computação"
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

              {step.id === "links" && (
                <div className="flex max-w-xl flex-col gap-5">
                  {LINKS.map((link) => (
                    <Field key={link.key} label={link.label}>
                      <input
                        type="url"
                        className="field-input"
                        value={(rascunho[link.key] as string) || ""}
                        onChange={(event) => atualizar({ [link.key]: event.target.value })}
                        placeholder={link.placeholder}
                      />
                    </Field>
                  ))}
                </div>
              )}

              {step.id === "experiencias" && (
                <ExperienceEditor
                  experiences={profile.experiences ?? []}
                  onProfileChange={aplicarPerfil}
                />
              )}

              {step.id === "projetos" && (
                <ProjectEditor projects={profile.projects ?? []} onProfileChange={aplicarPerfil} />
              )}

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

                  <ResumoPerfil profile={profile} form={rascunho} />
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {saveError && (
            <div className="mt-6">
              <Alert tone="danger">{saveError}</Alert>
            </div>
          )}
        </div>

        <footer className="flex flex-col gap-3 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <button
            type="button"
            onClick={() => (indice === 0 ? router.push("/profile/candidato") : setIndice(indice - 1))}
            className="btn-ghost sm:order-1"
            disabled={saving}
          >
            <ArrowLeft className="size-4" aria-hidden />
            {indice === 0 ? "Sair" : "Voltar"}
          </button>

          <div className="flex gap-2 sm:order-3">
            {!ultimo && (
              <button
                type="button"
                onClick={() => setIndice(indice + 1)}
                className="btn-secondary"
                disabled={saving}
              >
                Depois
              </button>
            )}
            <button type="button" onClick={avancar} className="btn-primary" disabled={saving}>
              {saving && <Loader2 className="size-4 animate-spin" aria-hidden />}
              {ultimo ? "Concluir" : "Salvar e continuar"}
              {!ultimo && <ArrowRight className="size-4" aria-hidden />}
            </button>
          </div>
        </footer>
      </div>
    </PageShell>
  )
}

/** Trilha clicável dos passos. */
function StepTrail({
  atual,
  onSelect,
  className,
}: {
  atual: ProfileStepId
  onSelect: (id: ProfileStepId) => void
  className?: string
}) {
  const atualIndice = PROFILE_STEPS.findIndex((item) => item.id === atual)

  return (
    <nav aria-label="Passos do perfil" className={className}>
      <ol className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1">
        {PROFILE_STEPS.map((item, index) => {
          const ativo = index === atualIndice
          const passado = index < atualIndice

          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onSelect(item.id)}
                aria-current={ativo ? "step" : undefined}
                className={cn(
                  "flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-bold transition-colors",
                  ativo
                    ? "bg-primary text-primary-foreground"
                    : passado
                      ? "bg-success-subtle text-success-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground",
                )}
              >
                {passado ? (
                  <Check className="size-3.5" aria-hidden />
                ) : (
                  <span className="tabular-nums">{index + 1}</span>
                )}
                {item.label}
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

/** Pré-visualização do que a empresa vê. */
function ResumoPerfil({
  profile,
  form,
}: {
  profile: CandidateProfile
  form: UpdateCandidateProfileDto
}) {
  const local = [form.city, form.state].filter(Boolean).join(" · ")

  return (
    <section className="rounded-card border border-border bg-card p-5">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-subtle-foreground">
        <BadgeCheck className="size-4" aria-hidden />
        Como a empresa vê você
      </div>

      <h3 className="mt-4 text-base font-bold tracking-tight text-foreground text-pretty">
        {profile.userName || "Seu nome"}
      </h3>
      <p className="mt-0.5 text-sm font-semibold text-primary-subtle-foreground text-pretty">
        {form.headline || "Título profissional não informado"}
      </p>
      {local && <p className="mt-1 text-xs text-muted-foreground">{local}</p>}

      {form.summary && (
        <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-strong-foreground text-pretty">
          {form.summary}
        </p>
      )}

      {(form.skills ?? []).length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {(form.skills ?? []).map((skill) => (
            <Badge key={skill} variant="primary" size="sm">
              {skill}
            </Badge>
          ))}
        </div>
      )}

      <dl className="mt-5 grid gap-3 border-t border-border-subtle pt-4 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-semibold text-subtle-foreground">Formação</dt>
          <dd className="mt-0.5 text-sm text-strong-foreground text-pretty">
            {[form.course, form.institution].filter(Boolean).join(" · ") || "Não informada"}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold text-subtle-foreground">Experiências e projetos</dt>
          <dd className="mt-0.5 text-sm text-strong-foreground">
            {(profile.experiences?.length ?? 0)} · {(profile.projects?.length ?? 0)}
          </dd>
        </div>
      </dl>
    </section>
  )
}
