/**
 * Fonte única de verdade para as rotas da aplicação.
 * Telas, navegação e o proxy de autenticação importam daqui, então mudar
 * uma URL é uma alteração em um só lugar.
 */
export const ROUTES = {
  home: "/",
  accessDenied: "/acesso-negado",
  onboarding: "/onboarding",
  publicJob: (id: string) => `/vaga/${encodeURIComponent(id)}`,

  auth: {
    root: "/auth",
    candidate: "/auth/candidato",
    company: "/auth/empresa",
    recruiter: "/auth/recrutador",
    verifyEmail: "/auth/verify-email",
  },

  candidate: {
    overview: "/visao-geral",
    jobs: "/vagas",
    job: (id: string) => `/vagas?vaga=${encodeURIComponent(id)}`,
    jobSearch: (query: string) => `/vagas?q=${encodeURIComponent(query)}`,
    applications: "/candidaturas",
    application: (id: string) => `/candidaturas/${encodeURIComponent(id)}`,
    messages: "/mensagens",
    chat: (candidaturaId: string) => `/mensagens?chat=${encodeURIComponent(candidaturaId)}`,
    notifications: "/notificacoes",
    settings: "/configuracoes",
    profile: "/profile/candidato",
    completeProfile: "/profile/candidato/completar",
  },

  company: {
    root: "/empresa",
    dashboard: "/empresa/dashboard",
    jobs: "/empresa/vagas",
    newJob: "/empresa/vagas/nova",
    editJob: (id: string) => `/empresa/vagas/${encodeURIComponent(id)}/editar`,
    candidates: "/empresa/candidatos",
    candidate: (id: string) => `/empresa/candidatos/${encodeURIComponent(id)}`,
    processes: "/empresa/processos",
    appointments: "/empresa/agendamentos",
    messages: "/empresa/mensagens",
    chat: (candidaturaId: string) => `/empresa/mensagens?chat=${encodeURIComponent(candidaturaId)}`,
    profile: "/empresa/perfil",
    team: "/empresa/equipe",
  },
} as const

/** Prefixos de rota protegidos por papel — consumidos pelo `proxy.ts`. */
export const ROUTE_ACCESS = {
  CANDIDATE: [
    ROUTES.candidate.overview,
    ROUTES.candidate.jobs,
    "/dashboard",
    ROUTES.candidate.applications,
    ROUTES.candidate.messages,
    ROUTES.candidate.notifications,
    ROUTES.candidate.settings,
    "/profile",
  ],
  COMPANY: [ROUTES.company.root],
} as const

export const AUTH_ENTRY_ROUTES = {
  any: [ROUTES.auth.root],
  CANDIDATE: [ROUTES.auth.candidate],
  COMPANY: [ROUTES.auth.company, ROUTES.auth.recruiter],
} as const

export const HOME_BY_ROLE = {
  CANDIDATE: ROUTES.candidate.overview,
  COMPANY: ROUTES.company.dashboard,
} as const

/**
 * Query param que liga a tela de boas-vindas no cadastro de perfil do candidato.
 * Só é enviado para contas recém-criadas (cadastro por e-mail ou primeiro login social).
 */
export const WELCOME_PARAM = "boasVindas"

/** `true` quando `pathname` é a rota ou uma sub-rota dela. */
export function matchesRoute(pathname: string, route: string) {
  return pathname === route || pathname.startsWith(`${route}/`)
}
