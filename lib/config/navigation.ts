import {
  Bell,
  Briefcase,
  BriefcaseBusiness,
  Building2,
  FileText,
  LayoutDashboard,
  LayoutGrid,
  MessageSquare,
  Settings,
  UserRound,
  UsersRound,
  Workflow,
  type LucideIcon,
} from "lucide-react"
import { ROUTES, matchesRoute } from "@/lib/config/routes"

export type NavItem = {
  href: string
  label: string
  /** Rótulo curto usado na barra inferior do mobile. */
  shortLabel?: string
  icon: LucideIcon
  /** Rotas extras que também deixam o item ativo (ex.: aliases). */
  aliases?: readonly string[]
  /** Quando `true`, só fica ativo na rota exata — sem sub-rotas. */
  exact?: boolean
}

export type NavGroup = {
  label?: string
  items: NavItem[]
}

export type AreaNavigation = {
  /** Destino do logo. */
  home: string
  groups: NavGroup[]
  /** Itens fixados na barra inferior do mobile (máx. 5). */
  tabs: NavItem[]
  /** Itens fixados no rodapé da sidebar. */
  footer?: NavItem[]
}

const candidateItems = {
  overview: { href: ROUTES.candidate.overview, label: "Visão geral", shortLabel: "Início", icon: LayoutGrid },
  jobs: { href: ROUTES.candidate.jobs, label: "Vagas", icon: Briefcase, aliases: ["/dashboard"] },
  applications: { href: ROUTES.candidate.applications, label: "Candidaturas", shortLabel: "Inscrições", icon: FileText },
  messages: { href: ROUTES.candidate.messages, label: "Mensagens", shortLabel: "Mensagens", icon: MessageSquare },
  notifications: { href: ROUTES.candidate.notifications, label: "Notificações", icon: Bell },
  // O assistente de completar perfil tem layout próprio e não deve ativar o item.
  profile: { href: ROUTES.candidate.profile, label: "Meu perfil", shortLabel: "Perfil", icon: UserRound, exact: true },
  settings: { href: ROUTES.candidate.settings, label: "Configurações", icon: Settings },
} satisfies Record<string, NavItem>

export const CANDIDATE_NAVIGATION: AreaNavigation = {
  home: ROUTES.candidate.overview,
  groups: [
    {
      items: [
        candidateItems.overview,
        candidateItems.jobs,
        candidateItems.applications,
        candidateItems.messages,
        candidateItems.notifications,
      ],
    },
    { label: "Conta", items: [candidateItems.profile] },
  ],
  tabs: [
    candidateItems.overview,
    candidateItems.jobs,
    candidateItems.applications,
    candidateItems.messages,
    candidateItems.profile,
  ],
  footer: [candidateItems.settings],
}

const companyItems = {
  dashboard: { href: ROUTES.company.dashboard, label: "Visão geral", shortLabel: "Início", icon: LayoutDashboard },
  jobs: { href: ROUTES.company.jobs, label: "Vagas", icon: BriefcaseBusiness },
  candidates: { href: ROUTES.company.candidates, label: "Candidatos", icon: UsersRound },
  processes: { href: ROUTES.company.processes, label: "Processos seletivos", shortLabel: "Processos", icon: Workflow },
  profile: { href: ROUTES.company.profile, label: "Perfil da empresa", shortLabel: "Empresa", icon: Building2 },
} satisfies Record<string, NavItem>

export const COMPANY_NAVIGATION: AreaNavigation = {
  home: ROUTES.company.dashboard,
  groups: [
    {
      label: "Recrutamento",
      items: [companyItems.dashboard, companyItems.jobs, companyItems.candidates, companyItems.processes],
    },
    { label: "Configurações", items: [companyItems.profile] },
  ],
  tabs: [companyItems.dashboard, companyItems.jobs, companyItems.candidates, companyItems.processes, companyItems.profile],
}

export function isNavItemActive(pathname: string, item: NavItem) {
  if (item.exact) return pathname === item.href
  return [item.href, ...(item.aliases ?? [])].some((route) => matchesRoute(pathname, route))
}

/** Item de navegação correspondente à rota atual (usado no título da topbar). */
export function findActiveNavItem(pathname: string, navigation: AreaNavigation) {
  const all = [...navigation.groups.flatMap((group) => group.items), ...(navigation.footer ?? [])]
  return all.find((item) => isNavItemActive(pathname, item)) ?? all.find((item) => matchesRoute(pathname, item.href))
}
