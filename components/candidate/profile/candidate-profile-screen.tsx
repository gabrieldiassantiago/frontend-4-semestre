"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  ArrowRight,
  BriefcaseBusiness,
  Check,
  Code2,
  GraduationCap,
  Link2,
  LoaderCircle,
  Sparkles,
  UserRound,
} from "lucide-react"
import { PageHeader, PageShell } from "@/components/ui/page"
import { Alert, ErrorState, Skeleton } from "@/components/ui/states"
import { EntityAvatar } from "@/components/ui/entity-avatar"
import { Field } from "@/components/ui/form-field"
import { updateCandidateProfileMe } from "@/lib/services/candidate.service"
import { useCandidateProfile } from "@/lib/hooks/useCandidateProfile"
import { getProfileCompletion, type ProfileStepId } from "@/lib/candidate-completion"
import type { CandidateProfile, UpdateCandidateProfileDto } from "@/lib/types/candidate.types"
import { cn } from "@/lib/utils"
import { EducationFields, LinksFields, ProfileFields } from "./profile-sections"
import { ExperienceEditor } from "./experience-editor"
import { ProjectEditor } from "./project-editor"
import { SkillsInput } from "./skills-input"
import { messageFrom, toForm } from "./profile-form.utils"

/**
 * Seções da tela de perfil. Cada uma mapeia para o passo equivalente do
 * wizard, então o checklist de pendências consegue levar a pessoa direto ao
 * lugar certo, seja aqui ou no fluxo guiado.
 */
const SECTIONS = [
  { id: "basico", label: "Sobre você", icon: UserRound, editavel: true },
  { id: "formacao", label: "Formação", icon: GraduationCap, editavel: true },
  { id: "skills", label: "Habilidades", icon: Sparkles, editavel: true },
  { id: "links", label: "Links", icon: Link2, editavel: true },
  { id: "experiencias", label: "Experiências", icon: BriefcaseBusiness, editavel: false },
  { id: "projetos", label: "Projetos", icon: Code2, editavel: false },
] as const

type SectionId = (typeof SECTIONS)[number]["id"]

function ProfileSkeleton() {
  return (
    <PageShell aria-busy="true">
      <span className="sr-only">Carregando perfil</span>
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-3 h-9 w-56" />
      <div className="mt-8 grid gap-6 lg:grid-cols-[300px_1fr]">
        <Skeleton className="h-80 rounded-card" />
        <Skeleton className="h-[520px] rounded-card" />
      </div>
    </PageShell>
  )
}

