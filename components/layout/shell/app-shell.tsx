"use client"

import { useCallback, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LogOut, Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react"
import { SelectaLogo } from "@/components/ui/selecta-logo"
import { findActiveNavItem, type AreaNavigation } from "@/lib/config/navigation"
import { useSidebarCollapsed } from "@/lib/hooks/use-sidebar-collapsed"
import { cn } from "@/lib/utils"
import { MobileDrawer } from "./mobile-drawer"
import { MobileTabBar } from "./mobile-tab-bar"
import { SidebarNav, SidebarNavLink } from "./sidebar-nav"

export type AppShellSlots = {
  /** Bloco acima da navegação (ex.: identidade da empresa). Recebe o estado recolhido. */
  sidebarTop?: (state: { collapsed: boolean; close: () => void }) => React.ReactNode
  /** Bloco acima do rodapé da sidebar (ex.: progresso do perfil). */
  sidebarBottom?: (state: { collapsed: boolean; close: () => void }) => React.ReactNode
  /** Conteúdo central da topbar (ex.: busca global). */
  topbarCenter?: React.ReactNode
  /** Ações à direita da topbar (ex.: CTA, notificações, menu do usuário). */
  topbarActions?: React.ReactNode
  /** Rodapé da gaveta mobile (ex.: sair da conta). */
  drawerFooter?: React.ReactNode
}

/**
 * Estrutura comum às áreas autenticadas (candidato e empresa):
 * sidebar recolhível no desktop, topbar fixa, gaveta e barra inferior no mobile.
 * Cada área injeta apenas sua configuração de navegação e seus slots.
 */
export function AppShell({
  navigation,
  pathname: pathnameOverride,
  areaLabel,
  className,
  children,
  ...slots
}: AppShellSlots & {
  navigation: AreaNavigation
  /** Permite forçar a rota ativa (usado nas prévias de design). */
  pathname?: string
  areaLabel: string
  className?: string
  children: React.ReactNode
}) {
  const currentPathname = usePathname()
  const pathname = pathnameOverride ?? currentPathname
  const [collapsed, setCollapsed] = useSidebarCollapsed()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const closeDrawer = useCallback(() => setDrawerOpen(false), [])

  const activeItem = findActiveNavItem(pathname, navigation)
  const desktopState = { collapsed, close: () => {} }
  const drawerState = { collapsed: false, close: closeDrawer }

  return (
    <div className={cn("min-h-dvh bg-surface text-foreground", className)}>
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-card focus:px-4 focus:py-3 focus:text-sm focus:font-semibold focus:shadow-overlay"
      >
        Ir para o conteúdo
      </a>

      <aside
        aria-label={areaLabel}
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-border bg-card transition-[width] duration-200 lg:flex",
          collapsed ? "w-[76px]" : "w-64",
        )}
      >
        <div className={cn("flex h-16 shrink-0 items-center", collapsed ? "justify-center" : "px-6")}>
          <Link href={navigation.home} aria-label="Selecta, ir para o início" className="flex items-center">
            <SelectaLogo solo={collapsed} className={collapsed ? "h-8" : "h-7"} />
          </Link>
        </div>

        {slots.sidebarTop?.(desktopState)}

        <div className={cn("flex-1 overflow-y-auto py-4", collapsed ? "px-2" : "px-3")}>
          <SidebarNav groups={navigation.groups} pathname={pathname} collapsed={collapsed} />
        </div>

        <div className={cn("flex shrink-0 flex-col gap-1 border-t border-border py-3", collapsed ? "px-2" : "px-3")}>
          {slots.sidebarBottom?.(desktopState)}
          {navigation.footer?.map((item) => (
            <SidebarNavLink key={item.href} item={item} pathname={pathname} collapsed={collapsed} />
          ))}
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Expandir menu lateral" : "Recolher menu lateral"}
            title={collapsed ? "Expandir menu" : "Recolher menu"}
            className={cn(
              "flex min-h-10 items-center gap-3 rounded-lg text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
              collapsed ? "mx-auto size-10 justify-center" : "px-3",
            )}
          >
            {collapsed ? (
              <PanelLeftOpen aria-hidden className="size-[18px]" strokeWidth={1.75} />
            ) : (
              <>
                <PanelLeftClose aria-hidden className="size-[18px] text-subtle-foreground" strokeWidth={1.75} />
                Recolher menu
              </>
            )}
          </button>
        </div>
      </aside>

      <div className={cn("flex min-h-dvh min-w-0 flex-col transition-[padding] duration-200", collapsed ? "lg:pl-[76px]" : "lg:pl-64")}>
        <header className="sticky top-0 z-20 border-b border-border bg-card/90 backdrop-blur-md">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Abrir menu"
              aria-expanded={drawerOpen}
              className="grid size-10 shrink-0 place-items-center rounded-lg border border-border text-strong-foreground transition-colors hover:bg-muted lg:hidden"
            >
              <Menu className="size-5" aria-hidden />
            </button>
            <Link href={navigation.home} aria-label="Selecta, ir para o início" className="shrink-0 lg:hidden">
              <SelectaLogo solo className="h-8 sm:hidden" />
              <SelectaLogo className="hidden h-7 sm:block" />
            </Link>

            <p className="hidden min-w-0 shrink-0 truncate text-sm font-semibold text-foreground lg:block">
              {activeItem?.label}
            </p>

            <div className="flex min-w-0 flex-1 justify-center">{slots.topbarCenter}</div>

            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">{slots.topbarActions}</div>
          </div>
        </header>

        <div id="conteudo" tabIndex={-1} className="min-w-0 flex-1 pb-[calc(4rem+env(safe-area-inset-bottom))] outline-none lg:pb-0">
          {children}
        </div>
      </div>

      <MobileDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        label={areaLabel}
        header={<SelectaLogo className="h-7" />}
        footer={slots.drawerFooter}
      >
        {slots.sidebarTop && <div className="-mx-3 -mt-2 mb-5">{slots.sidebarTop(drawerState)}</div>}
        <SidebarNav groups={navigation.groups} pathname={pathname} onNavigate={closeDrawer} />
        {navigation.footer && (
          <div className="mt-5 flex flex-col gap-1 border-t border-border pt-4">
            {navigation.footer.map((item) => (
              <SidebarNavLink key={item.href} item={item} pathname={pathname} onNavigate={closeDrawer} />
            ))}
          </div>
        )}
        {slots.sidebarBottom && <div className="mt-5">{slots.sidebarBottom(drawerState)}</div>}
      </MobileDrawer>

      <MobileTabBar items={navigation.tabs} pathname={pathname} />
    </div>
  )
}

/** Botão "Sair da conta" padronizado para o rodapé da gaveta. */
export function DrawerLogoutButton({ onLogout }: { onLogout: () => void }) {
  return (
    <button
      type="button"
      onClick={onLogout}
      className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-semibold text-danger-foreground transition-colors hover:bg-danger-subtle"
    >
      <LogOut aria-hidden className="size-[18px]" />
      Sair da conta
    </button>
  )
}
