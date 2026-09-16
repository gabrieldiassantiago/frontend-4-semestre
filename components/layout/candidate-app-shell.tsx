"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import {
  Bell,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  FileText,
  LayoutGrid,
  LogOut,
  Menu,
  MessageSquare,
  Settings,
  ShoppingBag,
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
  { href: "/visao-geral", label: "Visão geral", icon: LayoutGrid },
  { href: "/vagas", label: "Vagas", icon: Briefcase },
  { href: "/candidaturas", label: "Candidaturas", icon: FileText },
  { href: "/mensagens", label: "Mensagens", icon: MessageSquare, dotBadge: true },
  { href: "/profile/candidato", label: "Meu perfil", icon: UserRound },
  { href: "/notificacoes", label: "Notificações", icon: Bell },
]

const MOBILE_TAB_ITEMS: NavItem[] = [
  { href: "/vagas", label: "Vagas", icon: Briefcase },
  { href: "/candidaturas", label: "Candidaturas", icon: FileText },
  { href: "/mensagens", label: "Mensagens", icon: MessageSquare, dotBadge: true },
  { href: "/profile/candidato", label: "Meu perfil", icon: UserRound },
]

export function CandidateAppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { profile } = useCandidateProfile()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)
  const [greeting, setGreeting] = useState("Boa noite")
  const logout = useLogout("/auth")

  const displayName = profile?.userName?.trim() || "Gab"
  const initials = getInitials(displayName) || "G"

  useEffect(() => {
    const hour = new Date().getHours()
    setGreeting(hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite")
  }, [])

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

  if (pathname === "/profile/candidato/completar") return <>{children}</>

  return (
    <div className="min-h-screen bg-[#fafafc] text-foreground">
      {/* SIDEBAR ESQUERDA (DESKTOP) */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-slate-200/70 bg-card transition-[width] duration-200 lg:flex",
          collapsed ? "w-[76px]" : "w-64"
        )}
      >
        <div
          className={cn(
            "flex h-20 items-center px-5",
            collapsed ? "justify-center" : "justify-between"
          )}
        >
          <Link
            href="/vagas"
            aria-label="Selecta - ir para o início"
            className={cn("flex flex-col overflow-hidden", collapsed && "items-center justify-center")}
          >
            <SelectaLogo solo={collapsed} />

          </Link>
          {!collapsed && (
            <button
              type="button"
              onClick={() => setCollapsed((prev) => !prev)}
              aria-label="Recolher menu lateral"
              title="Recolher menu"
              className="grid size-8 shrink-0 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
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
            className="mx-auto mt-2 grid size-8 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <ChevronRight className="size-4" />
          </button>
        )}

        <div className="flex-1 overflow-y-auto px-3.5 py-4">
          <SidebarNav items={NAV_ITEMS} collapsed={collapsed} />
        </div>

        {/* Rodapé da Sidebar: Card 'Complete seu perfil' + Configurações */}
        <div className="p-3.5 space-y-2">
          {!collapsed && (
            <Link
              href="/profile/candidato"
              className="group relative block rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-xs transition-all hover:border-[#7c3aed]/40 hover:shadow-sm"
            >
              <div className="flex items-start gap-2.5">
                <div className="grid size-7 shrink-0 place-items-center rounded-lg bg-[#ede9fe] text-[#7c3aed]">
                  <ShoppingBag className="size-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-xs font-bold text-slate-900">Complete seu perfil</p>
                  </div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="h-1.5 flex-1 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full w-[70%] rounded-full bg-[#7c3aed]" />
                    </div>
                    <span className="text-[10px] font-bold text-[#7c3aed]">70%</span>
                  </div>
                  <p className="mt-1.5 text-[10px] leading-tight text-slate-500">
                    Aumente suas chances de ser encontrado.
                  </p>
                </div>
              </div>
            </Link>
          )}

          {/* Link de Configurações */}
          <Link
            href="/configuracoes"
            className={cn(
              "flex items-center rounded-2xl text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100/70 hover:text-slate-900",
              collapsed ? "size-11 justify-center mx-auto" : "gap-3 px-3.5 py-2.5",
              pathname === "/configuracoes" && "bg-[#f3f0ff] font-semibold text-[#7c3aed]"
            )}
            title="Configurações"
          >
            <Settings className="size-[18px] shrink-0 text-slate-500" />
            {!collapsed && <span>Configurações</span>}
          </Link>
        </div>
      </aside>

      {/* CONTAINER PRINCIPAL */}
      <div
        className={cn(
          "flex min-h-screen flex-col transition-[padding] duration-200",
          collapsed ? "lg:pl-[76px]" : "lg:pl-64"
        )}
      >
        <header className="sticky top-0 z-30 flex h-16 sm:h-20 items-center justify-between border-b border-slate-200/60 bg-[#fafafc]/95 px-4 backdrop-blur-md sm:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              className="grid size-10 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-100 active:scale-95 lg:hidden"
              aria-label="Abrir menu"
              aria-expanded={mobileDrawerOpen}
            >
              <Menu className="size-5" />
            </button>
            <Link href="/vagas" className="shrink-0 lg:hidden">
              <SelectaLogo />
            </Link>
            <div className="hidden min-w-0 flex-col leading-tight lg:flex">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                {greeting}, {displayName.split(" ")[0]}!
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Encontre oportunidades que combinam com o seu perfil.
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <Link
              href="/notificacoes"
              className="relative hidden sm:grid size-10 place-items-center rounded-full text-slate-500 transition-colors hover:bg-slate-200/60 hover:text-slate-800"
              aria-label="Notificações"
            >
              <Bell className="size-[20px]" />
              <span
                className="absolute right-2.5 top-2.5 size-2 rounded-full bg-red-500 ring-2 ring-white"
                aria-hidden
              />
            </Link>

            {/* Desktop User Menu (com nome, email e abrindo para baixo) */}
            <div className="hidden lg:block">
              <UserMenu
                name={displayName}
                secondary={profile?.userEmail || undefined}
                side="bottom"
                align="right"
                avatar={
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#ede9fe] text-xs font-bold text-[#7c3aed] shadow-xs">
                    {initials}
                  </span>
                }
                links={[{ href: "/profile/candidato", label: "Meu perfil", icon: UserRound }]}
                onLogout={logout}
              />
            </div>

            {/* Mobile User Menu: apenas o círculo da foto de perfil */}
            <div className="lg:hidden">
              <UserMenu
                name={displayName}
                secondary={profile?.userEmail || undefined}
                avatarOnly
                side="bottom"
                align="right"
                avatar={
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#ede9fe] text-sm font-bold text-[#7c3aed] shadow-xs">
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

      <AppTabBar items={MOBILE_TAB_ITEMS} />
    </div>
  )
}