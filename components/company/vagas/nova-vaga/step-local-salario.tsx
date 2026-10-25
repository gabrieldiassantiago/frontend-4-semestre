"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { MapPin, TrendingUp, Info, Crosshair, Check } from "lucide-react"
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
  type VagaCategoria,
  type VagaModalidade,
} from "@/lib/types/vaga.types"
import { StepCard, StepHeader } from "./wizard"
import { AddressAutocomplete } from "../address-autocomplete"

const FALLBACK_BENCHMARK = { min: 4000, avg: 6500, max: 9500 }

export function StepLocalSalario({
  cidade,
  setCidade,
  estado,
  setEstado,
  latitude,
  setLatitude,
  longitude,
  setLongitude,
  modalidade,
  salario,
  setSalario,
  categoria,
  errors,
}: {
  cidade: string
  setCidade: (v: string) => void
  estado: string
  setEstado: (v: string) => void
  latitude?: number
  setLatitude: (v: number) => void
  longitude?: number
  setLongitude: (v: number) => void
  modalidade: VagaModalidade
  salario: number
  setSalario: (v: number) => void
  categoria: VagaCategoria
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

  // Fecha a lista ao clicar fora
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

  const benchmark = SALARY_BENCHMARKS[categoria]?.["PLENO"] ?? FALLBACK_BENCHMARK
  const referencias = [
    { label: "Piso inicial", value: benchmark.min },
    { label: "Média de mercado", value: benchmark.avg, recommended: true },
    { label: "Teto competitivo", value: benchmark.max },
  ]

  return (
    <div className="space-y-6">
      <StepHeader
        step={2}
        title="Onde fica a vaga e qual a remuneração?"
        description="Localização integrada à base oficial do IBGE e faixas salariais atualizadas."
      />

      {/* Bloco de Localização */}
      <StepCard>
        <div className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-bold text-foreground">
              Buscar endereço ou ponto de referência
            </label>
            <AddressAutocomplete
              initialCity={cidade}
              initialState={estado}
              initialCoords={
                latitude != null && longitude != null ? { latitude, longitude } : null
              }
              onSelectLocation={(loc) => {
                setCidade(loc.cidade)
                setEstado(loc.estado)
                setLatitude(loc.latitude)
                setLongitude(loc.longitude)
              }}
              error={errors.cidade}
            />
            <p className="mt-2 text-xs text-muted-foreground">
              As coordenadas aproximadas ajudam os candidatos a avaliar a distância até a empresa.
            </p>
          </div>

       


          {latitude != null && longitude != null && (
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs text-muted-foreground">
              <Crosshair className="size-3.5 shrink-0 text-primary" aria-hidden />
              <span>
                Pin geográfico ativo:{" "}
                <strong className="font-semibold text-foreground">
                  {latitude.toFixed(4)}, {longitude.toFixed(4)}
                </strong>
              </span>
            </div>
          )}
        </div>

        {modalidade === "REMOTO" && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-success/30 bg-success-subtle/60 p-4 text-xs leading-relaxed text-success-foreground">
            <Info className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
            <span>
              <strong>Vaga 100% Remota:</strong> A cidade informada servirá apenas como base fiscal
              e referência de fuso horário para os candidatos.
            </span>
          </div>
        )}
      </StepCard>

      {/* Bloco de Salário Estilo Airbnb Pricing */}
      <StepCard>
        <Field
          label="Salário mensal bruto"
          error={errors.salario}
          hint="Anúncios com remuneração transparente recebem até 3x mais candidatos qualificados."
        >
          <div className="mt-2 flex items-baseline gap-3 rounded-2xl border border-border bg-surface p-4 focus-within:border-foreground focus-within:ring-1 focus-within:ring-foreground sm:max-w-xs">
            <span className="text-lg font-bold text-muted-foreground">R$</span>
            <input
              type="number"
              min={0}
              step={100}
              value={salario || ""}
              onChange={(e) => setSalario(Number(e.target.value))}
              aria-invalid={Boolean(errors.salario)}
              className="w-full bg-transparent text-2xl font-extrabold tracking-tight text-foreground focus:outline-none"
            />
            <span className="shrink-0 text-xs font-semibold text-muted-foreground">/ mês</span>
          </div>
        </Field>

        <div className="mt-6 rounded-2xl border border-border/80 bg-surface/60 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground">
                <TrendingUp className="size-4 text-primary" aria-hidden />
                Faixas praticadas no mercado
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Baseado na área de{" "}
                <strong className="text-foreground">{CATEGORIA_LABELS[categoria]}</strong>
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {referencias.map((ref) => {
              const isApplied = Number(salario) === ref.value
              return (
                <button
                  key={ref.label}
                  type="button"
                  onClick={() => setSalario(ref.value)}
                  className={`group relative flex flex-col justify-between rounded-2xl border p-4 text-left transition-all active:scale-[0.98] ${
                    isApplied
                      ? "border-foreground bg-card ring-1 ring-foreground shadow-xs"
                      : ref.recommended
                        ? "border-primary/50 bg-primary-subtle/40 hover:border-primary"
                        : "border-border bg-card hover:border-foreground/40"
                  }`}
                >
                  <div className="flex w-full items-center justify-between gap-2">
                    <span className="text-xs font-bold text-muted-foreground">{ref.label}</span>
                    {ref.recommended && (
                      <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">
                        Sugerido
                      </span>
                    )}
                  </div>

                  <span className="mt-2 block text-lg font-extrabold tracking-tight text-foreground">
                    {formatCurrency(ref.value)}
                  </span>

                  <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                    {isApplied ? (
                      <>
                        <Check className="size-3.5" aria-hidden /> Valor aplicado
                      </>
                    ) : (
                      "Usar este valor"
                    )}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </StepCard>
    </div>
  )
}