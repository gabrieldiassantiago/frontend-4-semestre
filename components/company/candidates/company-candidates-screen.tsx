import { Bookmark, Sparkles } from "lucide-react"

import { MOCK_CANDIDATES } from "@/lib/data/mock-candidates"
import { PageHeader, PageShell } from "@/components/ui/page"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { EntityAvatar } from "@/components/ui/entity-avatar"

export function CompanyCandidatesScreen() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Talentos"
        title="Candidatos"
        description="Encontre pessoas alinhadas às necessidades das suas vagas."
        actions={<Badge variant="warning">Dados de demonstração</Badge>}
      />

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {MOCK_CANDIDATES.map((candidate) => (
          <li key={candidate.name}>
            <Card interactive className="flex h-full flex-col p-5">
              <div className="flex items-start gap-3.5">
                <EntityAvatar name={candidate.name} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold tracking-tight text-foreground">
                    {candidate.name}
                  </p>
                  <p className="mt-0.5 truncate text-sm text-muted-foreground">{candidate.role}</p>
                </div>
              </div>

              <div className="mt-4">
                <Badge variant="success">
                  <Sparkles aria-hidden />
                  {candidate.score}% de compatibilidade
                </Badge>

                <div
                  className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted"
                  role="progressbar"
                  aria-valuenow={candidate.score}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Compatibilidade de ${candidate.name}`}
                >
                  <span
                    className="block h-full rounded-full bg-success transition-[width] duration-500"
                    style={{ width: `${candidate.score}%` }}
                  />
                </div>
              </div>

              <div className="mt-5 flex gap-2 pt-1">
                <button type="button" className="btn-primary flex-1">
                  Ver perfil
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  aria-label={`Salvar ${candidate.name}`}
                >
                  <Bookmark className="size-4" aria-hidden />
                </button>
              </div>
            </Card>
          </li>
        ))}
      </ul>
    </PageShell>
  )
}
