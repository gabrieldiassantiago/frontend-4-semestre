import { Field } from "@/components/ui/form-field"
import type { UpdateCandidateProfileDto } from "@/lib/types/candidate.types"

export function ProfessionalLinks({ form, onChange }: {
  form: UpdateCandidateProfileDto
  onChange: (patch: UpdateCandidateProfileDto) => void
}) {
  return <div className="flex min-w-0 flex-col gap-5">
    <Field label="Site, portfólio ou página profissional" hint="Pode ser uma página com seus serviços, trabalhos, atividades ou realizações.">
      <input type="url" className="field-input" value={form.portfolioUrl || ""}
        onChange={(event) => onChange({ portfolioUrl: event.target.value })} placeholder="https://seu-site.com" />
    </Field>
    <Field label="LinkedIn (opcional)">
      <input type="url" className="field-input" value={form.linkedinUrl || ""}
        onChange={(event) => onChange({ linkedinUrl: event.target.value })} placeholder="https://linkedin.com/in/seu-perfil" />
    </Field>
    <details className="rounded-xl border border-border p-4" open={form.githubUrl ? true : undefined}>
      <summary className="cursor-pointer text-sm font-medium text-muted-foreground">Usa GitHub? Adicione também (opcional)</summary>
      <div className="mt-4"><Field label="GitHub">
        <input type="url" className="field-input" value={form.githubUrl || ""}
          onChange={(event) => onChange({ githubUrl: event.target.value })} placeholder="https://github.com/seu-usuario" />
      </Field></div>
    </details>
  </div>
}
