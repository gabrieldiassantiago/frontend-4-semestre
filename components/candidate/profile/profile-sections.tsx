"use client"

import { ProfessionalLinks } from "./professional-links"
import { CityAutocomplete } from "./city-autocomplete"
import { ProfilePhotoField } from "./profile-photo-field"

import {
  BookOpen,
  ExternalLink,
  Phone,
} from "lucide-react"

import {
  Field,
  FieldGroupHeader,
  InputWithIcon,
} from "@/components/ui/form-field"

import type {
  CandidateProfile,
  UpdateCandidateProfileDto,
} from "@/lib/types/candidate.types"

type FormProps = {
  form: UpdateCandidateProfileDto
  setForm: React.Dispatch<
    React.SetStateAction<UpdateCandidateProfileDto>
  >
}

type ProfileFieldsProps = FormProps & {
  profile: CandidateProfile
  onProfileUpdated: (
    profile: CandidateProfile,
  ) => void
}

export function ProfileFields({
  form,
  setForm,
  profile,
  onProfileUpdated,
}: ProfileFieldsProps) {
  return (
    <div className="max-w-3xl">
      <FieldGroupHeader
        title="Informações básicas"
        description="É assim que as empresas vão te identificar nos processos."
      />

      <ProfilePhotoField
        profile={profile}
        onProfileUpdated={onProfileUpdated}

      />

      <div className="mt-7 grid gap-5 sm:grid-cols-2">
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

        <Field label="Sobre você" wide>
          <textarea
            rows={5}
            value={form.summary || ""}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                summary: event.target.value,
              }))
            }
            className="field-input resize-none"
            placeholder="Conte sobre sua trajetória e objetivos."
          />
        </Field>

        <Field label="Telefone">
          <InputWithIcon
            icon={Phone}
            type="tel"
            value={form.phone || ""}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                phone: event.target.value,
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
}: FormProps) {
  return (
    <div className="max-w-3xl">
      <FieldGroupHeader
        icon={BookOpen}
        title="Formação acadêmica"
        description="Informações que ajudam empresas a entender seu momento de carreira."
      />

      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <Field label="Instituição">
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

        <Field label="Curso">
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

        <Field label="Semestre atual">
          <input
            type="number"
            min={1}
            max={20}
            value={form.currentSemester || ""}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                currentSemester:
                  event.target.value === ""
                    ? undefined
                    : Number(event.target.value),
              }))
            }
            className="field-input"
          />
        </Field>

        <Field label="Previsão de formatura">
          <input
            type="number"
            min={new Date().getFullYear()}
            max={new Date().getFullYear() + 10}
            value={form.expectedGraduationYear || ""}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                expectedGraduationYear:
                  event.target.value === ""
                    ? undefined
                    : Number(event.target.value),
              }))
            }
            className="field-input"
          />
        </Field>
      </div>
    </div>
  )
}

export function LinksFields({
  form,
  setForm,
}: FormProps) {
  return (
    <div className="max-w-3xl">
      <FieldGroupHeader
        icon={ExternalLink}
        title="Presença profissional"
        description="Adicione apenas links públicos que representem seu trabalho."
      />

      <div className="mt-7 flex flex-col gap-5">
        <ProfessionalLinks
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