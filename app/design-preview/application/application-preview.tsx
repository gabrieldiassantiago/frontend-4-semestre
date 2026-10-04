"use client"

import { useState } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ApplicationDetailScreen } from "@/components/candidate/applications/application-detail-screen"
import { SelectaLogo } from "@/components/ui/selecta-logo"
import { queryKeys } from "@/lib/queries/keys"
import { STATUS_LABELS, type CandidaturaDetalhe, type StatusCandidatura } from "@/lib/types/candidatura.types"

const id="application-preview"
function example(status: StatusCandidatura): CandidaturaDetalhe {
  return {
    candidatura:{id,vagaId:"job-preview",vagaTitulo:"Desenvolvedor frontend",nomeEmpresa:"Horizonte Tecnologia",status,etapaAtual:status==="APROVADA"?"PROPOSTA":"ENTREVISTA_RH",createdAt:"2026-09-26T10:00:00",updatedAt:"2026-10-02T14:30:00",etapasVaga:[{etapa:"INSCRICAO",descricao:"Inscrição",ordem:1},{etapa:"TRIAGEM",descricao:"Avaliação de perfil",ordem:2},{etapa:"ENTREVISTA_RH",descricao:"Conversa com a equipe",ordem:3},{etapa:"PROPOSTA",descricao:"Apresentação de proposta",ordem:4},{etapa:"CONTRATACAO",descricao:"Contratação",ordem:5}],cartaApresentacao:"Tenho experiência com desenvolvimento de interfaces e interesse em contribuir com a equipe de produto."},
    historico:[{id:"history-1",etapaNova:"INSCRICAO",statusNovo:"EM_ANDAMENTO",observacao:"Candidatura recebida.",createdAt:"2026-09-26T10:00:00"},{id:"history-2",etapaAnterior:"INSCRICAO",etapaNova:"TRIAGEM",statusNovo:"EM_ANDAMENTO",observacao:"Seu perfil foi encaminhado para análise.",createdAt:"2026-09-28T11:00:00"},{id:"history-3",etapaAnterior:"TRIAGEM",etapaNova:status==="APROVADA"?"PROPOSTA":"ENTREVISTA_RH",statusAnterior:"EM_ANDAMENTO",statusNovo:status,observacao:status==="EM_ANDAMENTO"?"Gostaríamos de conhecer melhor sua trajetória em uma conversa com a equipe.":"Situação atualizada pela empresa.",createdAt:"2026-10-02T14:30:00"}],
    feedbacks:[{id:"feedback-1",etapa:"TRIAGEM",titulo:"Análise do perfil",mensagem:"Sua experiência com interfaces e os projetos apresentados estão alinhados com a oportunidade. Na próxima conversa, queremos entender melhor sua participação nesses projetos.",createdAt:"2026-10-02T14:30:00",autorNome:"Equipe de recrutamento"}],
    agendamentos:status==="EM_ANDAMENTO"?[{id:"meeting-preview",candidaturaId:id,etapa:"ENTREVISTA_RH",titulo:"Conversa com a equipe de recrutamento",inicio:"2026-10-05T14:00:00",duracaoMinutos:30,link:"https://example.com/reuniao",status:"PENDENTE",mensagem:"Uma conversa sobre sua trajetória, seus projetos e expectativas para a vaga."}]:[],
  }
}
function createClient() {
  const client=new QueryClient({defaultOptions:{queries:{staleTime:Infinity,retry:false,refetchOnMount:false,refetchOnWindowFocus:false}}})
  client.setQueryData(queryKeys.candidaturas.detalhe(id),example("EM_ANDAMENTO"))
  client.setQueryData(queryKeys.vagas.detail("job-preview"),{id:"job-preview",nomeEmpresa:"Horizonte Tecnologia"})
  return client
}
export function ApplicationPreview() {
  const [client]=useState(createClient)
  const [status,setStatus]=useState<StatusCandidatura>("EM_ANDAMENTO")
  return <QueryClientProvider client={client}>
    <div className="min-h-dvh bg-surface" onClickCapture={event=>{
      const target=event.target as HTMLElement
      if(target.closest('a[href]') && !target.closest('a[href^="#"]')) {event.preventDefault();event.stopPropagation()}
      if(/Confirmar desistência|Confirmar presença|Recusar convite|Atualizar/.test(target.closest("button")?.textContent || "")) {event.preventDefault();event.stopPropagation()}
    }}>
      <header className="border-b border-border bg-card px-6 py-5"><SelectaLogo className="h-7" /></header>
      <ApplicationDetailScreen id={id} />
    </div>
    <div className="fixed bottom-3 right-3 z-[60] flex max-w-[calc(100vw-24px)] flex-wrap items-center gap-1 rounded-lg border border-border bg-card p-2 text-xs shadow-sm"><span className="px-2 text-muted-foreground">Prévia visual</span>{(["EM_ANDAMENTO","APROVADA","REPROVADA","CANCELADA"] as const).map(item=><button type="button" key={item} onClick={()=>{setStatus(item);client.setQueryData(queryKeys.candidaturas.detalhe(id),example(item))}} aria-pressed={status===item} className={"rounded-md px-2 py-2 " +(status===item?"bg-primary-subtle text-primary":"text-muted-foreground")}>{STATUS_LABELS[item]}</button>)}</div>
  </QueryClientProvider>
}
