import {
  Briefcase,
  FileText,
  Gift,
  Layers,
  ListChecks,
  MapPin,
  Rocket,
  Wallet,
  type LucideIcon,
} from "lucide-react"
import type { KeyboardEvent } from "react"
import { formatCurrency } from "@/lib/format"
import {
  CATEGORIA_LABELS,
  MODALIDADE_LABELS,
} from "@/lib/types/vaga.types"
import type { DraftErrors, StepId, VagaDraft } from "./types"

export interface FlowStep {
  id: StepId
  label: string
  title: string
  description: string
  icon: LucideIcon
}

export const FLOW_STEPS: FlowStep[] = [
  {
    id: "titulo",
    label: "Cargo",
    title: "Qual vaga você quer abrir?",
    description: "Use o nome que um candidato digitaria na busca. Simples e direto funciona melhor.",
    icon: Briefcase,
  },
  {
    id: "perfil",
    label: "Perfil",
    title: "Como é essa posição?",
    description: "Área, modelo de trabalho e posições abertas ajudam a recomendar a vaga para as pessoas certas.",
    icon: Layers,
  },
  {
    id: "local",
    label: "Local",
    title: "Onde a pessoa vai trabalhar?",
    description: "Candidatos usam a distância para decidir. Um endereço aproximado já ajuda bastante.",
    icon: MapPin,
  },
  {
    id: "salario",
    label: "Salário",
    title: "Quanto a vaga paga?",
    description: "Vagas com salário transparente recebem até 3x mais candidaturas qualificadas.",
    icon: Wallet,
  },
  {
    id: "beneficios",
    label: "Benefícios",
    title: "O que vem junto com o salário?",
    description: "Toque para marcar. Você pode adicionar benefícios exclusivos da sua empresa.",
    icon: Gift,
  },
  {
    id: "descricao",
    label: "Descrição",
    title: "Conte o dia a dia da vaga",
    description: "Criamos um rascunho com base nas suas respostas. Ajuste o que quiser.",
    icon: FileText,
  },
  {
    id: "processo",
    label: "Processo",
    title: "Como será o processo seletivo?",
    description: "Monte as etapas na ordem em que os candidatos vão avançar.",
    icon: ListChecks,
  },
  {
    id: "revisao",
    label: "Revisão",
    title: "Tudo pronto para publicar?",
    description: "Confira os detalhes. Você pode editar qualquer parte antes de colocar a vaga no ar.",
    icon: Rocket,
  },
]

export const STEP_COUNT = FLOW_STEPS.length

/**
 * Na edição, as etapas do processo seletivo ficam fixas (a API não permite
 * alterá-las depois da publicação) e a revisão vira a tela de salvar.
 */
export const EDIT_STEPS: FlowStep[] = FLOW_STEPS.filter((step) => step.id !== "processo").map((step) => {
  switch (step.id) {
    case "titulo":
      return { ...step, title: "Nome da vaga", description: "Ajuste o título exibido na busca e na página pública." }
    case "perfil":
      return { ...step, title: "Perfil da posição", description: "Área, modelo de trabalho e quantidade de vagas." }
    case "local":
      return { ...step, title: "Local de trabalho", description: "Onde a pessoa contratada vai atuar." }
    case "salario":
      return { ...step, title: "Salário", description: "Valores transparentes atraem candidaturas mais qualificadas." }
    case "beneficios":
      return { ...step, title: "Benefícios", description: "Marque ou desmarque o que a vaga oferece." }
    case "descricao":
      return { ...step, title: "Descrição", description: "Atualize responsabilidades, requisitos e diferenciais." }
    case "revisao":
      return {
        ...step,
        label: "Revisão",
        title: "Revise e salve as alterações",
        description: "As mudanças ficam visíveis para os candidatos assim que você salvar.",
      }
    default:
      return step
  }
})

export function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim()
}

