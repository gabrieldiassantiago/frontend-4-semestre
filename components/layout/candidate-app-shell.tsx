"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Bell, BriefcaseBusiness, Home, UserRound } from "lucide-react"
import { SelectaLogo } from "@/components/ui/selecta-logo"
import { AppNav, AppTabBar, type NavItem } from "@/components/layout/app-nav"
import { UserMenu } from "@/components/layout/user-menu"
import { useLogout } from "@/lib/hooks/useLogout"
import { getInitials } from "@/lib/format"
import { getCandidateProfileMe } from "@/lib/services/candidate.service"
import type { CandidateProfile } from "@/lib/types/candidate.types"

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Vagas", icon: Home },
  { href: "/candidaturas", label: "Candidaturas", icon: BriefcaseBusiness },
  { href: "/profile/candidato", label: "Perfil", icon: UserRound },
]

export function CandidateAppShell({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<CandidateProfile | null>(null)
  const logout = useLogout("/auth")

  useEffect(() => {
    void getCandidateProfileMe().then(setProfile).catch(() => setProfile(null))
  }, [])

  return (
    <div className="flex min-h-screen flex-col bg-surface text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-[1280px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/dashboard" aria-label="Selecta — ir para o início" className="shrink-0">
            <SelectaLogo />
          </Link>

          <AppNav items={NAV_ITEMS} className="hidden h-full lg:flex" />

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              className="relative grid size-10 place-items-center rounded-full text-strong-foreground transition-colors hover:bg-muted"
              aria-label="Notificações"
            >
              <Bell className="size-[18px]" />
              <span
                className="absolute right-2.5 top-2.5 size-1.5 rounded-full bg-success ring-2 ring-card"
                aria-hidden
              />
            </button>

            <UserMenu
              name={profile?.userName || "Minha conta"}
              secondary={profile?.userEmail || undefined}
              avatar={
                <span className="grid size-8 place-items-center rounded-full bg-primary-subtle text-xs font-bold text-primary-subtle-foreground">
                  {getInitials(profile?.userName)}
                </span>
              }
              links={[{ href: "/profile/candidato", label: "Meu perfil", icon: UserRound }]}
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
