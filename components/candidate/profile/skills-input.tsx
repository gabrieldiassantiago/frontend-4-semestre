"use client"

import { useState } from "react"
import { Plus, X } from "lucide-react"

const SUGESTOES = [
  "Atendimento ao público", "Organização", "Comunicação", "Trabalho em equipe",
  "Vendas", "Resolução de problemas", "Planejamento", "Liderança", "Excel", "Inglês",
]

/**
 * Editor de habilidades em chips.
 * O campo de texto vira uma habilidade no Enter ou na vírgula — digitar uma
 * lista separada por vírgula em um input só torna difícil corrigir um item.
 */
export function SkillsInput({
  skills,
  onChange,
}: {
  skills: string[]
  onChange: (skills: string[]) => void
}) {
  const [valor, setValor] = useState("")

  function adicionar(bruto: string) {
    const nova = bruto.trim().replace(/,$/, "")
    if (!nova) return
    if (skills.some((skill) => skill.toLowerCase() === nova.toLowerCase())) {
      setValor("")
      return
    }
    onChange([...skills, nova])
    setValor("")
  }

  function remover(skill: string) {
    onChange(skills.filter((item) => item !== skill))
  }

  const disponiveis = SUGESTOES.filter(
    (sugestao) => !skills.some((skill) => skill.toLowerCase() === sugestao.toLowerCase()),
  ).slice(0, 6)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          className="field-input min-w-0 flex-1"
          value={valor}
          onChange={(event) => {
            const texto = event.target.value
            if (texto.endsWith(",")) adicionar(texto)
            else setValor(texto)
          }}
          onKeyDown={(event) => {
            if (event.nativeEvent.isComposing || event.keyCode === 229) return
            if (event.key === "Enter") {
              event.preventDefault()
              adicionar(valor)
            }
            if (event.key === "Backspace" && !valor && skills.length > 0) {
              remover(skills[skills.length - 1])
            }
          }}
          placeholder="Ex.: Comunicação"
          enterKeyHint="done"
          aria-label="Nova habilidade"
        />
        <button
          type="button"
          onClick={() => adicionar(valor)}
          className="btn-secondary shrink-0"
          disabled={!valor.trim()}
        >
          <Plus className="size-4" aria-hidden />
          Adicionar
        </button>
      </div>

      {skills.length > 0 && (
        <ul className="flex flex-wrap gap-1.5">
          {skills.map((skill) => (
            <li key={skill}>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-subtle py-1 pl-3 pr-1.5 text-xs font-semibold text-primary-subtle-foreground">
                {skill}
                <button
                  type="button"
                  onClick={() => remover(skill)}
                  aria-label={`Remover ${skill}`}
                  className="grid size-11 place-items-center rounded-full transition-colors hover:bg-primary/20 md:size-5"
                >
                  <X className="size-3" aria-hidden />
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}

      {disponiveis.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-subtle-foreground">Sugestões:</span>
          {disponiveis.map((sugestao) => (
            <button
              key={sugestao}
              type="button"
              onClick={() => adicionar(sugestao)}
              className="min-h-11 rounded-full border border-border bg-background px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground md:min-h-0 md:px-2.5 md:py-1"
            >
              {sugestao}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
