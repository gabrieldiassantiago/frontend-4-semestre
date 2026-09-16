"use client"

import { useState } from "react"
import Link from "next/link"
import {
  BriefcaseBusiness,
  Building2,
  LayoutDashboard,
  Menu,
  Plus,
  Search,
  UserRound,
  UsersRound,
  X,
} from "lucide-react"
import { SelectaLogo } from "@/components/ui/selecta-logo"
import { SidebarNav, type NavItem } from "@/components/layout/app-nav"
import { UserMenu } from "@/components/layout/user-menu"
import { useLogout } from "@/lib/hooks/useLogout"
import { useCompanyProfile } from "@/lib/hooks/useCompanyProfile"
import { cn } from "@/lib/utils"

const NAV_ITEMS: NavItem[] = [
  { href: "/empresa/dashboard", label: "Visão geral", icon: LayoutDashboard },
  { href: "/empresa/vagas", label: "Vagas", icon: BriefcaseBusiness },
  { href: "/empresa/candidatos", label: "Candidatos", icon: Search },
  { href: "/empresa/processos", label: "Processos", icon: UsersRound },
]

export function CompanyAppShell({ children }: { children: React.ReactNode }) {
  const { profile } = useCompanyProfile()
  const logout = useLogout("/auth/empresa")
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-surface text-foreground">
      {/* ── Sidebar Fixa — Desktop ── */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[260px] flex-col border-r border-border-subtle/60 bg-background/95 backdrop-blur-md lg:flex">
        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center gap-3 border-b border-border-subtle/50 px-5">
          <Link href="/empresa/dashboard" aria-label="Selecta — ir para o início" className="shrink-0">
            <SelectaLogo />
          </Link>
          <span className="text-xs font-semibold text-muted-foreground tracking-wide">
            Painel Corporativo
          </span>
        </div>

        {/* Empresa Info */}
        <div className="border-b border-border-subtle/50 px-4 py-4">
          <div className="flex items-center gap-3 rounded-2xl bg-muted/40 px-3 py-2.5">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <Building2 className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">
                {profile?.companyName || "Minha empresa"}
              </p>
              <p className="text-[11px] text-muted-foreground">Conta corporativa</p>
            </div>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
            Menu
          </p>
          <SidebarNav items={NAV_ITEMS} />
        </nav>

        {/* Footer: Nova Vaga + UserMenu */}
        <div className="border-t border-border-subtle/50 px-4 py-4 space-y-3">
          <Link
            href="/empresa/vagas/nova"
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-95 active:scale-95"
          >
            <Plus className="size-4" />
            Publicar vaga
          </Link>

          <UserMenu
            name={profile?.companyName || "Minha empresa"}
            secondary="Conta corporativa"
            avatar={
              <span className="grid size-8 place-items-center rounded-full bg-muted text-foreground">
                <Building2 className="size-4 text-muted-foreground" />
              </span>
            }
            links={[{ href: "/empresa/perfil", label: "Perfil da empresa", icon: UserRound }]}
            onLogout={logout}
          />
        </div>
      </aside>

      {/* ── Top Navbar — Mobile ── */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-border-subtle/50 bg-background/95 px-4 backdrop-blur-md lg:hidden">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Abrir menu"
            className="grid size-9 place-items-center rounded-full border border-border-subtle text-foreground hover:bg-muted"
          >
            <Menu className="size-4" />
          </button>
          <Link href="/empresa/dashboard" aria-label="Início" className="shrink-0">
            <SelectaLogo />
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/empresa/vagas/nova"
            className="inline-flex h-8 items-center gap-1.5 rounded-full bg-primary px-3.5 text-xs font-semibold text-primary-foreground"
          >
            <Plus className="size-3.5" />
            <span className="hidden sm:inline">Nova vaga</span>
          </Link>
          <UserMenu
            name={profile?.companyName || "Minha empresa"}
            secondary="Conta corporativa"
            avatar={
              <span className="grid size-8 place-items-center rounded-full bg-muted text-foreground">
                <Building2 className="size-4 text-muted-foreground" />
              </span>
            }
            links={[{ href: "/empresa/perfil", label: "Perfil da empresa", icon: UserRound }]}
            onLogout={logout}
          />
        </div>
      </header>

      {/* ── Drawer Sidebar — Mobile ── */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
            aria-hidden
          />

          {/* Drawer */}
          <aside
            className={cn(
              "absolute inset-y-0 left-0 flex w-72 flex-col border-r border-border-subtle/60 bg-background shadow-2xl",
              "animate-in slide-in-from-left duration-300",
            )}
          >
            {/* Header do drawer */}
            <div className="flex h-14 items-center justify-between border-b border-border-subtle/50 px-4">
              <SelectaLogo />
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Fechar menu"
                className="grid size-9 place-items-center rounded-full border border-border-subtle text-foreground hover:bg-muted"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Empresa Info */}
            <div className="border-b border-border-subtle/50 px-4 py-4">
              <div className="flex items-center gap-3 rounded-2xl bg-muted/40 px-3 py-2.5">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Building2 className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {profile?.companyName || "Minha empresa"}
                  </p>
                  <p className="text-[11px] text-muted-foreground">Conta corporativa</p>
                </div>
              </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto px-3 py-4" onClick={() => setDrawerOpen(false)}>
              <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                Menu
              </p>
              <SidebarNav items={NAV_ITEMS} />
            </nav>

            {/* Footer */}
            <div className="border-t border-border-subtle/50 px-4 py-4">
              <Link
                href="/empresa/vagas/nova"
                onClick={() => setDrawerOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-95 active:scale-95"
              >
                <Plus className="size-4" />
                Publicar vaga
              </Link>
            </div>
          </aside>
        </div>
      )}

      {/* ── Conteúdo Principal ── */}
      <main className="flex-1 pt-14 lg:ml-[260px] lg:pt-0">
        {children}
      </main>
    </div>
  )
}