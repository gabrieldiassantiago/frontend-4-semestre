"use client"

import Link from "next/link"
import { ChevronUp, LogOut } from "lucide-react"
import { useDismissable } from "@/lib/hooks/useDismissable"
import { cn } from "@/lib/utils"

export type UserMenuLink = {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

interface UserMenuProps {
  name: string
  secondary?: string
  avatar: React.ReactNode
  links: UserMenuLink[]
  onLogout: () => void
  collapsed?: boolean
}

export function UserMenu({
  name,
  secondary,
  avatar,
  links,
  onLogout,
  collapsed = false,
}: UserMenuProps) {
  const { ref, open, toggle, close } = useDismissable()

  return (
    <div ref={ref} className="relative w-full">
      {/* Botão de Trigger */}
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-haspopup="menu"
        className={cn(
          "group relative flex w-full items-center justify-between rounded-2xl border border-border/40 bg-card/60 p-2 text-left backdrop-blur-md transition-all duration-300 ease-out hover:border-border hover:bg-card hover:shadow-lg hover:shadow-black/5 active:scale-[0.98]",
          collapsed && "justify-center border-none bg-transparent p-0 hover:bg-transparent hover:shadow-none"
        )}
      >
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative shrink-0">
            {avatar}
            <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-card bg-emerald-500" />
          </div>

          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-foreground transition-colors group-hover:text-primary">
                {name}
              </p>
              {secondary && (
                <p className="truncate text-[11px] font-medium text-muted-foreground/80">
                  {secondary}
                </p>
              )}
            </div>
          )}
        </div>

        {!collapsed && (
          <ChevronUp
            className={cn(
              "size-4 shrink-0 text-muted-foreground/70 transition-transform duration-300 ease-out group-hover:text-foreground",
              open ? "rotate-0" : "rotate-180"
            )}
          />
        )}
      </button>

      {/* Popover Card */}
      <div
        role="menu"
        className={cn(
          "absolute z-50 overflow-hidden rounded-3xl border border-border/50 bg-card/95 p-1.5 backdrop-blur-xl transition-all duration-200 ease-out shadow-[0_20px_50px_-12px_rgba(0,0,0,0.18)]",
          open
            ? "pointer-events-auto opacity-100 scale-100 translate-y-0 translate-x-0"
            : "pointer-events-none opacity-0 scale-95",
          // Quando expandido, abre por cima do menu. Quando recolhido, abre para a direita.
          collapsed
            ? "left-full bottom-0 ml-3 min-w-[230px] origin-bottom-left -translate-x-2"
            : "bottom-full left-0 mb-3 w-full min-w-[240px] origin-bottom-left translate-y-2"
        )}
      >
        {/* Cabeçalho do Usuário */}
        <div className="relative overflow-hidden rounded-2xl bg-muted/40 p-3">
          <div className="flex items-center gap-3">
            {avatar}
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-foreground">{name}</p>
              {secondary && (
                <p className="truncate text-[11px] font-medium text-muted-foreground">
                  {secondary}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="my-1.5 h-px bg-border/40" />

        {/* Links de Ação */}
        <div className="space-y-0.5">
          {links.map((link) => {
            const Icon = link.icon
            return (
              <Link
                key={link.href}
                href={link.href}
                role="menuitem"
                onClick={close}
                className="group flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold text-foreground/80 transition-all duration-200 hover:bg-primary/10 hover:text-primary active:scale-[0.98]"
              >
                <div className="grid size-7 place-items-center rounded-lg bg-muted/60 text-muted-foreground transition-colors group-hover:bg-primary/15 group-hover:text-primary">
                  <Icon className="size-3.5 transition-transform duration-200 group-hover:scale-110" />
                </div>
                {link.label}
              </Link>
            )
          })}
        </div>

        <div className="my-1.5 h-px bg-border/40" />

        {/* Ação de Sair */}
        <button
          type="button"
          role="menuitem"
          onClick={() => {
            close()
            onLogout()
          }}
          className="group flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold text-destructive transition-all duration-200 hover:bg-destructive/10 active:scale-[0.98]"
        >
          <div className="grid size-7 place-items-center rounded-lg bg-destructive/10 text-destructive transition-colors group-hover:bg-destructive group-hover:text-destructive-foreground">
            <LogOut className="size-3.5 transition-transform duration-200 group-hover:scale-110" />
          </div>
          Sair da conta
        </button>
      </div>
    </div>
  )
}