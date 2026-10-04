"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import {
  ArrowRight,
  BriefcaseBusiness,
  Code2,
  FileText,
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
import { useCandidateProfile, useUpdateCandidateProfile } from "@/lib/queries/use-candidate-profile"
import { getProfileCompletion, type ProfileStepId } from "@/lib/candidate-completion"
import type { CandidateProfile, UpdateCandidateProfileDto } from "@/lib/types/candidate.types"
import { validateProfile } from "@/lib/utils/profile-validation"
import { cn } from "@/lib/utils"
import { EducationFields, LinksFields, ProfileFields } from "./profile-sections"
import { ExperienceEditor } from "./experience-editor"
import { ProjectEditor } from "./project-editor"
import { ResumeUpload } from "./resume-upload"
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
  { id: "curriculo", label: "Currículo", icon: FileText, editavel: false },
  { id: "experiencias", label: "Experiências", icon: BriefcaseBusiness, editavel: false },
  { id: "projetos", label: "Projetos", icon: Code2, editavel: false },
] as const

type SectionId = (typeof SECTIONS)[number]["id"]

function ProfileSkeleton() {
  return (
    <PageShell>
      <div aria-busy="true" aria-live="polite">
        <span className="sr-only">Carregando perfil</span>
        <Skeleton className="h-4 w-24" />
        <Skeleton className="mt-3 h-9 w-56" />
        <div className="mt-8 grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
          <Skeleton className="h-80 rounded-card" />
          <Skeleton className="h-[520px] rounded-card" />
        </div>
      </div>
    </PageShell>
  )
}

