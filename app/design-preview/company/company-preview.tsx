"use client"

import { useState } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { CompanyAppShell } from "@/components/layout/company-app-shell"
import { CompanyProfileScreen } from "@/components/company/profile/company-profile-screen"
import { CompanyDashboardScreen } from "@/components/company/dashboard/company-dashboard-screen"
import { CompanyJobsScreen } from "@/components/company/vagas/company-jobs-screen"
import { CompanyCandidatesScreen } from "@/components/company/candidates/company-candidates-screen"
import { CompanyCandidateDetailScreen } from "@/components/company/candidates/company-candidate-detail-screen"
import { CompanyProcessesScreen } from "@/components/company/processes/company-processes-screen"
import { EditVagaForm } from "@/components/company/vagas/edit-vaga/edit-vaga-form"
import { NovaVagaForm } from "@/components/company/vagas/nova-vaga/nova-vaga-form"
import { MessagesScreen } from "@/components/shared/chat/messages-screen"
import { queryKeys } from "@/lib/queries/keys"
import type { CompanyProfile } from "@/lib/types/company.types"
import type { Candidatura, CandidaturaDetalhe } from "@/lib/types/candidatura.types"
import type { CandidateProfile } from "@/lib/types/candidate.types"
import type { Chat, ChatMensagem } from "@/lib/types/chat.types"
import type { Vaga } from "@/lib/types/vaga.types"

const DAY = 86_400_000
const ago = (days: number, hours = 0) => new Date(Date.now() - days * DAY - hours * 3_600_000).toISOString()

const company: CompanyProfile = { id: "company-preview", userId: "preview", companyName: "Horizonte Tecnologia", cnpj: "12.345.678/0001-90", industry: "Tecnologia da informação", website: "https://example.com", city: "São Paulo", state: "SP", latitude: -23.55, longitude: -46.63, description: "Desenvolvemos soluções digitais para empresas de diferentes setores." }

const etapas = [
  { etapa: "TRIAGEM", descricao: "Triagem", ordem: 1 },
  { etapa: "ENTREVISTA_RH", descricao: "Entrevista RH", ordem: 2 },
  { etapa: "TESTE_TECNICO", descricao: "Teste técnico", ordem: 3 },
  { etapa: "PROPOSTA", descricao: "Proposta", ordem: 4 },
] as Vaga["etapas"]

const jobs: Vaga[] = [
  { id: "preview-1", titulo: "Desenvolvedor frontend", salario: 6500, descricao: "<h3>Sobre a vaga</h3><p>Desenvolvimento de produtos digitais com React e TypeScript.</p>", beneficios: "Vale-refeição, Plano de saúde, Home office", companyProfileId: company.id, nomeEmpresa: company.companyName, cidade: "São Paulo", estado: "SP", latitude: -23.55, longitude: -46.63, categoria: "DESENVOLVIMENTO_SOFTWARE", modalidade: "HIBRIDO", etapas, ativa: true, createdAt: ago(20) },
  { id: "preview-2", titulo: "Analista de marketing", salario: 4200, descricao: "Planejamento de campanhas.", companyProfileId: company.id, nomeEmpresa: company.companyName, cidade: "São Paulo", estado: "SP", categoria: "MARKETING_DIGITAL", modalidade: "PRESENCIAL", ativa: true, createdAt: ago(34) },
  { id: "preview-3", titulo: "Designer de produto", salario: 7000, descricao: "Design de interfaces.", companyProfileId: company.id, nomeEmpresa: company.companyName, cidade: "Curitiba", estado: "PR", categoria: "DESIGN_UX_UI", modalidade: "REMOTO", ativa: false, createdAt: ago(50) },
  { id: "preview-4", titulo: "Engenheiro de dados", salario: 9000, descricao: "Pipelines de dados.", companyProfileId: company.id, nomeEmpresa: company.companyName, cidade: "São Paulo", estado: "SP", categoria: "CIENCIA_DE_DADOS_IA", modalidade: "REMOTO", ativa: true, createdAt: ago(3) },
]

const people: Array<[string, string, string, Candidatura["etapaAtual"], Candidatura["status"], number]> = [
  ["Marina Costa", "Desenvolvedora frontend · React", "preview-1", "ENTREVISTA_RH", "EM_ANDAMENTO", 2],
  ["Rafael Lima", "Analista de marketing digital", "preview-2", "TRIAGEM", "EM_ANDAMENTO", 1],
  ["Beatriz Oliveira", "Desenvolvedora de software", "preview-1", "CONTRATACAO", "APROVADA", 18],
  ["Lucas Ferreira", "Engenheiro de software", "preview-1", "INSCRICAO", "EM_ANDAMENTO", 0],
  ["Ana Souza", "UX designer", "preview-3", "TESTE_TECNICO", "REPROVADA", 30],
  ["Pedro Santos", "Desenvolvedor fullstack", "preview-1", "TESTE_TECNICO", "EM_ANDAMENTO", 6],
  ["Juliana Alves", "Social media", "preview-2", "INSCRICAO", "EM_ANDAMENTO", 3],
  ["Thiago Rocha", "Frontend developer", "preview-1", "TRIAGEM", "EM_ANDAMENTO", 9],
  ["Camila Dias", "Product designer", "preview-3", "PROPOSTA", "EM_ANDAMENTO", 12],
  ["Gabriel Martins", "Estudante de engenharia", "preview-1", "INSCRICAO", "EM_ANDAMENTO", 4],
  ["Larissa Gomes", "Analista de growth", "preview-2", "ENTREVISTA_RH", "REPROVADA", 22],
]

