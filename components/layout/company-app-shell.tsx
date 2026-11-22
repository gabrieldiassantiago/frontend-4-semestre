"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ArrowRight, Building2, Inbox, Plus, UserCog } from "lucide-react"
import { AppShell, DrawerLogoutButton } from "@/components/layout/shell/app-shell"
import { UserMenu } from "@/components/layout/shell/user-menu"
import { CompanyLogo } from "@/components/shared/company-logo"
import { ChatDrawerButton } from "@/components/shared/chat/chat-drawer"
import { COMPANY_NAVIGATION } from "@/lib/config/navigation"
import { ROUTES } from "@/lib/config/routes"
import { useLogout } from "@/lib/queries/use-auth"
import { useAgendamentosEmpresa, useCandidaturasEmpresa } from "@/lib/queries/use-candidaturas"
import { useChats } from "@/lib/queries/use-chat"
import { useCompanyIdentity } from "@/lib/queries/use-company-profile"
import { cn } from "@/lib/utils"

const ACCOUNT_LINKS = [
  { href: ROUTES.company.profile, label: "Perfil da empresa", icon: Building2 },
  { href: ROUTES.company.team, label: "Equipe", icon: UserCog },
]

const TODAY_FORMAT = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "numeric", month: "long" })

export function CompanyAppShell({ children, currentPath }: { children: React.ReactNode; currentPath?: string }) {
  const actualPathname = usePathname()
  const pathname = currentPath ?? actualPathname
  // Criar/editar vaga é uma tarefa em foco: sem barra inferior nem atalho repetido de "Nova vaga".
  const jobFormRoute = pathname === ROUTES.company.newJob || /^\/empresa\/vagas\/[^/]+\/editar$/.test(pathname)
  const company = useCompanyIdentity()
  const { candidaturas } = useCandidaturasEmpresa()
  const { agendamentos } = useAgendamentosEmpresa()
  const { naoLidas } = useChats("empresa")
  const logout = useLogout(ROUTES.auth.recruiter)
  const name = company.companyName || "Minha empresa"
  const profile = { logoUrl: company.logoUrl, industry: company.industry }

  const awaitingReview = candidaturas.filter(
    (item) => item.status === "EM_ANDAMENTO" && (item.etapaAtual === "INSCRICAO" || item.etapaAtual === "TRIAGEM"),
  ).length

  // Reuniões de hoje ainda por acontecer (pendentes ou confirmadas) viram o contador do menu.
  const today = new Date().toDateString()
  const meetingsToday = agendamentos.filter(
    (item) =>
      (item.status === "PENDENTE" || item.status === "CONFIRMADO") &&
      new Date(item.inicio).toDateString() === today &&
      new Date(item.inicio).getTime() > Date.now(),
  ).length

  return (
    <AppShell
      navigation={COMPANY_NAVIGATION}
      navVariant="modern"
      focusMode={jobFormRoute}
      pathname={currentPath}
      areaLabel="Área da empresa"
      className="company-workspace"
      badges={{
        [ROUTES.company.candidates]: awaitingReview,
        [ROUTES.company.appointments]: meetingsToday,
        [ROUTES.company.messages]: naoLidas,
      }}
      topbarSubtitle={<span suppressHydrationWarning className="inline-block first-letter:uppercase">{TODAY_FORMAT.format(new Date())}</span>}
      sidebarTop={({ collapsed, close }) => (
        <div className={cn("flex flex-col gap-2", collapsed ? "mt-2 items-center" : "mx-3 mt-2")}>
          <Link
            href={ROUTES.company.profile}
            onClick={close}
            title={collapsed ? name : undefined}
            className={cn(
              "flex items-center gap-3 rounded-[20px] transition-colors hover:bg-primary-subtle",
              collapsed ? "p-1" : "bg-surface p-2.5",
            )}
          >
            <CompanyLogo url={profile?.logoUrl} name={name} size="sm" />
            {!collapsed && (
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-foreground">{name}</span>
                <span className="block truncate text-xs text-muted-foreground">{profile?.industry || "Área da empresa"}</span>
              </span>
            )}
          </Link>
          <Link
            href={ROUTES.company.newJob}
            onClick={close}
            title={collapsed ? "Nova vaga" : undefined}
            className={cn(
              "inline-flex items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover",
              collapsed ? "size-11" : "min-h-11 px-3",
            )}
          >
            <Plus aria-hidden className="size-4" />
            {collapsed ? <span className="sr-only">Nova vaga</span> : "Nova vaga"}
          </Link>
        </div>
      )}
      sidebarBottom={({ collapsed, close }) =>
        !collapsed && awaitingReview > 0 ? (
          <Link
            href={ROUTES.company.processes}
            onClick={close}
            className="group mb-2 flex items-start gap-3 rounded-[20px] bg-primary-subtle p-3 transition-colors"
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-card text-primary">
              <Inbox aria-hidden className="size-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-foreground">
                {awaitingReview} {awaitingReview === 1 ? "candidatura" : "candidaturas"}
              </span>
              <span className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground group-hover:text-primary-subtle-foreground">
                aguardando triagem
                <ArrowRight aria-hidden className="size-3 transition-transform group-hover:translate-x-0.5" />
              </span>
            </span>
          </Link>
        ) : null
      }
      topbarActions={
        <>
          {!jobFormRoute && (
            <Link href={ROUTES.company.newJob} className="btn-primary min-h-10 px-3 sm:px-4 lg:hidden" aria-label="Nova vaga">
              <Plus aria-hidden className="size-4" />
              <span className="hidden sm:inline">Nova vaga</span>
            </Link>
          )}
          <ChatDrawerButton perspectiva="empresa" />
          <UserMenu
            name={name}
            secondary={profile?.industry || "Recrutamento"}
            avatar={<CompanyLogo url={profile?.logoUrl} name={name} size="sm" />}
            links={ACCOUNT_LINKS}
            onLogout={logout}
          />
        </>
      }
      drawerFooter={<DrawerLogoutButton onLogout={logout} />}
    >
      {children}
    </AppShell>
  )
}