export function CandidateProfileScreen() {
  const { profile, loading, error, refetch, setProfile } = useCandidateProfile()

  const [form, setForm] = useState<UpdateCandidateProfileDto>({})
  const [section, setSection] = useState<SectionId>("basico")
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  // Sincroniza o rascunho quando o perfil chega ou é substituído por uma
  // operação de coleção (experiência/projeto devolvem o perfil inteiro).
  useEffect(() => {
    if (profile) setForm(toForm(profile))
  }, [profile])

  const completion = useMemo(
    () =>
      getProfileCompletion({
        ...form,
        experiences: profile?.experiences,
        projects: profile?.projects,
      }),
    [form, profile],
  )

  if (loading) return <ProfileSkeleton />

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

  const activeSection = SECTIONS.find((item) => item.id === section)
  const pendentesPorSecao = new Set<ProfileStepId>(completion.missing.map((item) => item.step))

  function aplicarPerfil(atualizado: CandidateProfile) {
    setProfile(atualizado)
    setForm(toForm(atualizado))
  }

  async function salvar(event: React.FormEvent) {
    event.preventDefault()
    setSaving(true)
    setSaveError(null)
    try {
      aplicarPerfil(await updateCandidateProfileMe(form))
      setSaved(true)
      window.setTimeout(() => setSaved(false), 2500)
    } catch (requestError) {
      setSaveError(messageFrom(requestError, "Não foi possível salvar as alterações."))
    } finally {
      setSaving(false)
    }
  }

  return (
    <PageShell>
      <PageHeader
        eyebrow="Sua conta"
        title="Meu perfil"
        description="É este perfil que a empresa vê quando você se candidata a uma vaga."
        actions={
          !completion.complete ? (
            <Link href="/profile/candidato/completar" className="btn-primary">
              Completar perfil
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          ) : undefined
        }
      />

      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[300px_1fr]">
        <aside className="flex flex-col gap-5 lg:sticky lg:top-24">
          <div className="rounded-card border border-border bg-card p-5 shadow-card">
            <div className="flex items-center gap-3">
              <EntityAvatar name={profile.userName} size="lg" className="rounded-full" />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-foreground">
                  {profile.userName || "Minha conta"}
                </p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">{profile.userEmail}</p>
              </div>
            </div>

            <div
              className={cn(
                "mt-5 rounded-xl border p-4",
                completion.complete
                  ? "border-success-border bg-success-subtle"
                  : "border-border bg-muted",
              )}
            >
              <div className="flex items-center justify-between text-xs font-bold">
                <span
                  className={
                    completion.complete ? "text-success-foreground" : "text-strong-foreground"
                  }
                >
                  Perfil completo
                </span>
                <span
                  className={cn(
                    "tabular-nums",
                    completion.complete ? "text-success-foreground" : "text-strong-foreground",
                  )}
                >
                  {completion.value}%
                </span>
              </div>

              <div
                role="progressbar"
                aria-valuenow={completion.value}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Progresso de preenchimento do perfil"
                className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-background"
              >
                <div
                  className={cn(
                    "h-full rounded-full transition-[width] duration-500",
                    completion.complete ? "bg-success" : "bg-primary",
                  )}
                  style={{ width: `${completion.value}%` }}
                />
              </div>

              {completion.missing.length > 0 && (
                <ul className="mt-3.5 flex flex-col gap-1.5">
                  {completion.missing.slice(0, 4).map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => setSection(item.step as SectionId)}
                        className="flex w-full items-center justify-between gap-2 text-left text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <span className="min-w-0 truncate">{item.label}</span>
                        <span className="shrink-0 text-primary">Preencher</span>
                      </button>
                    </li>
                  ))}
                  {completion.missing.length > 4 && (
                    <li className="text-xs text-subtle-foreground">
                      +{completion.missing.length - 4} pendentes
                    </li>
                  )}
                </ul>
              )}
            </div>
          </div>

          <nav
            aria-label="Seções do perfil"
            className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1 lg:mx-0 lg:flex-col lg:px-0"
          >
            {SECTIONS.map((item) => {
              const active = section === item.id
              const pendente = pendentesPorSecao.has(item.id)

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSection(item.id)}
                  aria-current={active ? "true" : undefined}
                  className={cn(
                    "flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-lg px-3.5 py-2.5 text-sm font-semibold transition-colors lg:w-full",
                    active
                      ? "bg-primary-subtle text-primary-subtle-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <item.icon className="size-[18px]" aria-hidden />
                  <span className="flex-1 text-left">{item.label}</span>
                  {pendente && (
                    <span
                      className="size-1.5 shrink-0 rounded-full bg-warning"
                      aria-label="Tem informação pendente"
                    />
                  )}
                </button>
              )
            })}
          </nav>
        </aside>

        <section className="overflow-hidden rounded-card border border-border bg-card shadow-card">
          <header className="flex items-center justify-between gap-4 border-b border-border px-5 py-5 sm:px-7">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-foreground">
                {activeSection?.label}
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Mantenha suas informações verdadeiras e atualizadas.
              </p>
            </div>
            {saved && (
              <span
                role="status"
                className="flex shrink-0 items-center gap-1.5 text-xs font-bold text-success-foreground"
              >
                <Check className="size-4" aria-hidden />
                Salvo
              </span>
            )}
          </header>

          <form onSubmit={salvar}>
            <div className="px-5 py-7 sm:px-7">
              {section === "basico" && (
                <ProfileFields form={form} setForm={setForm} profile={profile} />
              )}

              {section === "formacao" && <EducationFields form={form} setForm={setForm} />}

              {section === "skills" && (
                <div className="max-w-3xl">
                  <Field
                    label="Suas habilidades"
                    hint="Inclua ao menos três. Elas aparecem no seu perfil para as empresas."
                  >
                    <SkillsInput
                      skills={form.skills ?? []}
                      onChange={(skills) => setForm({ ...form, skills })}
                    />
                  </Field>
                </div>
              )}

              {section === "links" && <LinksFields form={form} setForm={setForm} />}

              {section === "experiencias" && (
                <ExperienceEditor
                  experiences={profile.experiences ?? []}
                  onProfileChange={aplicarPerfil}
                />
              )}

              {section === "projetos" && (
                <ProjectEditor projects={profile.projects ?? []} onProfileChange={aplicarPerfil} />
              )}

              {saveError && (
                <div className="mt-6">
                  <Alert tone="danger">{saveError}</Alert>
                </div>
              )}
            </div>

            {activeSection?.editavel && (
              <footer className="flex items-center justify-end gap-3 border-t border-border px-5 py-4 sm:px-7">
                <button
                  type="button"
                  onClick={() => setForm(toForm(profile))}
                  className="btn-ghost"
                  disabled={saving}
                >
                  Descartar
                </button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
                  {saving ? "Salvando" : "Salvar alterações"}
                </button>
              </footer>
            )}
          </form>
        </section>
      </div>
    </PageShell>
  )
}
