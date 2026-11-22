"use client"

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, House, LogOut, Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react"
import { SelectaLogo } from "@/components/ui/selecta-logo"
import { findActiveNavItem, type AreaNavigation } from "@/lib/config/navigation"
import { useSidebarCollapsed } from "@/lib/hooks/use-sidebar-collapsed"
import { cn } from "@/lib/utils"
import { MobileDrawer } from "./mobile-drawer"
import { MobileTabBar } from "./mobile-tab-bar"
import { SidebarNav, SidebarNavLink, type NavBadges, type SidebarVariant } from "./sidebar-nav"

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
  /** Subtítulo exibido abaixo do título da página na topbar. */
  topbarSubtitle?: React.ReactNode
  /** Contadores por item de navegação (chave = href). */
  badges?: NavBadges
  /** Estilo da navegação lateral. */
  navVariant?: SidebarVariant
  /** Tarefa em foco (ex.: publicar vaga): esconde a barra inferior do mobile. */
  focusMode?: boolean
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
  const headerRef = useRef<HTMLElement>(null)
  const [topbarHidden, setTopbarHidden] = useState(false)

  // Topbar inteligente: some ao rolar para baixo e volta ao rolar para cima.
  // Fica visível perto do topo e enquanto estiver em uso (busca focada ou menu aberto).
  useEffect(() => {
    let lastY = window.scrollY
    let ticking = false

    function update() {
      ticking = false
      const y = window.scrollY
      const delta = y - lastY
      if (Math.abs(delta) < 6) return
      lastY = y
      const header = headerRef.current
      const inUse = header
        ? header.contains(document.activeElement) || header.querySelector('[aria-expanded="true"]') !== null
        : false
      setTopbarHidden(delta > 0 && y > 96 && !inUse)
    }

    function onScroll() {
      if (ticking) return
      ticking = true
      window.requestAnimationFrame(update)
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Ctrl/Cmd+B recolhe ou expande o menu (ignorado enquanto se digita, onde é o atalho de negrito).
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== "b") return
      const target = event.target as HTMLElement | null
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return
      event.preventDefault()
      setCollapsed(!collapsed)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [collapsed, setCollapsed])

  const activeItem = findActiveNavItem(pathname, navigation)
    const isNestedPage = Boolean(activeItem && pathname.startsWith(`${activeItem.href}/`))
  const nestedLabel = pathname.endsWith("/editar") ? "Editar" : pathname.endsWith("/nova") ? "Nova vaga" : "Detalhes"
  const desktopState = { collapsed, close: () => {} }
  const drawerState = { collapsed: false, close: closeDrawer }

  return (
    <div
      className={cn("min-h-dvh bg-surface text-foreground", className)}
      // Elementos fixos das páginas (abas, colunas) acompanham a topbar por esta variável.
      style={{ "--topbar-offset": topbarHidden ? "12px" : "76px" } as CSSProperties}
    >
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-card focus:px-4 focus:py-3 focus:text-sm focus:font-semibold focus:shadow-overlay"
      >
        Ir para o conteúdo
      </a>

      <aside
        aria-label={areaLabel}
        className={cn(
          "fixed inset-y-3 left-3 z-30 hidden flex-col rounded-[28px] border border-border/60 bg-card transition-[width] duration-200 lg:flex",
          collapsed ? "w-[76px]" : "w-64",
        )}
      >
        <div className={cn("flex shrink-0 items-center gap-2 pt-4", collapsed ? "flex-col px-2" : "justify-between pl-5 pr-3")}>
          <Link href={navigation.home} aria-label="Selecta, ir para o início" className="flex min-h-10 items-center">
            <SelectaLogo solo={collapsed} className={collapsed ? "h-8" : "h-7"} />
          </Link>
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Expandir menu lateral" : "Recolher menu lateral"}
            aria-expanded={!collapsed}
            title={collapsed ? "Expandir menu (Ctrl+B)" : "Recolher menu (Ctrl+B)"}
            className="grid size-9 shrink-0 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary-subtle hover:text-primary"
          >
            {collapsed ? (
              <PanelLeftOpen aria-hidden className="size-4" strokeWidth={1.75} />
            ) : (
              <PanelLeftClose aria-hidden className="size-4" strokeWidth={1.75} />
            )}
          </button>
        </div>

        {slots.sidebarTop && <div className="pt-3">{slots.sidebarTop(desktopState)}</div>}

        <div className={cn("no-scrollbar min-h-0 flex-1 overflow-y-auto py-5", collapsed ? "px-2" : "px-3")}>
          <SidebarNav groups={navigation.groups} pathname={pathname} collapsed={collapsed} badges={slots.badges} variant={slots.navVariant} />
        </div>

        <div className={cn("flex shrink-0 flex-col gap-1 pb-3", collapsed ? "px-2" : "px-3")}>
          {slots.sidebarBottom?.(desktopState)}
          {navigation.footer && <div aria-hidden className={cn("mb-1 h-px bg-border-subtle", collapsed ? "mx-auto w-6" : "mx-3")} />}
          {navigation.footer?.map((item) => (
            <SidebarNavLink key={item.href} item={item} pathname={pathname} collapsed={collapsed} />
          ))}
        </div>
      </aside>

      <div className={cn("flex min-h-dvh min-w-0 flex-col transition-[padding] duration-200", collapsed ? "lg:pl-[100px]" : "lg:pl-[280px]")}>
        <header
          ref={headerRef}
          onFocus={() => setTopbarHidden(false)}
          // O deslocamento só é aplicado quando escondida: assim os painéis fixos
          // abertos a partir da topbar (notificações no celular) não mudam de referência.
          className={cn(
            "sticky top-0 z-40 bg-surface pt-3 transition-transform duration-300 ease-out",
            topbarHidden && "-translate-y-full",
          )}
        >
          <div className="shell-topbar-inner px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center gap-3 rounded-[28px] border border-border/60 bg-card pl-3 pr-3 sm:pl-6">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Abrir menu"
              aria-expanded={drawerOpen}
              className="grid size-10 shrink-0 place-items-center rounded-full border border-border text-strong-foreground transition-colors hover:border-primary/40 hover:bg-primary-subtle hover:text-primary lg:hidden"
            >
              <Menu className="size-[18px]" strokeWidth={1.75} aria-hidden />
            </button>
            <div className="min-w-0 lg:max-w-[40%]">
              <nav aria-label="Localização na navegação">
                <ol className="flex min-w-0 items-center gap-1 text-sm">
                  <li className="hidden shrink-0 sm:block">
                    <Link href={navigation.home} className="-ml-2 inline-flex min-h-8 items-center gap-1.5 rounded-full px-2 text-muted-foreground transition-colors hover:bg-primary-subtle hover:text-primary">
                      <House aria-hidden className="size-3.5" strokeWidth={1.75} />
                      Início
                    </Link>
                  </li>
                  <li aria-hidden className="hidden text-border-strong sm:block"><ChevronRight className="size-3.5" /></li>
                  <li className="min-w-0 truncate">
                    {isNestedPage && activeItem ? <Link href={activeItem.href} className="inline-flex min-h-8 items-center rounded-full px-2 text-muted-foreground transition-colors hover:bg-primary-subtle hover:text-primary">{activeItem.label}</Link> : <span aria-current="page" className="px-1 font-semibold tracking-tight text-foreground">{activeItem?.label ?? areaLabel}</span>}
                  </li>
                  {isNestedPage && <><li aria-hidden className="text-border-strong"><ChevronRight className="size-3.5" /></li><li aria-current="page" className="shrink-0 px-1 font-semibold tracking-tight text-foreground">{nestedLabel}</li></>}
                </ol>
              </nav>
              {slots.topbarSubtitle && (
                <p className="mt-0.5 hidden truncate text-xs leading-tight text-muted-foreground first-letter:capitalize sm:block">{slots.topbarSubtitle}</p>
              )}
            </div>

            <div className="flex min-w-0 flex-1 justify-center">{slots.topbarCenter}</div>

            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">{slots.topbarActions}</div>
            </div>
          </div>
        </header>

        <div
          id="conteudo"
          tabIndex={-1}
          className={cn("min-w-0 flex-1 outline-none lg:pb-0", !slots.focusMode && "pb-[calc(4rem+env(safe-area-inset-bottom))]")}
        >
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
        <SidebarNav groups={navigation.groups} pathname={pathname} badges={slots.badges} onNavigate={closeDrawer} variant={slots.navVariant} />
        {navigation.footer && (
          <div className="mt-5 flex flex-col gap-1 border-t border-border pt-4">
            {navigation.footer.map((item) => (
              <SidebarNavLink key={item.href} item={item} pathname={pathname} onNavigate={closeDrawer} />
            ))}
          </div>
        )}
        {slots.sidebarBottom && <div className="mt-5">{slots.sidebarBottom(drawerState)}</div>}
      </MobileDrawer>

      {!slots.focusMode && <MobileTabBar items={navigation.tabs} pathname={pathname} badges={slots.badges} />}
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
