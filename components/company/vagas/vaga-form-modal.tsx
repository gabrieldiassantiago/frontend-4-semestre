"use client"

import { useEffect, useRef, useState } from "react"
import { Briefcase, DollarSign, Loader2, MapPin, X } from "lucide-react"
import { createVaga, updateVaga } from "@/lib/services/vagas.service"
import {
  CATEGORIA_LABELS,
  MODALIDADE_LABELS,
  NIVEL_LABELS,
  type CreateVagaDto,
  type Vaga,
  type VagaCategoria,
  type VagaModalidade,
  type NivelExperiencia,
} from "@/lib/types/vaga.types"

const CATEGORIAS = Object.entries(CATEGORIA_LABELS) as [VagaCategoria, string][]
const MODALIDADES = Object.entries(MODALIDADE_LABELS) as [VagaModalidade, string][]
const NIVEIS = Object.entries(NIVEL_LABELS) as [NivelExperiencia, string][]

const EMPTY_FORM: FormState = {
  titulo: "",
  salario: "",
  descricao: "",
  beneficios: "",
  cidade: "",
  estado: "",
  categoria: "DESENVOLVIMENTO_SOFTWARE",
  modalidade: "HIBRIDO",
  nivelExperiencia: "PLENO",
}

interface FormState {
  titulo: string
  salario: string
  descricao: string
  beneficios: string
  cidade: string
  estado: string
  categoria: VagaCategoria
  modalidade: VagaModalidade
  nivelExperiencia: NivelExperiencia
}

interface VagaFormModalProps {
  companyProfileId: string
  vagaToEdit?: Vaga | null
  onSuccess: (vaga: Vaga) => void
  onClose: () => void
}

