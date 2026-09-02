"use client"

import Link from "next/link"
import { BriefcaseBusiness, Building2, LayoutDashboard, Plus, Search, UserRound, UsersRound } from "lucide-react"
import { SelectaLogo } from "@/components/ui/selecta-logo"
import { Badge } from "@/components/ui/badge"
import { AppNav, AppTabBar, type NavItem } from "@/components/layout/app-nav"
import { UserMenu } from "@/components/layout/user-menu"
import { useLogout } from "@/lib/hooks/useLogout"
import { useCompanyProfile } from "@/lib/hooks/useCompanyProfile"

const NAV_ITEMS: NavItem[] = [
  { href: "/empresa/dashboard", label: "Visão geral", icon: LayoutDashboard },
  { href: "/empresa/vagas", label: "Vagas", icon: BriefcaseBusiness },
  { href: "/empresa/candidatos", label: "Candidatos", icon: Search },
  { href: "/empresa/processos", label: "Processos", icon: UsersRound },
]

export function CompanyAppShell({ children }: { children: React.ReactNode }) {
  const { profile } = useCompanyProfile()
  const logout = useLogout("/auth/empresa")

  return (
    <div className="flex min-h-screen flex-col bg-surface text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-[1280px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 shrink-0 items-center gap-3">
            <Link href="/empresa/dashboard" aria-label="Selecta — ir para a visão geral" className="shrink-0">
              <SelectaLogo />
            </Link>
            <span className="hidden h-6 w-px bg-border lg:block" aria-hidden />
            <Badge variant="success" size="sm" className="hidden uppercase tracking-wide lg:inline-flex">
              Empresas
            </Badge>
          </div>

          <AppNav items={NAV_ITEMS} className="hidden h-full min-w-0 flex-1 justify-center lg:flex" />

          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/empresa/vagas/nova"
              title="Nova vaga"
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground shadow-[0_6px_16px_-4px_rgb(124_58_237/0.45)] transition-all duration-200 hover:bg-primary-hover hover:shadow-[0_8px_20px_-4px_rgb(124_58_237/0.5)] sm:px-3.5"
            >
              <Plus className="size-4" />
              <span className="hidden sm:inline">Nova vaga</span>
            </Link>

            <UserMenu
              name={profile?.companyName || "Minha empresa"}
              secondary="Conta empresarial"
              avatar={
                <span className="grid size-8 place-items-center rounded-full bg-success-subtle text-success-foreground">
                  <Building2 className="size-4" />
                </span>
              }
              links={[{ href: "/empresa/perfil", label: "Perfil da empresa", icon: UserRound }]}
              onLogout={logout}
            />
          </div>
        </div>
      </header>

      <div className="flex-1 pb-20 lg:pb-0">{children}</div>

      <AppTabBar items={NAV_ITEMS} />
    </div>
  )
}
