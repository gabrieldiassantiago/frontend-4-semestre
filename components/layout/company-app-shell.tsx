"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BriefcaseBusiness, Building2, ChevronRight, LayoutDashboard, LogOut, Menu, Plus, UsersRound, Workflow, X } from "lucide-react"
import { SelectaLogo } from "@/components/ui/selecta-logo"
import { CompanyLogo } from "@/components/company/company-logo"
import { useLogout } from "@/lib/queries/use-auth"
import { useCompanyProfile } from "@/lib/queries/use-company-profile"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { href: "/empresa/dashboard", label: "Visão geral", icon: LayoutDashboard },
  { href: "/empresa/vagas", label: "Vagas", icon: BriefcaseBusiness },
  { href: "/empresa/candidatos", label: "Candidatos", icon: UsersRound },
  { href: "/empresa/processos", label: "Processos seletivos", icon: Workflow },
  { href: "/empresa/perfil", label: "Perfil da empresa", icon: Building2 },
]

export function CompanyAppShell({ children, currentPath }: { children: React.ReactNode; currentPath?: string }) {
  const { profile } = useCompanyProfile()
  const logout = useLogout("/auth/recrutador")
  const actualPathname = usePathname()
  const pathname = currentPath ?? actualPathname
  const [drawerOpen, setDrawerOpen] = useState(false)
  const drawerRef = useRef<HTMLElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const activeItem = NAV_ITEMS.find(item => pathname === item.href || pathname.startsWith(item.href + "/"))
  const name = profile?.companyName || "Minha empresa"

  useEffect(() => {
    if (!drawerOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    drawerRef.current?.querySelector<HTMLButtonElement>("button")?.focus()
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDrawerOpen(false)
      if (event.key !== "Tab") return
      const elements = drawerRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')
      if (!elements?.length) return
      const first = elements[0], last = elements[elements.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
    document.addEventListener("keydown", handleKey)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener("keydown", handleKey)
      triggerRef.current?.focus()
    }
  }, [drawerOpen])

  function navigation() {
    return <nav aria-label="Menu da empresa" className="space-y-1 px-3">
      {NAV_ITEMS.map((item, index) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/")
        const Icon = item.icon
        return <div key={item.href} className={index === 4 ? "mt-6 border-t border-border pt-5" : undefined}>
          {index === 4 && <p className="mb-2 px-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Configurações</p>}
          <Link href={item.href} onClick={() => setDrawerOpen(false)} aria-current={active ? "page" : undefined} className={cn("flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-primary", active ? "bg-primary-subtle font-semibold text-primary" : "font-medium text-muted-foreground hover:bg-surface hover:text-foreground")}><Icon className="size-[18px]" strokeWidth={1.7} aria-hidden />{item.label}</Link>
        </div>
      })}
    </nav>
  }
  function identity() {
    return <Link href="/empresa/perfil" onClick={() => setDrawerOpen(false)} className="mx-4 mb-6 flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-surface"><CompanyLogo url={profile?.logoUrl} name={name} /><div className="min-w-0"><p className="truncate text-sm font-semibold">{name}</p><p className="mt-0.5 text-xs text-muted-foreground">Área da empresa</p></div></Link>
  }
  function footer() {
    return <div className="mt-auto border-t border-border p-4"><button type="button" onClick={logout} className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm text-muted-foreground hover:bg-surface hover:text-foreground"><LogOut className="size-[18px]" aria-hidden />Sair da conta</button></div>
  }
  return (
    <div className="company-workspace min-h-dvh bg-surface text-foreground">
      <a href="#company-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-card focus:p-4">Ir para o conteúdo</a>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col border-r border-border bg-card lg:flex">
        <Link href="/empresa/dashboard" aria-label="Selecta, início" className="flex h-20 items-center px-7"><SelectaLogo className="h-7" /></Link>
        {identity()}
        <p className="mb-3 px-6 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Recrutamento</p>
        {navigation()}{footer()}
      </aside>
      <div className="min-w-0 lg:ml-[248px]">
        <header className="flex h-[72px] items-center justify-between gap-3 border-b border-border bg-card px-4 sm:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button ref={triggerRef} type="button" onClick={() => setDrawerOpen(true)} aria-label="Abrir menu da empresa" aria-expanded={drawerOpen} aria-controls="company-mobile-menu" className="grid size-11 shrink-0 place-items-center rounded-lg border border-border lg:hidden"><Menu className="size-5" /></button>
            <span className="hidden text-sm text-muted-foreground sm:inline">Empresa</span><ChevronRight className="hidden size-3.5 text-subtle-foreground sm:block" aria-hidden /><span className="truncate text-sm font-medium">{activeItem?.label || "Recrutamento"}</span>
          </div>
          <Link href="/empresa/vagas/nova" className="btn-primary shrink-0"><Plus className="size-4" aria-hidden /><span>Nova vaga</span></Link>
        </header>
        <div id="company-content" tabIndex={-1} className="company-content min-w-0 outline-none">{children}</div>
      </div>
      {drawerOpen && <div className="fixed inset-0 z-50 lg:hidden">
        <button type="button" aria-label="Fechar menu" onClick={() => setDrawerOpen(false)} className="absolute inset-0 bg-black/35" />
        <aside id="company-mobile-menu" ref={drawerRef} role="dialog" aria-modal="true" aria-label="Menu da empresa" className="absolute inset-y-0 left-0 flex w-[min(300px,85vw)] flex-col overflow-y-auto bg-card shadow-xl">
          <div className="flex h-20 shrink-0 items-center justify-between px-5"><SelectaLogo className="h-7" /><button type="button" aria-label="Fechar menu" onClick={() => setDrawerOpen(false)} className="grid size-11 place-items-center rounded-lg hover:bg-surface"><X className="size-5" /></button></div>
          {identity()}{navigation()}{footer()}
        </aside>
      </div>}
    </div>
  )
}
