"use client"
import { ROUTES } from "@/lib/config/routes"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { ArrowRight, CheckCircle2, Eye, LoaderCircle } from "lucide-react"
import { PageHeader, PageShell } from "@/components/ui/page"
import { Alert, ErrorState, Skeleton } from "@/components/ui/states"
import { Field } from "@/components/ui/form-field"
import { useCandidateProfile, useUpdateCandidateProfile } from "@/lib/queries/use-candidate-profile"
import { getProfileCompletion } from "@/lib/candidate-completion"
import type { UpdateCandidateProfileDto } from "@/lib/types/candidate.types"
import { validateProfile } from "@/lib/utils/profile-validation"
import { cn } from "@/lib/utils"
import { EducationFields, LinksFields, ProfileFields } from "./profile-sections"
import { ExperienceEditor } from "./experience-editor"
import { ProjectEditor } from "./project-editor"
import { ProfilePreview } from "./profile-preview"
import { ResumeUpload } from "./resume-upload"
import { SkillsInput } from "./skills-input"
import { messageFrom, toForm } from "./profile-form.utils"
import { PROFILE_SECTIONS, sectionForField, type ProfileSectionId } from "./screen/profile-sections.config"
import { ProfileSectionNav } from "./screen/profile-section-nav"
import { ProfileSummaryCard } from "./screen/profile-summary-card"

function ProfileSkeleton() {
  return (
    <PageShell className="max-w-[1280px]">
      <div aria-busy="true" aria-live="polite">
        <span className="sr-only">Carregando perfil</span>
        <Skeleton className="h-4 w-24" />
        <Skeleton className="mt-3 h-9 w-56" />
        <div className="mt-8 grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
          <div className="flex flex-col gap-5">
            <Skeleton className="h-64 rounded-card" />
            <Skeleton className="hidden h-80 rounded-card xl:block" />
          </div>
          <Skeleton className="h-[520px] rounded-card" />
        </div>
      </div>
    </PageShell>
  )
}

