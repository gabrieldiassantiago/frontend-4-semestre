"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import {
  ArrowRight,
  Bell,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  FileText,
  LayoutGrid,
  LogOut,
  Menu,
  MessageSquare,
  Search,
  Settings,
  ShoppingBag,
  UserRound,
  X,
} from "lucide-react"
import { SelectaLogo } from "@/components/ui/selecta-logo"
import { AppTabBar, SidebarNav, type NavItem } from "@/components/layout/app-nav"
import { UserMenu } from "@/components/layout/user-menu"
import { useCurrentUser, useLogout } from "@/lib/queries/use-auth"
import { getInitials } from "@/lib/format"
import { cn } from "@/lib/utils"
import { useCandidateProfile } from "@/lib/queries/use-candidate-profile"
import { getProfileCompletion } from "@/lib/candidate-completion"

const NAV_ITEMS: NavItem[] = [
  { href: "/visao-geral", label: "Visão geral", icon: LayoutGrid },
  { href: "/vagas", label: "Vagas", icon: Briefcase },
  { href: "/candidaturas", label: "Candidaturas", icon: FileText },
  { href: "/mensagens", label: "Mensagens", icon: MessageSquare, dotBadge: true },
  { href: "/profile/candidato", label: "Meu perfil", icon: UserRound },
  { href: "/notificacoes", label: "Notificações", icon: Bell },
]

const MOBILE_TAB_ITEMS: NavItem[] = [
  { href: "/visao-geral", label: "Início", icon: LayoutGrid },
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
  const { user: currentUser } = useCurrentUser()

  const displayName = currentUser?.name?.trim() || profile?.userName?.trim() || "Usuário"
  const displayEmail = currentUser?.email?.trim() || profile?.userEmail?.trim() || undefined
  const initials = getInitials(displayName)

  useEffect(() => {
    const hour = new Date().getHours()
    setGreeting(hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite")
  }, [])

  const headerInfo = useMemo(() => {
    const firstName = displayName.split(" ")[0]
    if (pathname.startsWith("/visao-geral")) {
      return {
        title: `${greeting}, ${firstName}! 👋`,
        subtitle: "Aqui está o resumo do seu momento profissional e processos seletivos.",
      }
    }
    if (pathname.startsWith("/vagas") || pathname === "/dashboard") {
      return {
        title: `${greeting}, ${firstName}!`,
        subtitle: "Encontre oportunidades que combinam com o seu perfil.",
      }
    }
    if (pathname.startsWith("/candidaturas")) {
      return {
        title: "Minhas Candidaturas",
        subtitle: "Acompanhe a evolução de cada etapa dos seus processos seletivos.",
      }
    }
    if (pathname.startsWith("/mensagens")) {
      return {
        title: "Mensagens",
        subtitle: "Converse com recrutadores e acompanhe feedbacks.",
      }
    }
    if (pathname.startsWith("/profile")) {
      return {
        title: "Meu Perfil",
        subtitle: "Gerencie suas informações, experiências, habilidades e currículo.",
      }
    }
    if (pathname.startsWith("/notificacoes")) {
      return {
        title: "Notificações",
        subtitle: "Alertas e novidades sobre suas vagas e candidaturas.",
      }
    }
    if (pathname.startsWith("/configuracoes")) {
      return {
        title: "Configurações",
        subtitle: "Preferências e dados da sua conta.",
      }
    }
    return {
      title: `${greeting}, ${firstName}!`,
      subtitle: "Bem-vindo ao seu painel da Selecta.",
    }
  }, [pathname, greeting, displayName])

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
            href="/visao-geral"
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
              href="/profile/candidato/completar"
              className="group relative block rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-xs transition-all hover:border-[#7c3aed]/40 hover:shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="relative size-9 shrink-0">
                    <svg className="size-9 -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-slate-100"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-[#7c3aed]"
                        strokeDasharray={`${profile ? getProfileCompletion(profile).value : 70}, 100`}
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-slate-500">Seu perfil</p>
                    <p className="text-xs font-bold text-slate-900">
                      {profile ? getProfileCompletion(profile).value : 70}% completo
                    </p>
                  </div>
                </div>
                <ArrowRight className="size-4 text-[#7c3aed] transition-transform group-hover:translate-x-0.5" />
              </div>
              <p className="mt-2 text-[10px] leading-snug text-slate-500">
                Complete seu perfil para receber vagas mais alinhadas com você.
              </p>
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
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              className="grid size-10 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-100 active:scale-95 lg:hidden"
              aria-label="Abrir menu"
              aria-expanded={mobileDrawerOpen}
            >
              <Menu className="size-5" />
            </button>
            <Link href="/visao-geral" className="shrink-0 lg:hidden">
              <SelectaLogo />
            </Link>

            {/* Barra de Busca Top Navbar */}
            <div className="relative hidden w-full max-w-lg lg:block">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar vagas, empresas ou palavras-chave..."
                className="w-full rounded-xl bg-slate-100/80 py-2.5 pl-10 pr-4 text-xs text-slate-800 placeholder:text-slate-400 border border-slate-200/50 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/20 focus:border-[#7c3aed]/40"
              />
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
                secondary={displayEmail}
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
                secondary={displayEmail}
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

        <main className="min-w-0 flex-1 pb-20 lg:pb-8">{children}</main>
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