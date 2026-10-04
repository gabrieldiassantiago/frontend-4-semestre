"use server"

import { apiFetch, buildQuery } from "@/lib/server/api"
import type { ActionResult } from "@/lib/actions/result"
import type {
  AvancarEtapaDto,
  CandidaturaAgendamento,
  Candidatura,
  CandidaturaDetalhe,
  CandidaturaFeedback,
  CandidaturaFilters,
  CreateCandidaturaDto,
  CreateAgendamentoDto,
  CreateFeedbackDto,
  DecidirCandidaturaDto,
  EtapaProcesso,
} from "@/lib/types/candidatura.types"

const id = (value: string) => encodeURIComponent(value)

// ── Candidato ──────────────────────────────────────────────────────────────

/** 409 = candidatura duplicada ou vaga inativa. 403 = usuário não é CANDIDATE. */
export async function criarCandidaturaAction(dto: CreateCandidaturaDto): Promise<ActionResult<Candidatura>> {
  return apiFetch<Candidatura>("/candidaturas", { method: "POST", body: dto })
}

export async function getMinhasCandidaturasAction(): Promise<ActionResult<Candidatura[]>> {
  return apiFetch<Candidatura[]>("/candidaturas/me")
}

export async function getCandidaturaDetalheAction(candidaturaId: string): Promise<ActionResult<CandidaturaDetalhe>> {
  return apiFetch<CandidaturaDetalhe>(`/candidaturas/${id(candidaturaId)}`)
}

export async function getMeusFeedbacksAction(candidaturaId: string, etapa?: EtapaProcesso): Promise<ActionResult<CandidaturaFeedback[]>> {
  return apiFetch<CandidaturaFeedback[]>(`/candidaturas/${id(candidaturaId)}/feedbacks${buildQuery({ etapa })}`)
}

/** Não apaga nada: a candidatura vira CANCELADA. */
export async function desistirCandidaturaAction(candidaturaId: string): Promise<ActionResult<Candidatura>> {
  return apiFetch<Candidatura>(`/candidaturas/${id(candidaturaId)}`, { method: "DELETE" })
}

export async function confirmarAgendamentoAction(candidaturaId: string, agendamentoId: string): Promise<ActionResult<CandidaturaAgendamento>> {
  return apiFetch<CandidaturaAgendamento>(`/candidaturas/${id(candidaturaId)}/agendamentos/${id(agendamentoId)}/confirmar`, { method: "PATCH" })
}

export async function recusarAgendamentoAction(candidaturaId: string, agendamentoId: string): Promise<ActionResult<CandidaturaAgendamento>> {
  return apiFetch<CandidaturaAgendamento>(`/candidaturas/${id(candidaturaId)}/agendamentos/${id(agendamentoId)}/recusar`, { method: "PATCH" })
}

// ── Empresa ────────────────────────────────────────────────────────────────

export async function getCandidaturasEmpresaAction(filters?: CandidaturaFilters): Promise<ActionResult<Candidatura[]>> {
  const query = buildQuery({
    vagaId: filters?.vagaId,
    status: filters?.status,
    etapa: filters?.etapa,
    candidatoNome: filters?.candidatoNome,
  })
  return apiFetch<Candidatura[]>(`/empresa/candidaturas${query}`)
}

export async function getCandidaturaEmpresaDetalheAction(candidaturaId: string): Promise<ActionResult<CandidaturaDetalhe>> {
  return apiFetch<CandidaturaDetalhe>(`/empresa/candidaturas/${id(candidaturaId)}`)
}

export async function avancarEtapaAction(candidaturaId: string, dto: AvancarEtapaDto): Promise<ActionResult<Candidatura>> {
  return apiFetch<Candidatura>(`/empresa/candidaturas/${id(candidaturaId)}/etapa`, { method: "PATCH", body: dto })
}

/** APROVADA move a etapa para CONTRATACAO no backend. */
export async function decidirCandidaturaAction(candidaturaId: string, dto: DecidirCandidaturaDto): Promise<ActionResult<Candidatura>> {
  return apiFetch<Candidatura>(`/empresa/candidaturas/${id(candidaturaId)}/status`, { method: "PATCH", body: dto })
}

export async function criarAgendamentoAction(candidaturaId: string, dto: CreateAgendamentoDto): Promise<ActionResult<CandidaturaAgendamento>> {
  return apiFetch<CandidaturaAgendamento>(`/empresa/candidaturas/${id(candidaturaId)}/agendamentos`, { method: "POST", body: dto })
}

export async function atualizarAgendamentoAction(
  candidaturaId: string,
  agendamentoId: string,
  dto: CreateAgendamentoDto,
): Promise<ActionResult<CandidaturaAgendamento>> {
  return apiFetch<CandidaturaAgendamento>(`/empresa/candidaturas/${id(candidaturaId)}/agendamentos/${id(agendamentoId)}`, { method: "PUT", body: dto })
}

export async function cancelarAgendamentoAction(candidaturaId: string, agendamentoId: string, motivo?: string): Promise<ActionResult<void>> {
  return apiFetch<void>(`/empresa/candidaturas/${id(candidaturaId)}/agendamentos/${id(agendamentoId)}${buildQuery({ motivo })}`, { method: "DELETE" })
}

export async function criarFeedbackAction(candidaturaId: string, dto: CreateFeedbackDto): Promise<ActionResult<CandidaturaFeedback>> {
  return apiFetch<CandidaturaFeedback>(`/empresa/candidaturas/${id(candidaturaId)}/feedbacks`, { method: "POST", body: dto })
}

export async function getFeedbacksEmpresaAction(candidaturaId: string, etapa?: EtapaProcesso): Promise<ActionResult<CandidaturaFeedback[]>> {
  return apiFetch<CandidaturaFeedback[]>(`/empresa/candidaturas/${id(candidaturaId)}/feedbacks${buildQuery({ etapa })}`)
}

export async function atualizarFeedbackAction(
  candidaturaId: string,
  feedbackId: string,
  dto: CreateFeedbackDto,
): Promise<ActionResult<CandidaturaFeedback>> {
  return apiFetch<CandidaturaFeedback>(`/empresa/candidaturas/${id(candidaturaId)}/feedbacks/${id(feedbackId)}`, {
    method: "PUT",
    body: dto,
  })
}

export async function removerFeedbackAction(candidaturaId: string, feedbackId: string): Promise<ActionResult<void>> {
  return apiFetch<void>(`/empresa/candidaturas/${id(candidaturaId)}/feedbacks/${id(feedbackId)}`, { method: "DELETE" })
}
