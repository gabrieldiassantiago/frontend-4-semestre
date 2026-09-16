import { BadgeCheck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { CandidateProfile, UpdateCandidateProfileDto } from "@/lib/types/candidate.types"

export function ProfilePreview({
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
