"use client"

import Link from "next/link"
import { Building2, Plus } from "lucide-react"
import { AppShell, DrawerLogoutButton } from "@/components/layout/shell/app-shell"
import { UserMenu } from "@/components/layout/shell/user-menu"
import { CompanyLogo } from "@/components/shared/company-logo"
import { COMPANY_NAVIGATION } from "@/lib/config/navigation"
import { ROUTES } from "@/lib/config/routes"
import { useLogout } from "@/lib/queries/use-auth"
import { useCompanyProfile } from "@/lib/queries/use-company-profile"
import { cn } from "@/lib/utils"

const ACCOUNT_LINKS = [{ href: ROUTES.company.profile, label: "Perfil da empresa", icon: Building2 }]

export function CompanyAppShell({ children, currentPath }: { children: React.ReactNode; currentPath?: string }) {
  const { profile } = useCompanyProfile()
  const logout = useLogout(ROUTES.auth.recruiter)
  const name = profile?.companyName || "Minha empresa"

  return (
    <AppShell
      navigation={COMPANY_NAVIGATION}
      pathname={currentPath}
      areaLabel="Área da empresa"
      className="company-workspace"
      sidebarTop={({ collapsed, close }) => (
        <Link
          href={ROUTES.company.profile}
          onClick={close}
          title={collapsed ? name : undefined}
          className={cn(
            "flex items-center gap-3 rounded-lg transition-colors hover:bg-muted",
            collapsed ? "mx-auto mt-2 p-1" : "mx-3 mt-2 border border-border p-2.5",
          )}
        >
          <CompanyLogo url={profile?.logoUrl} name={name} size="sm" />
          {!collapsed && (
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-foreground">{name}</span>
              <span className="block text-xs text-muted-foreground">Área da empresa</span>
            </span>
          )}
        </Link>
      )}
      topbarActions={
        <>
          <Link href={ROUTES.company.newJob} className="btn-primary min-h-10 px-3 sm:px-4" aria-label="Nova vaga">
            <Plus aria-hidden className="size-4" />
            <span className="hidden sm:inline">Nova vaga</span>
          </Link>
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
