"use client"

import Link from "next/link"
import { ChevronDown, LogOut } from "lucide-react"
import { useDismissable } from "@/lib/hooks/useDismissable"
import { cn } from "@/lib/utils"

export type UserMenuLink = {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

/**
 * Menu de conta usado pelos dois app shells (candidato e empresa).
 * Antes esse markup e o handler de clique-fora estavam duplicados.
 */
export function UserMenu({
  name,
  secondary,
  avatar,
  links,
  onLogout,
}: {
  name: string
  secondary?: string
  avatar: React.ReactNode
  links: UserMenuLink[]
  onLogout: () => void
}) {
  const { ref, open, toggle, close } = useDismissable()

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2 rounded-full border border-border bg-card p-1 pr-2.5 transition-colors hover:border-border-strong"
      >
        {avatar}
        <span className="hidden max-w-36 truncate text-sm font-semibold sm:block">{name}</span>
        <ChevronDown
          className={cn("size-4 text-subtle-foreground transition-transform", open && "rotate-180")}
          aria-hidden
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-64 origin-top-right overflow-hidden rounded-card border border-border bg-card p-2 shadow-overlay"
        >
          <div className="border-b border-border-subtle px-3 pb-3 pt-2">
            <p className="truncate text-sm font-bold text-foreground">{name}</p>
            {secondary && <p className="mt-0.5 truncate text-xs text-muted-foreground">{secondary}</p>}
          </div>

          <div className="pt-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                role="menuitem"
                onClick={close}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-strong-foreground transition-colors hover:bg-muted"
              >
                <link.icon className="size-4" />
                {link.label}
              </Link>
            ))}
            <button
              type="button"
              role="menuitem"
              onClick={onLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-danger-foreground transition-colors hover:bg-danger-subtle"
            >
              <LogOut className="size-4" />
              Sair
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
