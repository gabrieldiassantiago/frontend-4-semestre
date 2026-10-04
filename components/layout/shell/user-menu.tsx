"use client"

import Link from "next/link"
import { ChevronDown, LogOut, type LucideIcon } from "lucide-react"
import { useDismissable } from "@/lib/hooks/use-dismissable"
import { cn } from "@/lib/utils"

export type UserMenuLink = {
  href: string
  label: string
  icon: LucideIcon
}

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
        aria-label={`Menu da conta de ${name}`}
        className="flex items-center gap-2.5 rounded-full p-1 transition-colors hover:bg-muted md:rounded-lg md:py-1 md:pl-1 md:pr-2"
      >
        {avatar}
        <span className="hidden min-w-0 max-w-40 text-left md:block">
          <span className="block truncate text-sm font-semibold leading-tight text-foreground">{name}</span>
          {secondary && <span className="block truncate text-xs leading-tight text-muted-foreground">{secondary}</span>}
        </span>
        <ChevronDown
          aria-hidden
          className={cn("hidden size-4 shrink-0 text-subtle-foreground transition-transform md:block", open && "rotate-180")}
        />
      </button>

      <div
        role="menu"
        aria-label="Conta"
        className={cn(
          "absolute right-0 top-full z-50 mt-2 w-64 origin-top-right rounded-xl border border-border bg-card p-1.5 shadow-overlay transition-[opacity,transform] duration-150",
          open ? "pointer-events-auto scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0",
        )}
      >
        <div className="flex items-center gap-3 rounded-lg px-2.5 py-2.5">
          {avatar}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">{name}</p>
            {secondary && <p className="truncate text-xs text-muted-foreground">{secondary}</p>}
          </div>
        </div>
        <div className="my-1 h-px bg-border" role="separator" />
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            role="menuitem"
            tabIndex={open ? 0 : -1}
            onClick={close}
            className="flex min-h-10 items-center gap-3 rounded-lg px-2.5 text-sm font-medium text-strong-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <link.icon aria-hidden className="size-4 text-muted-foreground" />
            {link.label}
          </Link>
        ))}
        <div className="my-1 h-px bg-border" role="separator" />
        <button
          type="button"
          role="menuitem"
          tabIndex={open ? 0 : -1}
          onClick={() => {
            close()
            onLogout()
          }}
          className="flex min-h-10 w-full items-center gap-3 rounded-lg px-2.5 text-sm font-medium text-danger-foreground transition-colors hover:bg-danger-subtle"
        >
          <LogOut aria-hidden className="size-4" />
          Sair da conta
        </button>
      </div>
    </div>
  )
}
