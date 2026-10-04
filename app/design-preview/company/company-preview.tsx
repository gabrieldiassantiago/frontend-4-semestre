"use client"

import { useState } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { CompanyAppShell } from "@/components/layout/company-app-shell"
import { CompanyProfileScreen } from "@/components/company/profile/company-profile-screen"
import { CompanyDashboardScreen } from "@/components/company/dashboard/company-dashboard-screen"
import { CompanyJobsScreen } from "@/components/company/vagas/company-jobs-screen"
import { CompanyCandidatesScreen } from "@/components/company/candidates/company-candidates-screen"
import { CompanyProcessesScreen } from "@/components/company/processes/company-processes-screen"
import { queryKeys } from "@/lib/queries/keys"
import type { CompanyProfile } from "@/lib/types/company.types"
import type { Vaga } from "@/lib/types/vaga.types"

const company: CompanyProfile = { id:"company-preview", userId:"preview", companyName:"Horizonte Tecnologia", cnpj:"12.345.678/0001-90", industry:"Tecnologia da informação", website:"https://example.com", city:"São Paulo", state:"SP", latitude:-23.55, longitude:-46.63, description:"Desenvolvemos soluções digitais para empresas de diferentes setores. Nosso time reúne profissionais de tecnologia, design e negócios, com foco em colaboração e desenvolvimento contínuo." }
const jobs: Vaga[] = [
  { id:"preview-1", titulo:"Desenvolvedor frontend", salario:4500, descricao:"Desenvolvimento de produtos digitais.", companyProfileId:company.id, nomeEmpresa:company.companyName, cidade:"São Paulo", estado:"SP", categoria:"DESENVOLVIMENTO_SOFTWARE", modalidade:"HIBRIDO", nivelExperiencia:"JUNIOR", ativa:true, createdAt:"2026-10-01T12:00:00" },
  { id:"preview-2", titulo:"Analista de marketing", salario:3500, descricao:"Planejamento de campanhas.", companyProfileId:company.id, nomeEmpresa:company.companyName, cidade:"São Paulo", estado:"SP", categoria:"MARKETING_DIGITAL", modalidade:"PRESENCIAL", nivelExperiencia:"PLENO", ativa:true, createdAt:"2026-09-27T12:00:00" },
  { id:"preview-3", titulo:"Designer de produto", salario:5000, descricao:"Design de interfaces.", companyProfileId:company.id, nomeEmpresa:company.companyName, cidade:"São Paulo", estado:"SP", categoria:"DESIGN_UX_UI", modalidade:"REMOTO", nivelExperiencia:"PLENO", ativa:false, createdAt:"2026-09-20T12:00:00" },
]
function previewClient() {
  const client=new QueryClient({defaultOptions:{queries:{staleTime:Infinity,retry:false,refetchOnWindowFocus:false,refetchOnMount:false}}})
  client.setQueryData(queryKeys.companyProfile.me(),company)
  client.setQueryData(queryKeys.vagas.byEmpresa(company.id),jobs)
  client.setQueryData(queryKeys.candidaturas.empresaLista(),[
    {id:"candidate-preview-1",vagaId:"preview-1",vagaTitulo:"Desenvolvedor frontend",candidatoNome:"Marina Costa",candidatoHeadline:"Desenvolvedora frontend",etapaAtual:"ENTREVISTA_RH",status:"EM_ANDAMENTO",createdAt:"2026-10-01T12:00:00"},
    {id:"candidate-preview-2",vagaId:"preview-2",vagaTitulo:"Analista de marketing",candidatoNome:"Rafael Lima",candidatoHeadline:"Analista de marketing",etapaAtual:"TRIAGEM",status:"EM_ANDAMENTO",createdAt:"2026-09-28T12:00:00"},
    {id:"candidate-preview-3",vagaId:"preview-1",vagaTitulo:"Desenvolvedor frontend",candidatoNome:"Beatriz Oliveira",candidatoHeadline:"Desenvolvedora de software",etapaAtual:"CONTRATACAO",status:"APROVADA",createdAt:"2026-09-24T12:00:00"},
  ])
  return client
}
export function CompanyPreview() {
  const [client]=useState(previewClient)
  const [view,setView]=useState("perfil")
  return <QueryClientProvider client={client}>
    <div onSubmitCapture={event=>{event.preventDefault();event.stopPropagation()}} onChangeCapture={event=>{if(event.target instanceof HTMLInputElement && event.target.type === "file") event.stopPropagation()}} onClickCapture={event=>{
      const target=event.target as HTMLElement
      const anchor=target.closest("a")
      if(anchor?.getAttribute("href")?.startsWith("/empresa")) {event.preventDefault();event.stopPropagation();const route=anchor.getAttribute("href")!.split("/")[2];setView(["perfil","dashboard","vagas","candidatos","processos"].includes(route)?route:"perfil")}
      const button = target.closest("button")
      if(button && (/Sair da conta|Remover/.test(button.textContent || "") || /Excluir|Pausar vaga|Publicar vaga/.test(button.getAttribute("aria-label") || ""))){event.preventDefault();event.stopPropagation()}
    }}>
      <CompanyAppShell currentPath={"/empresa/" + view}>{view==="perfil"?<CompanyProfileScreen />:view==="dashboard"?<CompanyDashboardScreen />:view==="vagas"?<CompanyJobsScreen />:view==="candidatos"?<CompanyCandidatesScreen />:<CompanyProcessesScreen />}</CompanyAppShell>
    </div>
    <div className="fixed bottom-3 right-3 z-[60] flex flex-wrap items-center gap-1 rounded-lg border border-border bg-card p-2 text-xs shadow-sm" aria-label="Navegação da prévia">
      <span className="px-2 text-muted-foreground">Prévia visual</span>{["perfil","dashboard","vagas","candidatos","processos"].map(item=><button type="button" key={item} onClick={()=>setView(item)} aria-pressed={view===item} className={"rounded-md px-2 py-2 " +(view===item?"bg-primary-subtle text-primary":"text-muted-foreground")}>{item}</button>)}
    </div>
  </QueryClientProvider>
}
