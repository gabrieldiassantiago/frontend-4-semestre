"use client"

import { useState } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { CandidateOverviewScreen } from "@/components/candidate/dashboard/candidate-overview-screen"
import { CandidateAppShell } from "@/components/layout/candidate-app-shell"
import { ROUTES } from "@/lib/config/routes"
import { queryKeys } from "@/lib/queries/keys"
import type { CandidateProfile } from "@/lib/types/candidate.types"
import type { Candidatura } from "@/lib/types/candidatura.types"
import type { Vaga } from "@/lib/types/vaga.types"

const profile: CandidateProfile = {
  id: "preview",
  userId: "preview",
  userName: "Carla Mendes",
  userEmail: "carla.mendes@email.com",
  headline: "Estudante de engenharia de software",
  summary: "Busco minha primeira oportunidade em desenvolvimento.",
  phone: "11999990000",
  city: "Campinas",
  state: "SP",
}

const jobs: Vaga[] = [
  { id: "v1", titulo: "Estágio em desenvolvimento frontend", salario: 2200, descricao: "", companyProfileId: "c1", nomeEmpresa: "Horizonte Tecnologia", cidade: "São Paulo", estado: "SP", categoria: "DESENVOLVIMENTO_SOFTWARE", modalidade: "HIBRIDO", nivelExperiencia: "ESTAGIO", ativa: true, createdAt: "2026-10-01T12:00:00" },
  { id: "v2", titulo: "Analista de dados júnior", salario: 4200, descricao: "", companyProfileId: "c2", nomeEmpresa: "Banco Aurora", cidade: "Campinas", estado: "SP", categoria: "DESENVOLVIMENTO_SOFTWARE", modalidade: "REMOTO", nivelExperiencia: "JUNIOR", ativa: true, createdAt: "2026-09-29T12:00:00" },
  { id: "v3", titulo: "Designer de produto", salario: 5000, descricao: "", companyProfileId: "c3", nomeEmpresa: "Estúdio Norte", cidade: "Curitiba", estado: "PR", categoria: "DESIGN_UX_UI", modalidade: "PRESENCIAL", nivelExperiencia: "PLENO", ativa: true, createdAt: "2026-09-25T12:00:00" },
]

const applications: Candidatura[] = [
  { id: "a1", vagaId: "v1", vagaTitulo: "Estágio em desenvolvimento frontend", nomeEmpresa: "Horizonte Tecnologia", etapaAtual: "ENTREVISTA_RH", etapaAtualDescricao: "Entrevista com RH", status: "EM_ANDAMENTO", createdAt: "2026-09-30T12:00:00" },
  { id: "a2", vagaId: "v3", vagaTitulo: "Designer de produto", nomeEmpresa: "Estúdio Norte", etapaAtual: "CONTRATACAO", status: "APROVADA", createdAt: "2026-09-12T12:00:00" },
]

function previewClient() {
  const client = new QueryClient({
    defaultOptions: { queries: { staleTime: Infinity, retry: false, refetchOnWindowFocus: false, refetchOnMount: false } },
  })
  client.setQueryData(queryKeys.candidateProfile.me(), profile)
  client.setQueryData(["current-user"], { id: "preview", name: profile.userName, email: profile.userEmail, role: "CANDIDATE", active: true })
  client.setQueryData(queryKeys.candidaturas.minhas(), applications)
  client.setQueryData(queryKeys.vagas.list({}), { vagas: jobs, totalPages: 1, totalElements: jobs.length })
  return client
}

export function CandidatePreview() {
  const [client] = useState(previewClient)
  return (
    <QueryClientProvider client={client}>
      <div
        onClickCapture={(event) => {
          const anchor = (event.target as HTMLElement).closest("a")
          if (anchor?.getAttribute("href")?.startsWith("/")) event.preventDefault()
          const button = (event.target as HTMLElement).closest("button")
          if (button && /Sair da conta/.test(button.textContent || "")) {
            event.preventDefault()
            event.stopPropagation()
          }
        }}
      >
        <CandidateAppShell currentPath={ROUTES.candidate.overview}>
          <CandidateOverviewScreen />
        </CandidateAppShell>
      </div>
    </QueryClientProvider>
  )
}