export function validateStep(id: StepId, draft: VagaDraft): DraftErrors {
  switch (id) {
    case "titulo":
      if (!draft.titulo.trim()) return { titulo: "Dê um nome para a vaga." }
      if (draft.titulo.trim().length < 3) return { titulo: "Use pelo menos 3 caracteres." }
      return {}
    case "perfil":
      if (!draft.quantidadeVagas || draft.quantidadeVagas < 1) {
        return { quantidadeVagas: "A vaga deve ter pelo menos 1 posição disponível." }
      }
      return {}
    case "local":
      return draft.cidade.trim() ? {} : { cidade: "Escolha onde fica a vaga." }
    case "salario":
      return draft.salario > 0 ? {} : { salario: "Informe um salário maior que zero." }
    case "descricao":
      return stripHtml(draft.descricao) ? {} : { descricao: "Escreva a descrição da vaga." }
    case "processo":
      return draft.etapas.length > 20 ? { etapas: "Selecione no máximo 20 etapas." } : draft.etapas.length > 0 ? {} : { etapas: "Escolha pelo menos uma etapa." }
    default:
      return {}
  }
}

/** Resumo curto exibido na trilha lateral depois que a etapa é visitada. */
export function stepSummary(id: StepId, draft: VagaDraft): string | null {
  switch (id) {
    case "titulo":
      return draft.titulo.trim() || null
    case "perfil": {
      const vagas = draft.quantidadeVagas || 1
      return `${MODALIDADE_LABELS[draft.modalidade]} · ${vagas} ${vagas === 1 ? "vaga" : "vagas"}`
    }
    case "local":
      return draft.cidade ? `${draft.cidade}${draft.estado ? `, ${draft.estado}` : ""}` : null
    case "salario":
      return draft.salario > 0 ? formatCurrency(draft.salario) : null
    case "beneficios":
      return `${draft.beneficios.length} ${draft.beneficios.length === 1 ? "benefício" : "benefícios"}`
    case "descricao": {
      const length = stripHtml(draft.descricao).length
      return length ? `${length} caracteres` : null
    }
    case "processo":
      return `${draft.etapas.length} ${draft.etapas.length === 1 ? "etapa" : "etapas"}`
    default:
      return null
  }
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

export function buildDescriptionTemplate(draft: VagaDraft): string {
  const cargo = escapeHtml(draft.titulo.trim() || CATEGORIA_LABELS[draft.categoria])
  const modalidade = MODALIDADE_LABELS[draft.modalidade]
  const area = CATEGORIA_LABELS[draft.categoria]

  return [
    "<h3>Sobre a vaga</h3>",
    `<p>Estamos em busca de <strong>${cargo}</strong> para atuar em formato <strong>${modalidade}</strong>.</p>`,
    "<h3>Responsabilidades</h3>",
    "<ul>",
    `<li><p>Atuar no desenvolvimento e na entrega de soluções da área de ${area}.</p></li>`,
    "<li><p>Participar de reuniões de alinhamento, planejamento e acompanhamento de entregas.</p></li>",
    "<li><p>Propor melhorias de processo e compartilhar conhecimento com o time.</p></li>",
    "</ul>",
    "<h3>Requisitos</h3>",
    "<ul>",
    `<li><p>Experiência compatível com a posição e área de atuação.</p></li>`,
    "<li><p>Autonomia e boa capacidade de resolução de problemas.</p></li>",
    "<li><p>Comunicação clara e trabalho colaborativo.</p></li>",
    "</ul>",
    "<h3>Diferenciais</h3>",
    "<ul>",
    "<li><p>Vivência com metodologias ágeis.</p></li>",
    "<li><p>Cases ou projetos anteriores relevantes na área.</p></li>",
  ].join("")
}

export function isEnterSubmit(event: KeyboardEvent) {
  return event.key === "Enter" && !event.nativeEvent.isComposing && event.keyCode !== 229
}