export function VagaFormModal({ companyProfileId, vagaToEdit, onSuccess, onClose }: VagaFormModalProps) {
  const isEditing = Boolean(vagaToEdit)
  const overlayRef = useRef<HTMLDivElement>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (vagaToEdit) {
      setForm({
        titulo: vagaToEdit.titulo,
        salario: String(vagaToEdit.salario),
        descricao: vagaToEdit.descricao,
        beneficios: vagaToEdit.beneficios ?? "",
        cidade: vagaToEdit.cidade,
        estado: vagaToEdit.estado,
        categoria: vagaToEdit.categoria,
        modalidade: vagaToEdit.modalidade,
        nivelExperiencia: vagaToEdit.nivelExperiencia,
      })
    } else {
      setForm(EMPTY_FORM)
    }
  }, [vagaToEdit])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", handleKey)
    return () => document.removeEventListener("keydown", handleKey)
  }, [onClose])

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!form.titulo.trim()) { setError("O título é obrigatório."); return }
    const salarioNum = parseFloat(form.salario)
    if (isNaN(salarioNum) || salarioNum <= 0) { setError("Informe um salário válido."); return }
    if (!form.descricao.trim()) { setError("A descrição é obrigatória."); return }
    if (!form.cidade.trim()) { setError("Informe a cidade."); return }
    if (!form.estado.trim()) { setError("Informe o estado."); return }

    setSaving(true)
    try {
      let saved: Vaga
      if (isEditing && vagaToEdit) {
        saved = await updateVaga(vagaToEdit.id, {
          titulo: form.titulo,
          salario: salarioNum,
          descricao: form.descricao,
          beneficios: form.beneficios || undefined,
          cidade: form.cidade,
          estado: form.estado,
          categoria: form.categoria,
          modalidade: form.modalidade,
          nivelExperiencia: form.nivelExperiencia,
        })
      } else {
        const dto: CreateVagaDto = {
          titulo: form.titulo,
          salario: salarioNum,
          descricao: form.descricao,
          beneficios: form.beneficios || undefined,
          companyProfileId,
          cidade: form.cidade,
          estado: form.estado,
          categoria: form.categoria,
          modalidade: form.modalidade,
          nivelExperiencia: form.nivelExperiencia,
        }
        saved = await createVaga(dto)
      }
      onSuccess(saved)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar vaga.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center"
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
    >
      <div className="relative flex max-h-[95dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl bg-background shadow-2xl sm:rounded-3xl">
        <div className="flex shrink-0 items-center justify-between border-b border-border-subtle px-6 py-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary">
              {isEditing ? "Editar vaga" : "Nova vaga"}
            </p>
            <h2 className="mt-1 text-xl font-bold tracking-tight">
              {isEditing ? "Atualizar informações" : "Criar oportunidade"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full border border-border text-muted-foreground hover:bg-muted"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form
          id="vaga-form"
          onSubmit={handleSubmit}
          className="flex-1 space-y-5 overflow-y-auto px-6 py-6"
        >
          <div className="space-y-1.5">
            <label htmlFor="vf-titulo" className="block text-sm font-semibold text-strong-foreground">
              Título da vaga <span className="text-primary">*</span>
            </label>
            <input
              id="vf-titulo"
              type="text"
              value={form.titulo}
              onChange={(e) => set("titulo", e.target.value)}
              placeholder="Ex: Desenvolvedor Backend Java"
              className="w-full rounded-xl border border-border bg-muted p-2.5 text-sm outline-none focus:bg-background focus:ring-4 focus:ring-primary/10"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="vf-salario" className="block text-sm font-semibold text-strong-foreground">
              Salário (R$) <span className="text-primary">*</span>
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle-foreground" />
              <input
                id="vf-salario"
                type="number"
                min={0}
                step={0.01}
                value={form.salario}
                onChange={(e) => set("salario", e.target.value)}
                placeholder="8500.00"
                className="w-full rounded-xl border border-border bg-muted py-2.5 pl-10 pr-3 text-sm outline-none focus:bg-background focus:ring-4 focus:ring-primary/10"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="vf-descricao" className="block text-sm font-semibold text-strong-foreground">
              Descrição <span className="text-primary">*</span>
            </label>
            <textarea
              id="vf-descricao"
              rows={4}
              value={form.descricao}
              onChange={(e) => set("descricao", e.target.value)}
              placeholder="Descreva as responsabilidades, requisitos e diferenciais da vaga..."
              className="w-full resize-none rounded-xl border border-border bg-muted p-2.5 text-sm outline-none focus:bg-background focus:ring-4 focus:ring-primary/10"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="vf-beneficios" className="block text-sm font-semibold text-strong-foreground">
              Benefícios
            </label>
            <input
              id="vf-beneficios"
              type="text"
              value={form.beneficios}
              onChange={(e) => set("beneficios", e.target.value)}
              placeholder="Ex: VR, VT, Plano de Saúde, Home Office"
              className="w-full rounded-xl border border-border bg-muted p-2.5 text-sm outline-none focus:bg-background focus:ring-4 focus:ring-primary/10"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="vf-cidade" className="block text-sm font-semibold text-strong-foreground">
                Cidade <span className="text-primary">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle-foreground" />
                <input
                  id="vf-cidade"
                  type="text"
                  value={form.cidade}
                  onChange={(e) => set("cidade", e.target.value)}
                  placeholder="São Paulo"
                  className="w-full rounded-xl border border-border bg-muted py-2.5 pl-10 pr-3 text-sm outline-none focus:bg-background focus:ring-4 focus:ring-primary/10"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="vf-estado" className="block text-sm font-semibold text-strong-foreground">
                Estado (UF) <span className="text-primary">*</span>
              </label>
              <input
                id="vf-estado"
                type="text"
                maxLength={2}
                value={form.estado}
                onChange={(e) => set("estado", e.target.value.toUpperCase())}
                placeholder="SP"
                className="w-full rounded-xl border border-border bg-muted p-2.5 text-sm uppercase outline-none focus:bg-background focus:ring-4 focus:ring-primary/10"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <label htmlFor="vf-categoria" className="block text-sm font-semibold text-strong-foreground">
                Categoria
              </label>
              <select
                id="vf-categoria"
                value={form.categoria}
                onChange={(e) => set("categoria", e.target.value as VagaCategoria)}
                className="w-full rounded-xl border border-border bg-muted p-2.5 text-sm outline-none focus:bg-background"
              >
                {CATEGORIAS.map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="vf-modalidade" className="block text-sm font-semibold text-strong-foreground">
                Modalidade
              </label>
              <select
                id="vf-modalidade"
                value={form.modalidade}
                onChange={(e) => set("modalidade", e.target.value as VagaModalidade)}
                className="w-full rounded-xl border border-border bg-muted p-2.5 text-sm outline-none focus:bg-background"
              >
                {MODALIDADES.map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="vf-nivel" className="block text-sm font-semibold text-strong-foreground">
                Nível
              </label>
              <select
                id="vf-nivel"
                value={form.nivelExperiencia}
                onChange={(e) => set("nivelExperiencia", e.target.value as NivelExperiencia)}
                className="w-full rounded-xl border border-border bg-muted p-2.5 text-sm outline-none focus:bg-background"
              >
                {NIVEIS.map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <p className="rounded-xl bg-danger-subtle px-4 py-3 text-sm font-medium text-danger-foreground">
              {error}
            </p>
          )}
        </form>

        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-border-subtle px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-border px-5 py-2.5 text-sm font-semibold hover:bg-muted"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="vaga-form"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-hover disabled:opacity-60"
          >
            {saving ? (
              <><Loader2 className="h-4 w-4 animate-spin" />{isEditing ? "Salvando..." : "Publicando..."}</>
            ) : (
              <><Briefcase className="h-4 w-4" />{isEditing ? "Salvar alterações" : "Publicar vaga"}</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
