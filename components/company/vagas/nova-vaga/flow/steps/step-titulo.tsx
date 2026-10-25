"use client"

import { Lightbulb, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { Chip, FieldError, QuestionHeader } from "../primitives"
import { useFlow } from "../flow-context"
import { isEnterSubmit } from "../steps"
import type { StepProps } from "../types"

const MAX_LENGTH = 80

const SUGESTOES = [
  "Desenvolvedor(a) Backend Java",
  "Product Designer",
  "Analista de Marketing Digital",
  "Enfermeiro(a) Plantonista",
  "Tech Lead",
  "Analista de Dados",
]

export function StepTitulo({ draft, update, errors, onEnter }: StepProps & { onEnter: () => void }) {
  const length = draft.titulo.length
  const editing = useFlow().mode === "edit"


  return (
    <div>
      <QuestionHeader stepId="titulo" />

      <label htmlFor="vaga-titulo" className="sr-only">
        Título da vaga
      </label>
      <div
        className={cn(
          "rounded-2xl border-2 bg-card px-5 py-4 transition-colors duration-200",
          errors.titulo ? "border-danger" : "border-border focus-within:border-primary",
        )}
      >
        <input
          id="vaga-titulo"
          type="text"
          autoFocus
          autoComplete="off"
          maxLength={MAX_LENGTH}
          value={draft.titulo}
          onChange={(event) => update({ titulo: event.target.value })}
          onKeyDown={(event) => {
            if (isEnterSubmit(event)) {
              event.preventDefault()
              onEnter()
            }
          }}
          placeholder="Ex: Desenvolvedor(a) Full Stack"
          aria-invalid={Boolean(errors.titulo)}
          aria-describedby="vaga-titulo-count"
          className="w-full bg-transparent text-xl font-semibold tracking-tight text-foreground placeholder:font-medium placeholder:text-subtle-foreground focus:outline-none sm:text-2xl"
        />
        <div className="mt-2 flex justify-end">
          <span id="vaga-titulo-count" className="text-xs tabular-nums text-subtle-foreground">
            {length}/{MAX_LENGTH}
          </span>
        </div>
      </div>
      <FieldError message={errors.titulo} />

      <div className={cn("mt-8", editing && "hidden")}>
        <p className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-strong-foreground">
          <Sparkles className="size-4 text-primary" aria-hidden />
          Ou comece por uma sugestão
        </p>
        <div className="flex flex-wrap gap-2">
          {SUGESTOES.map((sugestao) => (
            <Chip
              key={sugestao}
              selected={draft.titulo === sugestao}
              onClick={() => update({ titulo: sugestao })}
            >
              {sugestao}
            </Chip>
          ))}
        </div>
      </div>

      <aside className="mt-8 flex items-start gap-3 rounded-2xl bg-surface p-4 text-sm leading-relaxed text-muted-foreground">
        <Lightbulb className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />
        <p>
          Evite siglas internas como &quot;Analista II&quot; ou &quot;Dev N3&quot;. Títulos que
          descrevem a função aparecem mais nas buscas.
        </p>
      </aside>
    </div>
  )
}
