"use client"

import { Select } from "@/components/ui/select"
import { ProfessionalLinks } from "./professional-links"
import { CityAutocomplete } from "./city-autocomplete"
import { ProfilePhotoField } from "./profile-photo-field"

import { Phone } from "lucide-react"

import { Field, InputWithIcon } from "@/components/ui/form-field"

import type {
  CandidateProfile,
  UpdateCandidateProfileDto,
} from "@/lib/types/candidate.types"

import { formatPhone } from "@/lib/utils/profile-validation"

type FormProps = {
  errors?: Partial<Record<keyof UpdateCandidateProfileDto, string>>
  form: UpdateCandidateProfileDto
  setForm: React.Dispatch<
    React.SetStateAction<UpdateCandidateProfileDto>
  >
}

type ProfileFieldsProps = FormProps & {
  onUploadingChange?: (uploading: boolean) => void
  profile: CandidateProfile
  onProfileUpdated: (
    profile: CandidateProfile,
  ) => void
}

export function ProfileFields({
  form,
  setForm,
  errors = {},
  profile,
  onProfileUpdated,
  onUploadingChange,
}: ProfileFieldsProps) {
  return (
    <div className="max-w-3xl">
      <ProfilePhotoField
        onUploadingChange={onUploadingChange}
        profile={profile}
        onProfileUpdated={onProfileUpdated}

      />

      <div className="mt-5 grid gap-x-5 gap-y-4 sm:grid-cols-2">
        <Field
          label="Nome"
          hint="Gerenciado pela sua conta."
        >
          <input
            value={profile.userName || ""}
            disabled
            className="field-input"
          />
        </Field>

        <Field
          label="E-mail"
          hint="Gerenciado pela sua conta."
        >
          <input
            value={profile.userEmail || ""}
            disabled
            className="field-input"
          />
        </Field>

        <Field
          label="Título profissional"
          wide
          error={errors.headline}
          hint="Aparece logo abaixo do seu nome."
        >
          <input
            value={form.headline || ""}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                headline: event.target.value,
              }))
            }
            className="field-input"
            placeholder="Ex.: Assistente administrativo, vendedor ou auxiliar de enfermagem"
          />
        </Field>

        <Field label="Sobre você" wide error={errors.summary} hint={`${(form.summary || "").trim().length} caracteres. Trajetória, interesses e o que você busca.`}>
          <textarea
            rows={4}
            value={form.summary || ""}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                summary: event.target.value,
              }))
            }
            className="field-input resize-y"
            placeholder="Conte sobre sua trajetória e objetivos."
          />
        </Field>

        <Field label="Telefone" error={errors.phone}>
          <InputWithIcon
            icon={Phone}
            type="tel"
            autoComplete="tel-national"
            aria-invalid={Boolean(errors.phone)}
            value={form.phone || ""}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                phone: formatPhone(event.target.value),
              }))
            }
            placeholder="(11) 99999-9999"
          />
        </Field>

        <Field
          label="Localização"
          hint="Ajuda a recomendar oportunidades perto de você."
        >
          <CityAutocomplete
            city={form.city}
            state={form.state}
            onChange={(location) =>
              setForm((current) => ({
                ...current,
                ...location,
              }))
            }
          />
        </Field>
      </div>
    </div>
  )
}

export function EducationFields({
  form,
  setForm,
  errors = {},
}: FormProps) {
  return (
    <div className="max-w-3xl">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Instituição" error={errors.institution}>
          <input
            value={form.institution || ""}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                institution: event.target.value,
              }))
            }
            className="field-input"
            placeholder="Ex.: Universidade de São Paulo"
          />
        </Field>

        <Field label="Curso" error={errors.course}>
          <input
            value={form.course || ""}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                course: event.target.value,
              }))
            }
            className="field-input"
            placeholder="Ex.: Administração, Enfermagem ou curso de Gastronomia"
          />
        </Field>

        <Field label="Semestre atual" error={errors.currentSemester}>
          <Select
            aria-label="Semestre atual"
            placeholder="Selecione o semestre"
            value={form.currentSemester ? String(form.currentSemester) : ""}
            onValueChange={(value) =>
              setForm((current) => ({ ...current, currentSemester: value === "" ? undefined : Number(value) }))
            }
            options={Array.from({ length: 20 }, (_, index) => ({ value: String(index + 1), label: `${index + 1}º semestre` }))}
          />
        </Field>

        <Field label="Previsão de formatura" error={errors.expectedGraduationYear}>
          <Select
            aria-label="Previsão de formatura"
            placeholder="Selecione o ano"
            value={form.expectedGraduationYear ? String(form.expectedGraduationYear) : ""}
            onValueChange={(value) =>
              setForm((current) => ({ ...current, expectedGraduationYear: value === "" ? undefined : Number(value) }))
            }
            options={Array.from({ length: 11 }, (_, index) => {
              const year = String(new Date().getFullYear() + index)
              return { value: year, label: year }
            })}
          />
        </Field>
      </div>
    </div>
  )
}

export function LinksFields({
  form,
  setForm,
  errors = {},
}: FormProps) {
  return (
    <div className="max-w-3xl">
      <div className="flex flex-col gap-5">
        <ProfessionalLinks
          errors={errors}
          form={form}
          onChange={(patch) =>
            setForm((current) => ({
              ...current,
              ...patch,
            }))
          }
        />
      </div>
    </div>
  )
}