export function CandidateProfileScreen() {
  const { profile, loading, error, refetch, setProfile } = useCandidateProfile()
  const updateProfile = useUpdateCandidateProfile()
  const saving = updateProfile.isPending

  const [form, setForm] = useState<UpdateCandidateProfileDto>({})
  const [section, setSection] = useState<ProfileSectionId>("basico")
  const [busy, setBusy] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof UpdateCandidateProfileDto, string>>>({})
  const [saveError, setSaveError] = useState<string | null>(null)
  const [justSaved, setJustSaved] = useState(false)
  const initialized = useRef<string | null>(null)
  const sectionRef = useRef<HTMLHeadingElement>(null)

  // Inicializa por perfil, preservando o rascunho durante uploads e atualizações de coleções.
  useEffect(() => {
    if (profile && initialized.current !== profile.id) {
      initialized.current = profile.id
      setForm(toForm(profile))
    }
  }, [profile])

  const dirty = Boolean(profile) && JSON.stringify(form) !== JSON.stringify(toForm(profile!))

  useEffect(() => {
    if (!dirty) return
    const warn = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener("beforeunload", warn)
    return () => window.removeEventListener("beforeunload", warn)
  }, [dirty])

  useEffect(() => {
    if (!justSaved) return
    const timeout = window.setTimeout(() => setJustSaved(false), 2500)
    return () => window.clearTimeout(timeout)
  }, [justSaved])

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
        <Link href={ROUTES.candidate.completeProfile} className="btn-primary mt-6">
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

  const activeSection = PROFILE_SECTIONS.find((item) => item.id === section) ?? PROFILE_SECTIONS[0]
  const navDisabled = busy || saving

  function goTo(next: ProfileSectionId) {
    setSection(next)
    setSaveError(null)
    setFieldErrors({})
    requestAnimationFrame(() => {
      sectionRef.current?.focus({ preventScroll: true })
      sectionRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" })
    })
  }

  async function salvar(event: React.FormEvent) {
    event.preventDefault()
    if (!profile) return
    setSaveError(null)
    const errors = validateProfile(form)
    setFieldErrors(errors)
    const first = Object.keys(errors)[0]
    if (first) {
      setSection(sectionForField(first))
      setSaveError("Revise os campos indicados antes de salvar.")
      return
    }
    try {
      const updated = await updateProfile.mutateAsync(form)
      setProfile(updated)
      setForm(toForm(updated))
      setJustSaved(true)
    } catch (requestError) {
      setSaveError(messageFrom(requestError, "Não foi possível salvar as alterações."))
    }
  }

  function descartar() {
    if (!profile) return
    setForm(toForm(profile))
    setFieldErrors({})
    setSaveError(null)
  }

  const showSaveBar = activeSection.editable || dirty

  return (
    <PageShell className="candidate-profile min-w-0 max-w-[1280px]">
      <PageHeader
        eyebrow="Sua conta"
        title="Meu perfil"
        description="É este perfil que a empresa vê quando você se candidata a uma vaga."
        actions={
          section !== "preview" ? (
            <button type="button" className="btn-secondary" disabled={navDisabled} onClick={() => goTo("preview")}>
              <Eye className="size-4" aria-hidden />
              Ver como empresa
            </button>
          ) : null
        }
      />

      <div className="mt-6 grid min-w-0 items-start gap-5 sm:mt-8 sm:gap-6 xl:grid-cols-[300px_minmax(0,1fr)] xl:gap-8">
        <aside className="flex min-w-0 flex-col gap-5 xl:sticky xl:top-24">
          <ProfileSummaryCard profile={profile} form={form} completion={completion} disabled={navDisabled} onGoTo={goTo} />
          <ProfileSectionNav active={section} completion={completion} disabled={navDisabled} onSelect={goTo} />
        </aside>

        <section
          aria-labelledby="profile-section-title"
          className="min-w-0 scroll-mt-24 rounded-card border border-border bg-card shadow-card"
        >
          <header className="flex items-center gap-4 border-b border-border px-5 py-5 sm:px-8">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-subtle text-primary-subtle-foreground">
              <activeSection.icon className="size-5" aria-hidden />
            </span>
            <div className="min-w-0">
              <h2
                id="profile-section-title"
                ref={sectionRef}
                tabIndex={-1}
                className="text-lg font-bold tracking-tight text-foreground outline-none"
              >
                {activeSection.label}
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground text-pretty">{activeSection.description}</p>
            </div>
          </header>

          <form onSubmit={salvar} noValidate>
            <div className="min-w-0 px-5 py-6 sm:px-8 sm:py-8">
              {saveError && (
                <div className="mb-6">
                  <Alert tone="danger">{saveError}</Alert>
                </div>
              )}

              {section === "basico" && (
                <ProfileFields
                  errors={fieldErrors}
                  onUploadingChange={setBusy}
                  onProfileUpdated={setProfile}
                  form={form}
                  setForm={setForm}
                  profile={profile}
                />
              )}

              {section === "formacao" && <EducationFields errors={fieldErrors} form={form} setForm={setForm} />}

              {section === "skills" && (
                <div className="max-w-3xl">
                  <Field
                    label="Suas habilidades"
                    hint={
                      (form.skills?.length ?? 0) >= 3
                        ? `${form.skills?.length} habilidades. Elas aparecem no seu perfil para as empresas.`
                        : "Inclua ao menos três. Elas aparecem no seu perfil para as empresas."
                    }
                  >
                    <SkillsInput skills={form.skills ?? []} onChange={(skills) => setForm({ ...form, skills })} />
                  </Field>
                </div>
              )}

              {section === "links" && <LinksFields errors={fieldErrors} form={form} setForm={setForm} />}

              {section === "curriculo" && (
                <ResumeUpload profile={profile} onProfileChange={setProfile} onUploadingChange={setBusy} />
              )}

              {section === "experiencias" && (
                <ExperienceEditor
                  onEditingChange={setBusy}
                  experiences={profile.experiences ?? []}
                  onProfileChange={setProfile}
                />
              )}

              {section === "projetos" && (
                <ProjectEditor onEditingChange={setBusy} projects={profile.projects ?? []} onProfileChange={setProfile} />
              )}

              {section === "preview" && (
                <div className="max-w-3xl">
                  <ProfilePreview profile={profile} form={form} />
                </div>
              )}
            </div>

            {showSaveBar && (
              <footer
                className={cn(
                  "z-20 flex flex-wrap items-center gap-3 rounded-b-card border-t px-5 py-4 transition-colors sm:px-8",
                  dirty ? "sticky bottom-0 border-primary/30 bg-primary-subtle/90 backdrop-blur" : "border-border bg-card",
                )}
              >
                <p role="status" className="flex w-full items-center gap-2 text-xs font-medium sm:mr-auto sm:w-auto">
                  {dirty ? (
                    <>
                      <span className="size-2 rounded-full bg-primary" aria-hidden />
                      <span className="text-primary-subtle-foreground">Você tem alterações não salvas</span>
                    </>
                  ) : justSaved ? (
                    <>
                      <CheckCircle2 className="size-4 text-success" aria-hidden />
                      <span className="text-success-foreground">Alterações salvas</span>
                    </>
                  ) : (
                    <span className="text-muted-foreground">Tudo salvo</span>
                  )}
                </p>
                <button type="button" onClick={descartar} className="btn-ghost" disabled={saving || busy || !dirty}>
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
