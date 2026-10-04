"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell, Settings, UserRound } from "lucide-react"
import { AppShell, DrawerLogoutButton } from "@/components/layout/shell/app-shell"
import { UserMenu } from "@/components/layout/shell/user-menu"
import { EntityAvatar } from "@/components/ui/entity-avatar"
import { GlobalJobSearch } from "@/components/candidate/jobs/global-job-search"
import { ProfileCompletionCard } from "@/components/candidate/profile/profile-completion-card"
import { CANDIDATE_NAVIGATION } from "@/lib/config/navigation"
import { ROUTES } from "@/lib/config/routes"
import { getProfileCompletion } from "@/lib/candidate-completion"
import { useCurrentUser, useLogout } from "@/lib/queries/use-auth"
import { useCandidateProfile } from "@/lib/queries/use-candidate-profile"

const ACCOUNT_LINKS = [
  { href: ROUTES.candidate.profile, label: "Meu perfil", icon: UserRound },
  { href: ROUTES.candidate.settings, label: "Configurações", icon: Settings },
]

/** Rotas do grupo (candidato) que renderizam sem a estrutura do app. */
const FULLSCREEN_ROUTES: string[] = [ROUTES.candidate.completeProfile]

export function CandidateAppShell({ children, currentPath }: { children: React.ReactNode; currentPath?: string }) {
  const actualPathname = usePathname()
  const pathname = currentPath ?? actualPathname
  const { profile } = useCandidateProfile()
  const { user } = useCurrentUser()
  const logout = useLogout(ROUTES.auth.root)

  if (FULLSCREEN_ROUTES.includes(pathname)) return <>{children}</>

  const name = user?.name?.trim() || profile?.userName?.trim() || "Candidato"
  const email = user?.email?.trim() || profile?.userEmail?.trim() || undefined
  const completion = profile ? getProfileCompletion(profile).value : null

  return (
    <AppShell
      navigation={CANDIDATE_NAVIGATION}
      pathname={currentPath}
      areaLabel="Área do candidato"
      sidebarBottom={({ collapsed, close }) =>
        completion !== null && <ProfileCompletionCard value={completion} collapsed={collapsed} onNavigate={close} />
      }
      topbarCenter={<GlobalJobSearch />}
      topbarActions={
        <>
          <Link
            href={ROUTES.candidate.notifications}
            aria-label="Notificações"
            className="grid size-10 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Bell aria-hidden className="size-5" strokeWidth={1.75} />
          </Link>
          <UserMenu
            name={name}
            secondary={email}
            avatar={<EntityAvatar name={name} size="sm" className="rounded-full" />}
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