const candidaturas: Candidatura[] = people.map(([nome, headline, vagaId, etapaAtual, status, days], index) => ({
  id: `candidate-preview-${index + 1}`,
  vagaId,
  vagaTitulo: jobs.find((job) => job.id === vagaId)!.titulo,
  candidatoNome: nome,
  candidatoEmail: `${nome.split(" ")[0].toLowerCase()}@email.com`,
  candidatoUserId: `user-${index + 1}`,
  candidatoHeadline: headline,
  etapaAtual,
  etapasVaga: vagaId === "preview-1" ? (etapas as Candidatura["etapasVaga"]) : undefined,
  status,
  totalFeedbacks: index % 3,
  cartaApresentacao: index === 0 ? "Olá! Trabalho há 4 anos com React e TypeScript e me identifiquei muito com a cultura de produto da Horizonte. Tenho experiência com design systems e acessibilidade." : undefined,
  createdAt: ago(days, index),
}))

const detalhe: CandidaturaDetalhe = {
  candidatura: candidaturas[0],
  historico: [
    { id: "h1", etapaNova: "INSCRICAO", statusNovo: "EM_ANDAMENTO", createdAt: ago(2), autorNome: "Sistema" },
    { id: "h2", etapaAnterior: "INSCRICAO", etapaNova: "TRIAGEM", statusNovo: "EM_ANDAMENTO", createdAt: ago(1, 5), autorNome: "Carla RH" },
    { id: "h3", etapaAnterior: "TRIAGEM", etapaNova: "ENTREVISTA_RH", statusNovo: "EM_ANDAMENTO", observacao: "Perfil muito alinhado.", createdAt: ago(0, 3), autorNome: "Carla RH" },
  ],
  feedbacks: [{ id: "f1", etapa: "TRIAGEM", titulo: "Ótimo portfólio", mensagem: "Projetos bem documentados e experiência relevante com design systems.", nota: 4, autorNome: "Carla RH", createdAt: ago(1) }],
  agendamentos: [],
}

const candidateProfile: CandidateProfile = {
  id: "cp1", userId: "user-1", userName: "Marina Costa", userEmail: "marina@email.com", headline: "Desenvolvedora frontend · React", summary: "Desenvolvedora frontend com 4 anos de experiência construindo produtos digitais acessíveis. Gosto de trabalhar perto de design e produto.", city: "São Paulo", state: "SP", phone: "(11) 99999-0000", institution: "USP", course: "Ciência da Computação", linkedinUrl: "https://linkedin.com", githubUrl: "https://github.com", portfolioUrl: "https://example.com",
  skills: ["React", "TypeScript", "Next.js", "Tailwind CSS", "Acessibilidade", "Testes"],
  experiences: [
    { id: "e1", companyName: "Nuvem Labs", role: "Desenvolvedora frontend", description: "Liderou a migração do design system para React e TypeScript.", startDate: "2023-02-01", isCurrent: true },
    { id: "e2", companyName: "Agência Pixel", role: "Desenvolvedora júnior", description: "Sites institucionais e landing pages.", startDate: "2021-01-01", endDate: "2023-01-01", isCurrent: false },
  ],
  projects: [{ id: "p1", title: "Painel de acessibilidade", description: "Ferramenta open source para auditar contraste.", toolsAndSkills: ["React", "Vite"], projectUrl: "https://github.com" }],
}

const chats: Chat[] = candidaturas.slice(0, 4).map((item, index) => ({
  candidaturaId: item.id,
  vagaId: item.vagaId,
  vagaTitulo: item.vagaTitulo,
  candidatoNome: item.candidatoNome,
  iniciado: true,
  ultimaMensagem: ["Perfeito, até amanhã!", "Obrigado pelo retorno.", "Combinado, envio hoje.", "Bom dia! Tudo bem?"][index],
  ultimaMensagemEm: ago(index, 2),
  naoLidas: index === 1 ? 2 : 0,
}))

