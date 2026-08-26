"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { MapPin, TrendingUp, Info } from "lucide-react"
import {
  getEstadosIBGE,
  getMunicipiosPorEstadoIBGE,
  type EstadoIBGE,
} from "@/lib/services/ibge.service"
import { SALARY_BENCHMARKS } from "@/lib/data/salary-benchmarks"
import { Field } from "@/components/ui/form-field"
import { formatCurrency } from "@/lib/format"
import {
  CATEGORIA_LABELS,
  NIVEL_LABELS,
  type VagaCategoria,
  type VagaModalidade,
  type NivelExperiencia,
} from "@/lib/types/vaga.types"
import { StepCard, StepHeader } from "./wizard"

const FALLBACK_BENCHMARK = { min: 4000, avg: 6500, max: 9500 }

export function StepLocalSalario({
  cidade,
  setCidade,
  estado,
  setEstado,
  modalidade,
  salario,
  setSalario,
  categoria,
  nivelExperiencia,
  errors,
}: {
  cidade: string
  setCidade: (v: string) => void
  estado: string
  setEstado: (v: string) => void
  modalidade: VagaModalidade
  salario: number
  setSalario: (v: number) => void
  categoria: VagaCategoria
  nivelExperiencia: NivelExperiencia
  errors: { cidade?: string; salario?: string }
}) {
  const [estados, setEstados] = useState<EstadoIBGE[]>([])
  const [municipios, setMunicipios] = useState<string[]>([])
  const [open, setOpen] = useState(false)
  const comboRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    void getEstadosIBGE().then(setEstados)
  }, [])

  useEffect(() => {
    if (!estado) return
    void getMunicipiosPorEstadoIBGE(estado).then(setMunicipios)
  }, [estado])

  // Fecha a lista ao clicar fora — sem isso ela fica presa aberta sobre o conteúdo.
  useEffect(() => {
    if (!open) return
    function onPointerDown(event: PointerEvent) {
      if (!comboRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener("pointerdown", onPointerDown)
    return () => document.removeEventListener("pointerdown", onPointerDown)
  }, [open])

  const sugestoes = useMemo(() => {
    const termo = cidade.trim().toLowerCase()
    const base = termo
      ? municipios.filter((nome) => nome.toLowerCase().includes(termo))
      : municipios
    return base.slice(0, 12)
  }, [municipios, cidade])

  const benchmark = SALARY_BENCHMARKS[categoria]?.[nivelExperiencia] ?? FALLBACK_BENCHMARK

  const referencias = [
    { label: "Piso", value: benchmark.min },
    { label: "Média de mercado", value: benchmark.avg, recommended: true },
    { label: "Teto", value: benchmark.max },
  ]

  return (
    <div className="space-y-6">
      <StepHeader
        step={2}
        title="Onde fica a vaga e quanto ela paga?"
        description="Cidades e estados vêm da base oficial do IBGE."
      />

      <StepCard>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Estado">
            <select
              value={estado}
              onChange={(e) => {
                setEstado(e.target.value)
                setCidade("")
              }}
              className="field-input"
            >
              {estados.length === 0 && <option value={estado}>{estado || "Carregando..."}</option>}
              {estados.map((uf) => (
                <option key={uf.sigla} value={uf.sigla}>
                  {uf.nome} ({uf.sigla})
                </option>
              ))}
            </select>
          </Field>

          <div ref={comboRef} className="relative">
            <Field
              label="Cidade"
              error={errors.cidade}
              hint={municipios.length === 0 ? "Carregando municípios..." : undefined}
            >
              <div className="relative">
                <MapPin
                  className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-subtle-foreground"
                  aria-hidden
                />
                <input
                  type="text"
                  value={cidade}
                  onChange={(e) => {
                    setCidade(e.target.value)
                    setOpen(true)
                  }}
                  onFocus={() => setOpen(true)}
                  onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
                  placeholder="Busque o município"
                  role="combobox"
                  aria-expanded={open}
                  aria-autocomplete="list"
                  aria-invalid={Boolean(errors.cidade)}
                  className="field-input pl-11"
                />
              </div>
            </Field>

            {open && sugestoes.length > 0 && (
              <ul
                role="listbox"
                aria-label="Municípios"
                className="absolute z-20 mt-2 max-h-60 w-full list-none overflow-y-auto rounded-xl border border-border bg-card p-1.5 shadow-overlay"
              >
                {sugestoes.map((nome) => (
                  <li key={nome}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={nome === cidade}
                      onClick={() => {
                        setCidade(nome)
                        setOpen(false)
                      }}
                      className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-strong-foreground transition-colors hover:bg-primary-subtle hover:text-primary-subtle-foreground"
                    >
                      <span className="truncate">{nome}</span>
                      <span className="shrink-0 text-xs text-muted-foreground">{estado}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {modalidade === "REMOTO" && (
          <p className="mt-5 flex items-start gap-2.5 rounded-xl bg-success-subtle p-3.5 text-xs leading-relaxed text-success-foreground">
            <Info className="mt-px size-4 shrink-0" aria-hidden />
            <span>
              Como a vaga é remota, a cidade serve apenas como referência de contratação e fuso.
            </span>
          </p>
        )}
      </StepCard>

      <StepCard>
        <Field
          label="Salário mensal bruto"
          error={errors.salario}
          hint="Vagas com salário informado recebem mais candidaturas qualificadas."
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-muted-foreground">R$</span>
            <input
              type="number"
              min={0}
              step={100}
              value={salario || ""}
              onChange={(e) => setSalario(Number(e.target.value))}
              aria-invalid={Boolean(errors.salario)}
              className="field-input max-w-48 text-lg font-bold"
            />
            <span className="text-sm font-medium text-muted-foreground">/ mês</span>
          </div>
        </Field>

        <div className="mt-5 rounded-xl border border-border bg-surface p-4">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-strong-foreground">
            <TrendingUp className="size-4 text-primary" aria-hidden />
            Referência de mercado
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {NIVEL_LABELS[nivelExperiencia]} • {CATEGORIA_LABELS[categoria]}
          </p>

          <div className="mt-3 grid gap-2.5 sm:grid-cols-3">
            {referencias.map((ref) => (
              <button
                key={ref.label}
                type="button"
                onClick={() => setSalario(ref.value)}
                className={
                  ref.recommended
                    ? "rounded-xl border border-primary bg-primary-subtle p-3 text-left transition-colors hover:bg-primary-subtle/70"
                    : "rounded-xl border border-border bg-card p-3 text-left transition-colors hover:border-border-strong hover:bg-muted"
                }
              >
                <span
                  className={
                    ref.recommended
                      ? "block text-[11px] font-bold text-primary-subtle-foreground"
                      : "block text-[11px] font-bold text-muted-foreground"
                  }
                >
                  {ref.label}
                </span>
                <span
                  className={
                    ref.recommended
                      ? "mt-1 block font-bold text-primary-subtle-foreground"
                      : "mt-1 block font-bold text-foreground"
                  }
                >
                  {formatCurrency(ref.value)}
                </span>
                <span className="mt-1 block text-[11px] font-semibold text-primary">
                  Aplicar
                </span>
              </button>
            ))}
          </div>
        </div>
      </StepCard>
    </div>
  )
}
