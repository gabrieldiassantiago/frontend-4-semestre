import { BriefcaseBusiness, Code2, Eye, FileText, GraduationCap, Link2, MapPin } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { EntityAvatar } from "@/components/ui/entity-avatar"
import type { CandidateProfile, UpdateCandidateProfileDto } from "@/lib/types/candidate.types"

function PreviewRow({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <dt className="text-xs font-semibold text-subtle-foreground">{label}</dt>
        <dd className="mt-0.5 text-sm text-strong-foreground text-pretty">{children}</dd>
      </div>
    </div>
  )
}

export function ProfilePreview({
  profile,
  form,
}: {
  profile: CandidateProfile | null
  form: UpdateCandidateProfileDto
}) {
  const local = [form.city, form.state].filter(Boolean).join(", ")
  const skills = form.skills ?? []
  const experiences = profile?.experiences ?? []
  const projects = profile?.projects ?? []
  const links = [form.portfolioUrl, form.linkedinUrl, form.githubUrl].filter(Boolean).length
  const education = [form.course, form.institution].filter(Boolean).join(" · ")
  const educationDetail = [
    form.currentSemester ? `${form.currentSemester}º semestre` : null,
    form.expectedGraduationYear ? `formatura em ${form.expectedGraduationYear}` : null,
  ]
    .filter(Boolean)
    .join(" · ")

  return (
    <section aria-labelledby="profile-preview-title" className="overflow-hidden rounded-card border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-5 py-3 text-xs font-semibold text-muted-foreground">
        <Eye className="size-4" aria-hidden />
        Como a empresa vê você
      </div>

      <div className="p-5 sm:p-6">
        <div className="flex items-start gap-4">
          {profile?.profileImageUrl ? (
            <img src={profile.profileImageUrl} alt="" className="size-14 shrink-0 rounded-full object-cover" />
          ) : (
            <EntityAvatar name={profile?.userName} size="lg" className="rounded-full" />
          )}
          <div className="min-w-0">
            <h3 id="profile-preview-title" className="text-lg font-bold tracking-tight text-foreground text-pretty">
              {profile?.userName || "Seu nome"}
            </h3>
            <p className={form.headline ? "text-sm font-semibold text-primary text-pretty" : "text-sm italic text-subtle-foreground"}>
              {form.headline || "Título profissional não informado"}
            </p>
            {local && (
              <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="size-3.5" aria-hidden />
                {local}
              </p>
            )}
          </div>
        </div>

        <p
          className={
            form.summary
              ? "mt-4 whitespace-pre-line text-sm leading-relaxed text-strong-foreground text-pretty"
              : "mt-4 text-sm italic text-subtle-foreground"
          }
        >
          {form.summary || "Seu resumo aparece aqui."}
        </p>

        {skills.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Habilidades">
            {skills.map((skill) => (
              <li key={skill}>
                <Badge variant="primary" size="sm">
                  {skill}
                </Badge>
              </li>
            ))}
          </ul>
        )}

        <dl className="mt-5 grid gap-4 border-t border-border-subtle pt-5 sm:grid-cols-2">
          <PreviewRow icon={GraduationCap} label="Formação">
            {education || "Não informada"}
            {educationDetail && <span className="block text-xs text-muted-foreground">{educationDetail}</span>}
          </PreviewRow>
          <PreviewRow icon={BriefcaseBusiness} label="Experiências">
            {experiences.length === 0
              ? "Nenhuma adicionada"
              : experiences[0].role + (experiences.length > 1 ? ` e mais ${experiences.length - 1}` : "")}
          </PreviewRow>
          <PreviewRow icon={Code2} label="Projetos">
            {projects.length === 0
              ? "Nenhum adicionado"
              : projects[0].title + (projects.length > 1 ? ` e mais ${projects.length - 1}` : "")}
          </PreviewRow>
          <PreviewRow icon={links ? Link2 : FileText} label="Links e currículo">
            {[
              links ? `${links} ${links === 1 ? "link" : "links"}` : null,
              profile?.resumeUrl ? "currículo em PDF" : null,
            ]
              .filter(Boolean)
              .join(" · ") || "Nenhum adicionado"}
          </PreviewRow>
        </dl>
      </div>
    </section>
  )
}