const mensagens: ChatMensagem[] = [
  { remetente: "Horizonte Tecnologia", mensagem: "Olá Marina! Gostamos muito do seu perfil. Podemos agendar uma conversa com o RH?", enviadoPorSiMesmo: true, enviadoEm: ago(1, 4), lida: true },
  { remetente: "Marina Costa", mensagem: "Olá! Claro, fico muito feliz. Tenho disponibilidade amanhã à tarde.", enviadoPorSiMesmo: false, enviadoEm: ago(1, 3), lida: true },
  { remetente: "Marina Costa", mensagem: "Pode ser às 15h?", enviadoPorSiMesmo: false, enviadoEm: ago(1, 3), lida: true },
  { remetente: "Horizonte Tecnologia", mensagem: "Pode sim! Vou enviar o convite pela plataforma.", enviadoPorSiMesmo: true, enviadoEm: ago(0, 2), lida: true },
  { remetente: "Marina Costa", mensagem: "Perfeito, até amanhã!", enviadoPorSiMesmo: false, enviadoEm: ago(0, 1), lida: true },
]

function previewClient() {
  const client = new QueryClient({ defaultOptions: { queries: { staleTime: Infinity, retry: false, refetchOnWindowFocus: false, refetchOnMount: false } } })
  client.setQueryData(queryKeys.companyProfile.me(), company)
  client.setQueryData(queryKeys.vagas.byEmpresa(company.id), jobs)
  client.setQueryData(queryKeys.vagas.detail("preview-1"), jobs[0])
  client.setQueryData(queryKeys.candidaturas.empresaLista(), candidaturas)
  client.setQueryData(queryKeys.candidaturas.empresaDetalhe(candidaturas[0].id), detalhe)
  client.setQueryData(queryKeys.candidateProfile.byUser("user-1"), candidateProfile)
  client.setQueryData([...queryKeys.chat.lista(), "empresa"], chats)
  for (const chat of chats) {
    client.setQueryData([...queryKeys.chat.detalhe(chat.candidaturaId), "empresa"], chat)
    client.setQueryData(queryKeys.chat.mensagens(chat.candidaturaId), chat.candidaturaId === candidaturas[0].id ? mensagens : [])
  }
  return client
}

const VIEWS: Array<[string, string]> = [
  ["dashboard", "/empresa/dashboard"],
  ["vagas", "/empresa/vagas"],
  ["nova vaga", "/empresa/vagas/nova"],
  ["editar", "/empresa/vagas/preview-1/editar"],
  ["candidatos", "/empresa/candidatos"],
  ["candidato", "/empresa/candidatos/candidate-preview-1"],
  ["processos", "/empresa/processos"],
  ["kanban", "/empresa/processos?vaga=preview-1"],
  ["mensagens", "/empresa/mensagens?chat=candidate-preview-1"],
  ["perfil", "/empresa/perfil"],
]

function Screen({ path }: { path: string }) {
  const url = new URL(path, "http://preview")
  const parts = url.pathname.split("/").filter(Boolean)
  const section = parts[1]
  if (section === "dashboard") return <CompanyDashboardScreen />
  if (section === "vagas" && parts[2] === "nova") return <NovaVagaForm />
  if (section === "vagas" && parts[3] === "editar") return <EditVagaForm vaga={jobs.find((job) => job.id === parts[2]) ?? jobs[0]} />
  if (section === "vagas") return <CompanyJobsScreen />
  if (section === "candidatos" && parts[2]) return <CompanyCandidateDetailScreen candidaturaId={parts[2]} />
  if (section === "candidatos") return <CompanyCandidatesScreen />
  if (section === "processos") return <CompanyProcessesScreen vagaId={url.searchParams.get("vaga") ?? undefined} />
  if (section === "mensagens") return <MessagesScreen perspectiva="empresa" activeId={url.searchParams.get("chat")} />
  return <CompanyProfileScreen />
}

export function CompanyPreview() {
  const [client] = useState(previewClient)
  const [path, setPath] = useState("/empresa/dashboard")
  return (
    <QueryClientProvider client={client}>
      <div
        onSubmitCapture={(event) => {
          event.preventDefault()
          event.stopPropagation()
        }}
        onClickCapture={(event) => {
          const target = event.target as HTMLElement
          const href = target.closest("a")?.getAttribute("href")
          if (href?.startsWith("/empresa")) {
            event.preventDefault()
            event.stopPropagation()
            setPath(href)
          }
          const button = target.closest("button")
          if (button && /Sair da conta/.test(button.textContent || "")) {
            event.preventDefault()
            event.stopPropagation()
          }
        }}
      >
        <CompanyAppShell currentPath={new URL(path, "http://preview").pathname}>
          <Screen key={path} path={path} />
        </CompanyAppShell>
      </div>
      <div className="fixed bottom-20 right-3 z-[60] flex max-w-[calc(100vw-1.5rem)] flex-wrap items-center gap-1 rounded-lg border border-border bg-card p-2 text-xs shadow-sm lg:bottom-3" aria-label="Navegação da prévia">
        {VIEWS.map(([label, href]) => (
          <button type="button" key={label} onClick={() => setPath(href)} aria-pressed={path === href} className={"rounded-md px-2 py-1.5 " + (path === href ? "bg-primary-subtle text-primary" : "text-muted-foreground")}>
            {label}
          </button>
        ))}
      </div>
    </QueryClientProvider>
  )
}
