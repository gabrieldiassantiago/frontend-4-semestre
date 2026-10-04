"use client"

import { ArrowDown, ArrowUp, Check, GripVertical } from "lucide-react"
import type { EtapaProcesso } from "@/lib/types/candidatura.types"

const ETAPAS_DISPONIVEIS: Array<{ value: EtapaProcesso; label: string; hint: string }> = [
  { value: "TRIAGEM", label: "Triagem", hint: "Análise do currículo e do perfil" },
  { value: "ENTREVISTA_RH", label: "Entrevista com RH", hint: "Conversa inicial sobre a vaga" },
  { value: "TESTE_TECNICO", label: "Teste técnico", hint: "Avaliação prática de habilidades" },
  { value: "ENTREVISTA_TECNICA", label: "Entrevista técnica", hint: "Conversa com o time da área" },
  { value: "PROPOSTA", label: "Proposta", hint: "Condições para a contratação" },
]

export function StepEtapas({
  etapas,
  setEtapas,
}: {
  etapas: EtapaProcesso[]
  setEtapas: (etapas: EtapaProcesso[]) => void
}) {
  function toggle(etapa: EtapaProcesso) {
    setEtapas(etapas.includes(etapa) ? etapas.filter((item) => item !== etapa) : [...etapas, etapa])
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction
    if (target < 0 || target >= etapas.length) return
    const next = [...etapas]
    ;[next[index], next[target]] = [next[target], next[index]]
    setEtapas(next)
  }

  return (
    <section className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Etapas do processo</p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground">Monte o fluxo desta vaga</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Selecione as etapas e organize a ordem em que os candidatos avançarão. A inscrição acontece automaticamente.
        </p>
      </div>

      <div className="grid gap-3">
        {ETAPAS_DISPONIVEIS.map((item) => {
          const selected = etapas.includes(item.value)
          return (
            <button
              key={item.value}
              type="button"
              aria-pressed={selected}
              onClick={() => toggle(item.value)}
              className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-colors ${
                selected ? "border-primary bg-primary-subtle" : "border-border bg-card hover:bg-muted"
              }`}
            >
              <span className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border ${selected ? "border-primary bg-primary text-primary-foreground" : "border-border-strong"}`}>
                {selected && <Check className="size-3.5" aria-hidden />}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-bold text-foreground">{item.label}</span>
                <span className="mt-1 block text-xs text-muted-foreground">{item.hint}</span>
              </span>
            </button>
          )
        })}
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-foreground">Ordem selecionada</h3>
          <span className="text-xs font-semibold text-muted-foreground">{etapas.length} de 5</span>
        </div>
        {etapas.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">Escolha pelo menos uma etapa para publicar a vaga.</p>
        ) : (
          <ol className="mt-4 space-y-2">
            {etapas.map((etapa, index) => {
              const item = ETAPAS_DISPONIVEIS.find((option) => option.value === etapa)!
              return (
                <li key={etapa} className="flex items-center gap-3 rounded-lg border border-border-subtle px-3 py-2.5">
                  <GripVertical className="size-4 text-muted-foreground" aria-hidden />
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary-subtle text-xs font-bold text-primary">{index + 1}</span>
                  <span className="min-w-0 flex-1 text-sm font-semibold text-foreground">{item.label}</span>
                  <button type="button" disabled={index === 0} onClick={() => move(index, -1)} aria-label={`Mover ${item.label} para cima`} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted disabled:opacity-30"><ArrowUp className="size-4" aria-hidden /></button>
                  <button type="button" disabled={index === etapas.length - 1} onClick={() => move(index, 1)} aria-label={`Mover ${item.label} para baixo`} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted disabled:opacity-30"><ArrowDown className="size-4" aria-hidden /></button>
                </li>
              )
            })}
          </ol>
        )}
      </div>
    </section>
  )
}