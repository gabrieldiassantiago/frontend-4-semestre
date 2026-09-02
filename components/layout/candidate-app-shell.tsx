"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { AnimatePresence, motion } from "framer-motion"
import {
  Bell,
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  Compass,
  LogOut,
  Menu,
  UserRound,
  X,
} from "lucide-react"
import { SelectaLogo } from "@/components/ui/selecta-logo"
import { AppTabBar, SidebarNav, type NavItem } from "@/components/layout/app-nav"
import { UserMenu } from "@/components/layout/user-menu"
import { useLogout } from "@/lib/hooks/useLogout"
import { getInitials } from "@/lib/format"
import { cn } from "@/lib/utils"
import { useCandidateProfile } from "@/lib/hooks/useCandidateProfile"

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Buscar Vagas", icon: Compass },
  { href: "/candidaturas", label: "Minhas Candidaturas", icon: BriefcaseBusiness },
  { href: "/profile/candidato", label: "Meu Perfil", icon: UserRound },
]

export function CandidateAppShell({ children }: { children: React.ReactNode }) {
  const { profile } = useCandidateProfile()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)
  const logout = useLogout("/auth")

  const displayName = profile?.userName?.trim() || "Candidato"
  const initials = getInitials(displayName)

  useEffect(() => {
    if (!mobileDrawerOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileDrawerOpen(false)
    }
    document.addEventListener("keydown", handleKeyDown)
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = originalOverflow
    }
  }, [mobileDrawerOpen])

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)")
    const handleChange = (e: MediaQueryListEvent) => {
      if (e.matches) setMobileDrawerOpen(false)
    }
    mq.addEventListener("change", handleChange)
    return () => mq.removeEventListener("change", handleChange)
  }, [])

  return (
    <div className="min-h-screen bg-surface text-foreground">
      {/* SIDEBAR ESQUERDA (DESKTOP) */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-border bg-card transition-[width] duration-200 lg:flex",
          collapsed ? "w-[72px]" : "w-64"
        )}
      >
        <div
          className={cn(
            "flex h-16 items-center border-b border-border-subtle px-3.5",
            collapsed ? "justify-center" : "justify-between"
          )}
        >
          <Link
            href="/dashboard"
            aria-label="Selecta - ir para o início"
            className={cn("flex items-center gap-2 overflow-hidden", collapsed && "justify-center")}
          >
            <SelectaLogo />
            {!collapsed && (
              <span className="whitespace-nowrap rounded-full bg-primary-subtle px-2 py-0.5 text-[10px] font-bold text-primary">
                Candidato
              </span>
            )}
          </Link>
          {!collapsed && (
            <button
              type="button"
              onClick={() => setCollapsed((prev) => !prev)}
              aria-label="Recolher menu lateral"
              title="Recolher menu"
              className="grid size-8 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <ChevronLeft className="size-4" />
            </button>
          )}
        </div>

        {collapsed && (
          <button
            type="button"
            onClick={() => setCollapsed(false)}
            aria-label="Expandir menu lateral"
            title="Expandir menu"
            className="mx-auto mt-2 grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ChevronRight className="size-4" />
          </button>
        )}

        <div className="flex-1 overflow-y-auto px-2.5 py-4">
          {!collapsed && (
            <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Navegação
            </p>
          )}
          <SidebarNav items={NAV_ITEMS} collapsed={collapsed} className="mt-1" />
        </div>

        {/* Rodapé da Sidebar Refinada */}
        <div className="border-t border-border-subtle/50 p-3">
          <UserMenu
            name={displayName}
            secondary={profile?.userEmail || undefined}
            avatar={
              <span className="grid size-9 shrink-0 place-items-center rounded-2xl bg-gradient-to-tr from-primary to-purple-500 text-xs font-bold text-primary-foreground shadow-sm">
                {initials}
              </span>
            }
            links={[{ href: "/profile/candidato", label: "Meu perfil", icon: UserRound }]}
            onLogout={logout}
            collapsed={collapsed}
          />
        </div>
      </aside>

      {/* CONTAINER PRINCIPAL */}
      <div
        className={cn(
          "flex min-h-screen flex-col transition-[padding] duration-200",
          collapsed ? "lg:pl-[72px]" : "lg:pl-64"
        )}
      >
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card/90 px-4 backdrop-blur sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              className="grid size-10 shrink-0 place-items-center rounded-xl border border-border text-foreground transition-colors hover:bg-muted active:scale-95 lg:hidden"
              aria-label="Abrir menu"
              aria-expanded={mobileDrawerOpen}
            >
              <Menu className="size-5" />
            </button>
            <Link href="/dashboard" className="shrink-0 lg:hidden">
              <SelectaLogo />
            </Link>
            <div className="hidden min-w-0 flex-col leading-tight lg:flex">
              <span className="truncate text-[15px] font-bold text-foreground">
                Olá, {displayName.split(" ")[0]}!
              </span>
              <span className="truncate text-xs font-medium text-muted-foreground">Portal do Candidato</span>
            </div>
            <div className="hidden min-w-0 flex-col leading-tight md:flex lg:hidden">
              <span className="truncate text-sm font-bold text-foreground">{displayName}</span>
              <span className="truncate text-[11px] font-medium text-muted-foreground">Portal do Candidato</span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              className="relative grid size-10 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Notificações"
            >
              <Bell className="size-[18px]" />
              <span
                className="absolute right-2.5 top-2.5 size-1.5 rounded-full bg-emerald-500 ring-2 ring-card"
                aria-hidden
              />
            </button>
            <div className="lg:hidden">
              <UserMenu
                name={displayName}
                secondary={profile?.userEmail || undefined}
                avatar={
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-xs">
                    {initials}
                  </span>
                }
                links={[{ href: "/profile/candidato", label: "Meu perfil", icon: UserRound }]}
                onLogout={logout}
              />
            </div>
          </div>
        </header>

        <main className="flex-1 pb-20 lg:pb-8">{children}</main>
      </div>

      {/* DRAWER MOBILE */}
      <AnimatePresence>
        {mobileDrawerOpen && (
          <div
            className="fixed inset-0 z-50 flex lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Menu de navegação"
          >
            <motion.button
              type="button"
              aria-label="Fechar menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 cursor-default bg-foreground/40 backdrop-blur-[2px]"
              onClick={() => setMobileDrawerOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="relative flex w-72 max-w-[85vw] flex-col bg-card shadow-overlay sm:max-w-[60vw]"
            >
              <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-5">
                <SelectaLogo />
                <button
                  type="button"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="grid size-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted"
                  aria-label="Fechar menu"
                >
                  <X className="size-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4" onClick={() => setMobileDrawerOpen(false)}>
                <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Navegação
                </p>
                <SidebarNav items={NAV_ITEMS} className="mt-1" />
              </div>
              <div className="shrink-0 border-t border-border p-4">
                <button
                  type="button"
                  onClick={logout}
                  className="flex w-full items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-danger transition-colors hover:bg-danger-subtle"
                >
                  <LogOut className="size-4" />
                  Sair da conta
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AppTabBar items={NAV_ITEMS} />
    </div>
  )
}