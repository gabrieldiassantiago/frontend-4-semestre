"use client"

import { AlertCircle, ArrowRight, CheckCircle2, Circle, Phone } from "lucide-react"
import { Field, InputWithIcon } from "@/components/ui/form-field"
import { PROFILE_STEPS, type ProfileCompletion, type ProfileStepId } from "@/lib/candidate-completion"
import type { CandidateProfile, UpdateCandidateProfileDto } from "@/lib/types/candidate.types"
import { formatPhone, phoneError } from "@/lib/utils/profile-validation"
import { cn } from "@/lib/utils"
import { CityAutocomplete } from "../city-autocomplete"
import { ProfilePhotoField } from "../profile-photo-field"
import { ProfilePreview } from "../profile-preview"
import { SkillsInput } from "../skills-input"

type FieldErrors = Partial<Record<keyof UpdateCandidateProfileDto, string>>

type StepProps = {
  form: UpdateCandidateProfileDto
  onChange: (patch: UpdateCandidateProfileDto) => void
  errors: FieldErrors
}

const SUMMARY_RECOMMENDED = 120

export function BasicStep({
  form,
  onChange,
  errors,
  setErrors,
  profile,
  onPhotoUpdated,
  onUploadingChange,
}: StepProps & {
  setErrors: React.Dispatch<React.SetStateAction<FieldErrors>>
  profile: CandidateProfile | null
  onPhotoUpdated: (profile: CandidateProfile) => void
  onUploadingChange: (uploading: boolean) => void
}) {
  const summaryLength = (form.summary || "").trim().length

  return (
    <div className="flex flex-col gap-6">
      {profile ? (
        <ProfilePhotoField profile={profile} onProfileUpdated={onPhotoUpdated} onUploadingChange={onUploadingChange} />
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          error={errors.headline}
          label="Título profissional *"
          wide
          hint="Uma linha que resume o que você faz ou quer fazer."
        >
          <input
            className="field-input"
            value={form.headline || ""}
            aria-invalid={Boolean(errors.headline)}
            maxLength={120}
            onChange={(event) => onChange({ headline: event.target.value })}
            placeholder="Ex.: Assistente administrativo, vendedor ou auxiliar de enfermagem"
          />
        </Field>

        <Field
          error={errors.summary}
          label="Sobre você *"
          wide
          hint={
            summaryLength >= SUMMARY_RECOMMENDED
              ? `${summaryLength} caracteres. Ótimo, um bom resumo ajuda muito.`
              : `${summaryLength} de ${SUMMARY_RECOMMENDED} caracteres recomendados. Conte sua trajetória, interesses e o que busca.`
          }
        >
          <textarea
            rows={4}
            className="field-input resize-y"
            value={form.summary || ""}
            aria-invalid={Boolean(errors.summary)}
            onChange={(event) => onChange({ summary: event.target.value })}
            placeholder="Ex.: Sou estudante de Administração, tenho experiência com atendimento ao cliente e quero crescer na área de gestão de projetos."
          />
        </Field>

        <Field label="Telefone *" error={errors.phone} hint="Celular ou telefone fixo com DDD.">
          <InputWithIcon
            icon={Phone}
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            value={formatPhone(form.phone || "")}
            aria-invalid={Boolean(errors.phone)}
            onBlur={() =>
              setErrors((current) => ({
                ...current,
                phone: form.phone ? phoneError(form.phone) : "Informe seu telefone de contato.",
              }))
            }
            onChange={(event) => onChange({ phone: formatPhone(event.target.value) })}
            placeholder="(11) 99999-9999"
          />
        </Field>
      </div>
    </div>
  )
}

export function LocationStep({ form, onChange, disabled }: Omit<StepProps, "errors"> & { disabled: boolean }) {
  return (
    <div className="max-w-xl">
      <Field label="Sua cidade *" hint="Busque pelo nome da cidade ou use sua localização atual.">
        <CityAutocomplete city={form.city} state={form.state} disabled={disabled} onChange={(location) => onChange(location)} />
      </Field>
    </div>
  )
}

export function EducationStep({ form, onChange, errors }: StepProps) {
  const currentYear = new Date().getFullYear()

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Field label="Instituição *" error={errors.institution}>
        <input
          className="field-input"
          value={form.institution || ""}
          aria-invalid={Boolean(errors.institution)}
          onChange={(event) => onChange({ institution: event.target.value })}
          placeholder="Ex.: Universidade de São Paulo"
        />
      </Field>

      <Field label="Curso *" error={errors.course}>
        <input
          className="field-input"
          value={form.course || ""}
          aria-invalid={Boolean(errors.course)}
          onChange={(event) => onChange({ course: event.target.value })}
          placeholder="Ex.: Administração ou Enfermagem"
        />
      </Field>

      <Field label="Semestre atual *" error={errors.currentSemester}>
        <select
          className="field-input"
          value={form.currentSemester ?? ""}
          aria-invalid={Boolean(errors.currentSemester)}
          onChange={(event) =>
            onChange({ currentSemester: event.target.value ? Number(event.target.value) : undefined })
          }
        >
          <option value="">Selecione seu semestre</option>
          {Array.from({ length: 20 }, (_, index) => index + 1).map((semester) => (
            <option key={semester} value={semester}>
              {semester}º semestre
            </option>
          ))}
        </select>
      </Field>

      <Field label="Previsão de formatura *" error={errors.expectedGraduationYear}>
        <select
          className="field-input"
          value={form.expectedGraduationYear ?? ""}
          aria-invalid={Boolean(errors.expectedGraduationYear)}
          onChange={(event) =>
            onChange({ expectedGraduationYear: event.target.value ? Number(event.target.value) : undefined })
          }
        >
          <option value="">Selecione o ano</option>
          {Array.from({ length: 11 }, (_, index) => currentYear + index).map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </Field>
    </div>
  )
}

export function SkillsStep({ form, onChange }: Omit<StepProps, "errors">) {
  const count = form.skills?.length ?? 0

  return (
    <Field
      label="Suas habilidades *"
      hint={
        count >= 3
          ? `${count} habilidades adicionadas.`
          : `Adicione pelo menos 3. Faltam ${3 - count}. Técnicas e comportamentais contam.`
      }
    >
      <SkillsInput skills={form.skills ?? []} onChange={(skills) => onChange({ skills })} />
    </Field>
  )
}

function ChecklistGroup({
  title,
  tone,
  items,
  onGoTo,
}: {
  title: string
  tone: "warning" | "neutral"
  items: ProfileCompletion["items"]
  onGoTo: (step: ProfileStepId) => void
}) {
  if (items.length === 0) return null

  return (
    <div>
      <h3 className="text-sm font-bold text-foreground">{title}</h3>
      <ul className="mt-2 divide-y divide-border-subtle rounded-xl border border-border">
        {items.map((item) => {
          const stepLabel = PROFILE_STEPS.find((step) => step.id === item.step)?.label
          return (
            <li key={item.id} className="flex items-center gap-3 px-4 py-3">
              {tone === "warning" ? (
                <AlertCircle className="size-4 shrink-0 text-warning" aria-hidden />
              ) : (
                <Circle className="size-4 shrink-0 text-subtle-foreground" aria-hidden />
              )}
              <span className="min-w-0 flex-1 text-sm text-strong-foreground">
                {item.label}
                <span className="block text-xs text-subtle-foreground">{stepLabel}</span>
              </span>
              <button
                type="button"
                onClick={() => onGoTo(item.step)}
                className="inline-flex min-h-11 shrink-0 items-center gap-1 rounded-lg px-2 text-xs font-bold text-primary transition-colors hover:bg-primary-subtle"
              >
                Preencher
                <ArrowRight className="size-3.5" aria-hidden />
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export function ReviewStep({
  completion,
  profile,
  form,
  onGoTo,
}: {
  completion: ProfileCompletion
  profile: CandidateProfile | null
  form: UpdateCandidateProfileDto
  onGoTo: (step: ProfileStepId) => void
}) {
  const optionalMissing = completion.missing.filter((item) => !item.required)
  const doneCount = completion.items.length - completion.missing.length

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <div className="flex flex-col gap-5">
        <div
          className={cn(
            "flex items-start gap-3 rounded-xl border p-4",
            completion.ready ? "border-success-border bg-success-subtle" : "border-border bg-muted/50",
          )}
        >
          {completion.ready ? (
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" aria-hidden />
          ) : (
            <AlertCircle className="mt-0.5 size-5 shrink-0 text-warning" aria-hidden />
          )}
          <div>
            <p className={cn("text-sm font-bold", completion.ready ? "text-success-foreground" : "text-foreground")}>
              {completion.ready
                ? "Pronto para se candidatar"
                : `Falta${completion.missingRequired.length === 1 ? "" : "m"} ${completion.missingRequired.length} ${completion.missingRequired.length === 1 ? "item obrigatório" : "itens obrigatórios"}`}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {doneCount} de {completion.items.length} itens preenchidos
            </p>
          </div>
        </div>

        <ChecklistGroup title="Antes de se candidatar" tone="warning" items={completion.missingRequired} onGoTo={onGoTo} />
        <ChecklistGroup title="Fortaleça seu perfil" tone="neutral" items={optionalMissing} onGoTo={onGoTo} />
      </div>

      <ProfilePreview profile={profile} form={form} />
    </div>
  )
}
