"use client"

import { BookOpen, ExternalLink, MapPin, Phone } from "lucide-react"
import { Field, FieldGroupHeader, InputWithIcon } from "@/components/ui/form-field"
import type { CandidateProfile, UpdateCandidateProfileDto } from "@/lib/types/candidate.types"

type FormProps = {
  form: UpdateCandidateProfileDto
  setForm: React.Dispatch<React.SetStateAction<UpdateCandidateProfileDto>>
}

export function ProfileFields({ form, setForm, profile }: FormProps & { profile: CandidateProfile }) {
  return (
    <div className="max-w-3xl">
      <FieldGroupHeader
        title="Informações básicas"
        description="É assim que as empresas vão te identificar nos processos."
      />

      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <Field label="Nome" hint="Gerenciado pela sua conta.">
          <input value={profile.userName || ""} disabled className="field-input" />
        </Field>

        <Field label="E-mail" hint="Gerenciado pela sua conta.">
          <input value={profile.userEmail || ""} disabled className="field-input" />
        </Field>

        <Field label="Título profissional" wide hint="Aparece logo abaixo do seu nome.">
          <input
            value={form.headline || ""}
            onChange={(event) => setForm({ ...form, headline: event.target.value })}
            className="field-input"
            placeholder="Ex.: Desenvolvedor Front-end Júnior"
          />
        </Field>

        <Field label="Sobre você" wide>
          <textarea
            rows={5}
            value={form.summary || ""}
            onChange={(event) => setForm({ ...form, summary: event.target.value })}
            className="field-input resize-none"
            placeholder="Conte sobre sua trajetória e objetivos."
          />
        </Field>

        <Field label="Telefone">
          <InputWithIcon
            icon={Phone}
            type="tel"
            value={form.phone || ""}
            onChange={(event) => setForm({ ...form, phone: event.target.value })}
            placeholder="(11) 99999-9999"
          />
        </Field>

        <Field label="Localização">
          <div className="grid grid-cols-[1fr_88px] gap-2">
            <InputWithIcon
              icon={MapPin}
              value={form.city || ""}
              onChange={(event) => setForm({ ...form, city: event.target.value })}
              placeholder="Cidade"
              aria-label="Cidade"
            />
            <input
              value={form.state || ""}
              onChange={(event) =>
                setForm({ ...form, state: event.target.value.toUpperCase().slice(0, 2) })
              }
              className="field-input"
              placeholder="UF"
              aria-label="Estado (UF)"
            />
          </div>
        </Field>
      </div>
    </div>
  )
}

export function EducationFields({ form, setForm }: FormProps) {
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
            onChange={(event) => setForm({ ...form, institution: event.target.value })}
            className="field-input"
            placeholder="Ex.: Universidade de São Paulo"
          />
        </Field>

        <Field label="Curso">
          <input
            value={form.course || ""}
            onChange={(event) => setForm({ ...form, course: event.target.value })}
            className="field-input"
            placeholder="Ex.: Ciência da Computação"
          />
        </Field>

        <Field label="Semestre atual">
          <input
            type="number"
            min={1}
            max={20}
            value={form.currentSemester || ""}
            onChange={(event) => setForm({ ...form, currentSemester: Number(event.target.value) })}
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
              setForm({ ...form, expectedGraduationYear: Number(event.target.value) })
            }
            className="field-input"
          />
        </Field>

      </div>
    </div>
  )
}

const LINK_FIELDS = [
  { key: "linkedinUrl", label: "LinkedIn", placeholder: "https://linkedin.com/in/seu-perfil" },
  { key: "githubUrl", label: "GitHub", placeholder: "https://github.com/seu-usuario" },
  { key: "portfolioUrl", label: "Portfólio", placeholder: "https://seu-site.com" },
] as const

export function LinksFields({ form, setForm }: FormProps) {
  return (
    <div className="max-w-3xl">
      <FieldGroupHeader
        icon={ExternalLink}
        title="Presença profissional"
        description="Adicione apenas links públicos que representem seu trabalho."
      />

      <div className="mt-7 flex flex-col gap-5">
        {LINK_FIELDS.map((field) => (
          <Field key={field.key} label={field.label}>
            <input
              type="url"
              value={(form[field.key] as string) || ""}
              onChange={(event) => setForm({ ...form, [field.key]: event.target.value })}
              className="field-input"
              placeholder={field.placeholder}
            />
          </Field>
        ))}
      </div>
    </div>
  )
}

