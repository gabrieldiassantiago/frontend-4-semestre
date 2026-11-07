"use client"

import { createEtapaAction } from "@/actions/etapas"
import { unwrap } from "@/lib/actions/result"
import { useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { ArrowDown, ArrowUp, Flag, Plus, X } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"
import type { TipoEtapa } from "@/lib/types/etapa.types"
import { FieldError, QuestionHeader } from "../primitives"
import { isEnterSubmit } from "../steps"
import type { StepProps } from "../types"

export function getEtapaLabel(etapa: string, catalogo?: TipoEtapa[]) {
  return catalogo?.find(item => item.id_etapa === etapa)?.nome ?? "Etapa do processo"
}

export function StepProcesso({ draft, update, errors }: StepProps) {
  const queryClient = useQueryClient()
  const reduceMotion = useReducedMotion()
  const [tagInput, setTagInput] = useState("")
  const { etapas, metaTags } = draft
  const [nome, setNome] = useState("")
  const [descricao, setDescricao] = useState("")
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const options = (draft.etapasCatalogo ?? []).map(item => ({ value: item.id_etapa, label: item.nome, hint: item.descricao }))
  const disponiveis = options.filter(item => !etapas.includes(item.value))
  async function criar() {
    if (!nome.trim() || saving || etapas.length >= 20) return
    setSaving(true)
    setErro(null)
    try {
      const etapa = unwrap(await createEtapaAction({ nomeEtapa: nome.trim(), descricao: descricao.trim() }))
      update({ etapasCatalogo: [...(draft.etapasCatalogo ?? []), etapa], etapas: [...etapas, etapa.id_etapa] })
      queryClient.setQueryData<{ options: TipoEtapa[]; padrao: TipoEtapa[] }>(["etapas", etapa.company_id], prev => prev ? { ...prev, options: [...prev.options.filter(item => item.id_etapa !== etapa.id_etapa), etapa] } : prev)
      setNome("")
      setDescricao("")
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Não foi possível criar a etapa.")
    } finally { setSaving(false) }
  }

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= etapas.length) return
    const next = [...etapas]
    ;[next[index], next[target]] = [next[target], next[index]]
    update({ etapas: next })
  }

  const addTags = (raw: string) => {
    const novas = raw
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag && !metaTags.some((existing) => existing.toLowerCase() === tag.toLowerCase()))
    if (novas.length) update({ metaTags: [...metaTags, ...novas] })
    setTagInput("")
  }

  return (
    <div>
      <QuestionHeader stepId="processo" />

      <ol className="relative space-y-2" aria-label="Etapas do processo, em ordem">
        <li className="flex items-center gap-3 rounded-2xl bg-surface px-4 py-3">
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-success-subtle text-success">
            <Flag className="size-4" aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-foreground">Inscrição</span>
            <span className="block text-xs text-muted-foreground">Automática quando o candidato se aplica</span>
          </span>
        </li>

        <AnimatePresence initial={false}>
          {etapas.map((etapa, index) => {
            const item = options.find((option) => option.value === etapa)
            return (
              <motion.li
                key={etapa}
                layout={!reduceMotion}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3"
              >
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold tabular-nums text-primary-foreground">
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-foreground">{item?.label ?? "Etapa indisponível — remova e selecione novamente"}</span>
                  {item?.hint && (
                    <span className="block truncate text-xs text-muted-foreground">{item.hint}</span>
                  )}
                </span>
                <span className="flex shrink-0 items-center">
                  <button
                    type="button"
                    disabled={saving || index === 0}
                    onClick={() => move(index, -1)}
                    aria-label={`Mover ${item?.label} para cima`}
                    className="grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-25"
                  >
                    <ArrowUp className="size-4" aria-hidden />
                  </button>
                  <button
                    type="button"
                    disabled={saving || index === etapas.length - 1}
                    onClick={() => move(index, 1)}
                    aria-label={`Mover ${item?.label} para baixo`}
                    className="grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-25"
                  >
                    <ArrowDown className="size-4" aria-hidden />
                  </button>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => update({ etapas: etapas.filter((value) => value !== etapa) })}
                    aria-label={`Remover ${item?.label}`}
                    className="grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-danger-subtle hover:text-danger-foreground"
                  >
                    <X className="size-4" aria-hidden />
                  </button>
                </span>
              </motion.li>
            )
          })}
        </AnimatePresence>
        <li className="rounded-2xl bg-surface px-4 py-3 text-sm font-semibold">Encerrada <span className="font-normal text-muted-foreground">· Automática ao finalizar o processo</span></li>
      </ol>
      <FieldError message={errors.etapas} />

      {disponiveis.length > 0 && (
        <div className="mt-5">
          <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Adicionar etapa
          </p>
          <div className="flex flex-wrap gap-2">
            {disponiveis.map((item) => (
              <button
                key={item.value}
                type="button"
                disabled={etapas.length >= 20 || saving}
                onClick={() => update({ etapas: [...etapas, item.value] })}
                className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-border-strong px-3.5 py-2 text-sm font-medium text-strong-foreground transition-all hover:border-primary hover:bg-primary-subtle hover:text-primary-subtle-foreground active:scale-95"
              >
                <Plus className="size-3.5" aria-hidden />
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <section className="mt-6 space-y-3 rounded-xl border border-border p-4" aria-label="Criar etapa personalizada">
        <h3 className="text-sm font-semibold">Criar etapa personalizada</h3>
        <p className="text-xs text-muted-foreground">A etapa ficará disponível para sua empresa e será adicionada a esta vaga. Até 20 etapas intermediárias.</p>
        <label className="block text-sm">Nome da etapa<input className="field-input mt-1" value={nome} maxLength={100} disabled={saving} onChange={event => setNome(event.target.value)} /></label>
        <label className="block text-sm">Descrição para o candidato<textarea className="field-input mt-1" value={descricao} maxLength={255} disabled={saving} onChange={event => setDescricao(event.target.value)} /></label>
        {erro && <p role="alert" className="text-sm text-danger-foreground">{erro}</p>}
        <button type="button" className="btn-secondary" disabled={saving || !nome.trim() || etapas.length >= 20} onClick={() => void criar()}>{saving ? "Criando…" : "Criar e adicionar etapa"}</button>
      </section>
      <div className="mt-10 border-t border-border pt-8">
        <label htmlFor="vaga-meta-tags" className="text-sm font-semibold text-strong-foreground">
          Competências e palavras-chave
        </label>
        <p className="mt-1 text-xs text-muted-foreground">
          Opcional. Ajudam a recomendar a vaga. Pressione Enter ou vírgula para adicionar.
        </p>
        <div className="mt-3 flex min-h-12 flex-wrap items-center gap-1.5 rounded-xl border border-border bg-background p-2 transition-colors focus-within:border-primary">
          {metaTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-lg bg-muted py-1 pl-2.5 pr-1 text-sm font-medium text-strong-foreground"
            >
              {tag}
              <button
                type="button"
                onClick={() => update({ metaTags: metaTags.filter((value) => value !== tag) })}
                aria-label={`Remover ${tag}`}
                className="grid size-5 place-items-center rounded-md transition-colors hover:bg-border"
              >
                <X className="size-3" aria-hidden />
              </button>
            </span>
          ))}
          <input
            id="vaga-meta-tags"
            value={tagInput}
            onChange={(event) => {
              const value = event.target.value
              if (value.includes(",")) addTags(value)
              else setTagInput(value)
            }}
            onKeyDown={(event) => {
              if (isEnterSubmit(event)) {
                event.preventDefault()
                addTags(tagInput)
              } else if (event.key === "Backspace" && !tagInput && metaTags.length) {
                update({ metaTags: metaTags.slice(0, -1) })
              }
            }}
            onBlur={() => tagInput.trim() && addTags(tagInput)}
            placeholder={metaTags.length ? "" : "Java, SQL, React, atendimento"}
            className="min-w-32 flex-1 bg-transparent px-1.5 py-1 text-sm text-foreground placeholder:text-subtle-foreground focus:outline-none"
          />
        </div>
      </div>
    </div>
  )
}
