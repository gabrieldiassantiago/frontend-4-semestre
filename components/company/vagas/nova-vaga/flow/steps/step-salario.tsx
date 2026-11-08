"use client"

import { Minus, Plus, TrendingUp } from "lucide-react"
import { SALARY_BENCHMARKS } from "@/lib/data/salary-benchmarks"
import { formatCurrency } from "@/lib/format"
import { cn } from "@/lib/utils"
import { CATEGORIA_LABELS } from "@/lib/types/vaga.types"
import { FieldError, QuestionHeader } from "../primitives"
import { isEnterSubmit } from "../steps"
import type { StepProps } from "../types"

const FALLBACK = { min: 4000, avg: 6500, max: 9500 }
const STEP = 250

function roundTo(value: number, step: number) {
  return Math.round(value / step) * step
}

function getPositioning(salario: number, range: typeof FALLBACK) {
  if (salario <= 0) return null
  if (salario < range.min)
    return { label: "Abaixo do mercado", hint: "Pode atrair menos candidatos.", tone: "warning" as const }
  if (salario < range.avg)
    return { label: "Dentro da faixa", hint: "Entre o piso e a média do mercado.", tone: "neutral" as const }
  if (salario <= range.max)
    return { label: "Competitivo", hint: "Acima da média — ótimo para atrair talentos.", tone: "success" as const }
  return { label: "Destaque", hint: "Acima do teto de mercado. Sua vaga vai chamar atenção.", tone: "primary" as const }
}

const TONE_CLASSES = {
  warning: "bg-warning-subtle text-warning-foreground",
  neutral: "bg-muted text-strong-foreground",
  success: "bg-success-subtle text-success-foreground",
  primary: "bg-primary-subtle text-primary-subtle-foreground",
}

export function StepSalario({ draft, update, errors, onEnter }: StepProps & { onEnter: () => void }) {
  const range = SALARY_BENCHMARKS[draft.categoria]?.["PLENO"] ?? FALLBACK
  const sliderMin = roundTo(range.min * 0.5, 100)
  const sliderMax = roundTo(range.max * 1.6, 100)
  const positioning = getPositioning(draft.salario, range)

  const setSalario = (value: number) => update({ salario: Math.max(0, value) })

  const quickPicks = [
    { label: "Piso", value: range.min },
    { label: "Média", value: range.avg },
    { label: "Teto", value: range.max },
  ]

  return (
    <div>
      <QuestionHeader stepId="salario" />

      <label className="mb-5 flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-border bg-card p-4">
        <span>
          <span className="block text-sm font-semibold text-foreground">Salário a combinar</span>
          <span className="mt-1 block text-xs leading-5 text-muted-foreground">O valor será definido com o candidato durante o processo.</span>
        </span>
        <input type="checkbox" checked={draft.salarioACombinar}
          onChange={event => update({ salarioACombinar: event.target.checked })}
          className="size-5 shrink-0 accent-primary" />
      </label>

      {draft.salarioACombinar ? (
        <p role="status" className="rounded-xl bg-primary-subtle px-4 py-5 text-sm text-primary-deep">
          Os candidatos verão “Salário a combinar” nesta vaga.
        </p>
      ) : (
        <>
      <div className="rounded-panel border border-border bg-card p-5 sm:p-7">
        <div className="flex items-center justify-center gap-3 sm:gap-5">
          <button
            type="button"
            onClick={() => setSalario(draft.salario - STEP)}
            aria-label={`Diminuir ${formatCurrency(STEP)}`}
            className="grid size-11 shrink-0 place-items-center rounded-full border border-border text-strong-foreground transition-all hover:border-border-strong hover:bg-muted active:scale-90"
          >
            <Minus className="size-4" aria-hidden />
          </button>

          <label className="flex min-w-0 items-baseline justify-center gap-1.5">
            <span className="sr-only">Salário mensal bruto</span>
            <span className="text-xl font-semibold text-muted-foreground sm:text-2xl" aria-hidden>
              R$
            </span>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              step={100}
              value={draft.salario || ""}
              onChange={(event) => setSalario(Number(event.target.value))}
              onKeyDown={(event) => {
                if (isEnterSubmit(event)) {
                  event.preventDefault()
                  onEnter()
                }
              }}
              aria-invalid={Boolean(errors.salario)}
              placeholder="0"
              style={{ width: `${Math.max(String(draft.salario || "").length, 1) + 0.6}ch` }}
              className="min-w-0 max-w-[9ch] bg-transparent text-left text-4xl font-bold tabular-nums tracking-tight text-foreground [appearance:textfield] focus:outline-none sm:text-5xl [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
          </label>

          <button
            type="button"
            onClick={() => setSalario(draft.salario + STEP)}
            aria-label={`Aumentar ${formatCurrency(STEP)}`}
            className="grid size-11 shrink-0 place-items-center rounded-full border border-border text-strong-foreground transition-all hover:border-border-strong hover:bg-muted active:scale-90"
          >
            <Plus className="size-4" aria-hidden />
          </button>
        </div>
        <p className="mt-1 text-center text-xs text-muted-foreground">bruto por mês</p>
        <FieldError message={errors.salario} />

        <div className="mt-8">
          <div className="relative">
            <input
              type="range"
              min={sliderMin}
              max={sliderMax}
              step={100}
              value={Math.min(sliderMax, Math.max(sliderMin, draft.salario || sliderMin))}
              onChange={(event) => setSalario(Number(event.target.value))}
              aria-label="Ajustar salário"
              className="relative w-full cursor-pointer accent-primary"
            />
          </div>
          <div className="mt-1.5 flex justify-between text-[11px] tabular-nums text-subtle-foreground">
            <span>{formatCurrency(sliderMin)}</span>
            <span>{formatCurrency(sliderMax)}</span>
          </div>
        </div>

        {positioning && (
          <div
            aria-live="polite"
            className={cn(
              "mt-5 flex items-center gap-3 rounded-2xl p-3.5 transition-colors duration-300",
              TONE_CLASSES[positioning.tone],
            )}
          >
            <TrendingUp className="size-4 shrink-0" aria-hidden />
            <p className="text-sm">
              <strong className="font-semibold">{positioning.label}.</strong> {positioning.hint}
            </p>
          </div>
        )}
      </div>

      <div className="mt-6">
        <p className="text-sm font-semibold text-strong-foreground">Referência de mercado</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {CATEGORIA_LABELS[draft.categoria]}
        </p>
        <div className="mt-3 grid grid-cols-3 gap-2.5">
          {quickPicks.map((pick) => {
            const applied = draft.salario === pick.value
            return (
              <button
                key={pick.label}
                type="button"
                onClick={() => setSalario(pick.value)}
                aria-pressed={applied}
                className={cn(
                  "rounded-2xl border p-3 text-left transition-all duration-200 active:scale-[0.98] sm:p-4",
                  applied
                    ? "border-primary bg-primary-subtle shadow-[0_0_0_1px_var(--primary)]"
                    : "border-border bg-card hover:-translate-y-0.5 hover:border-border-strong hover:shadow-raised",
                )}
              >
                <span className="block text-xs font-medium text-muted-foreground">{pick.label}</span>
                <span className="mt-1 block text-sm font-bold tabular-nums text-foreground sm:text-base">
                  {formatCurrency(pick.value)}
                </span>
              </button>
            )
          })}
        </div>
      </div>
        </>
      )}
    </div>
  )
}