export function CandidateProfileScreen() {
  const { profile, loading, error, refetch, setProfile } = useCandidateProfile()

  const [form, setForm] = useState<UpdateCandidateProfileDto>({})
  const [section, setSection] = useState<SectionId>("basico")
  const updateProfile = useUpdateCandidateProfile()
  const saving = updateProfile.isPending
  const initialized = useRef<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof UpdateCandidateProfileDto, string>>>({})
  const [saveError, setSaveError] = useState<string | null>(null)

  // Inicializa por perfil, preservando o rascunho durante uploads e atualizações de coleções.
  useEffect(() => {
    if (profile && initialized.current !== profile.id) { initialized.current = profile.id; setForm(toForm(profile)) }
  }, [profile])

  const completion = useMemo(
    () =>
      getProfileCompletion({
        ...form,
        resumeUrl: profile?.resumeUrl,
        experiences: profile?.experiences,
        projects: profile?.projects,
      }),
    [form, profile],
  )

  if (loading) return <ProfileSkeleton />

  if (!profile && !error) {
    return (
      <PageShell className="max-w-lg py-20">
        <PageHeader title="Vamos criar seu perfil" description="Complete suas informações para se apresentar às empresas." />
        <Link href="/profile/candidato/completar" className="btn-primary mt-6">
          Preencher perfil
          <ArrowRight className="size-4" aria-hidden />
        </Link>
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

  const activeSection = SECTIONS.find((item) => item.id === section)
  const pendentesPorSecao = new Set<ProfileStepId>(completion.missing.map((item) => item.step))

  function aplicarPerfil(atualizado: CandidateProfile) {
    setProfile(atualizado)

  }

  async function salvar(event: React.FormEvent) {
    event.preventDefault()
    setSaveError(null)
    const errors = validateProfile(form)
    setFieldErrors(errors)
    if (Object.keys(errors).length) {
      const first = Object.keys(errors)[0]
      setSection(first === "phone" ? "basico" : ["currentSemester", "expectedGraduationYear"].includes(first) ? "formacao" : "links")
      setSaveError("Revise os campos indicados antes de salvar."); return
    }
    try {
      const updated = await updateProfile.mutateAsync(form)
      aplicarPerfil(updated)
      setForm(toForm(updated))
    } catch (requestError) {
      setSaveError(messageFrom(requestError, "Não foi possível salvar as alterações."))
    }
  }

  const dirty = JSON.stringify(form) !== JSON.stringify(toForm(profile))

  return (
    <PageShell className="candidate-profile min-w-0 max-w-[1440px]">
      <PageHeader
        eyebrow="Sua conta"
        title="Meu perfil"
        description="É este perfil que a empresa vê quando você se candidata a uma vaga."

      />

      <div className="mt-6 grid min-w-0 items-start gap-5 sm:mt-8 sm:gap-7 xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="flex min-w-0 flex-col gap-5 xl:sticky xl:top-24">
          <div className="rounded-card border border-border bg-card p-5 shadow-card">
            <div className="flex items-center gap-3">
              {profile.profileImageUrl ? <img src={profile.profileImageUrl} alt="Sua foto de perfil" className="size-14 shrink-0 rounded-full object-cover" /> : <EntityAvatar name={profile.userName} size="lg" className="rounded-full" />}
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
                  {completion.complete ? "Perfil completo" : "Preenchimento do perfil"}
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
                      <div className="flex items-center justify-between gap-2 text-xs font-semibold text-muted-foreground">
                        <span className="min-w-0 truncate">{item.label}</span>
                      </div>
                    </li>
                  ))}
                  {completion.missing.length > 4 && (
                    <li className="text-xs text-subtle-foreground">
                      +{completion.missing.length - 4} pendentes
                    </li>
                  )}
                  <li className="pt-2">
                    <Link href="/profile/candidato/completar" className="btn-primary w-full">
                      Completar perfil
                      <ArrowRight className="size-4" aria-hidden />
                    </Link>
                  </li>
                </ul>
              )}
            </div>
          </div>

          <label className="block xl:hidden"><span className="mb-2 block text-sm font-semibold">O que você quer editar?</span><select className="field-input" value={section} disabled={busy || saving} onChange={event => {setSection(event.target.value as SectionId);setSaveError(null);setFieldErrors({})}}>{SECTIONS.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
          <nav
            aria-label="Seções do perfil"
            className="hidden flex-col gap-1 rounded-xl border border-border bg-card p-2 xl:flex"
          >
            {SECTIONS.map((item) => {
              const active = section === item.id
              const pendente = item.id !== "curriculo" && pendentesPorSecao.has(item.id)

              return (
                <button
                  key={item.id}
                  type="button"
                  disabled={busy || saving}
                  onClick={() => {setSection(item.id);setSaveError(null);setFieldErrors({})}}
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

        <section className="min-w-0 overflow-hidden rounded-2xl border border-border bg-card shadow-card">
          <header className="flex items-center justify-between gap-4 border-b border-border px-5 py-5 sm:px-7">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-foreground">
                {activeSection?.label}
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {activeSection?.editavel ? "Edite seus dados e salve as alterações." : "As alterações desta seção são salvas automaticamente."}
              </p>
            </div>
          </header>

          <form onSubmit={salvar} noValidate>
            <div className="min-w-0 px-4 py-6 sm:px-8 sm:py-8">
              {section === "basico" && (
                <ProfileFields errors={fieldErrors} onUploadingChange={setBusy} onProfileUpdated={aplicarPerfil} form={form} setForm={setForm} profile={profile} />
              )}

              {section === "formacao" && <EducationFields errors={fieldErrors} form={form} setForm={setForm} />}

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

              {section === "links" && <LinksFields errors={fieldErrors} form={form} setForm={setForm} />}

              {section === "curriculo" && (
                <ResumeUpload profile={profile} onProfileChange={aplicarPerfil} onUploadingChange={setBusy} />
              )}

              {section === "experiencias" && (
                <ExperienceEditor
                  onEditingChange={setBusy}
                  experiences={profile.experiences ?? []}
                  onProfileChange={aplicarPerfil}
                />
              )}

              {section === "projetos" && (
                <ProjectEditor onEditingChange={setBusy} projects={profile.projects ?? []} onProfileChange={aplicarPerfil} />
              )}

              {saveError && (
                <div className="mt-6">
                  <Alert tone="danger">{saveError}</Alert>
                </div>
              )}
            </div>

            {activeSection?.editavel && (
              <footer className="flex flex-wrap items-center gap-3 border-t border-border bg-muted/30 px-4 py-4 sm:px-8">
                <p role="status" className="w-full text-xs text-muted-foreground sm:mr-auto sm:w-auto">{dirty ? "Alterações ainda não salvas" : "Suas informações estão salvas"}</p>
                <button
                  type="button"
                  onClick={() => {setForm(toForm(profile));setFieldErrors({});setSaveError(null)}}
                  className="btn-ghost"
                  disabled={saving || busy || !dirty}
                >
                  Descartar
                </button>
                <button type="submit" className="btn-primary" disabled={saving || busy || !dirty}>
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
