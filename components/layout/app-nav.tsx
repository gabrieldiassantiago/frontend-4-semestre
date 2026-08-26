"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export type NavItem = {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

function useIsActive() {
  const pathname = usePathname()
  return (href: string) => pathname === href || pathname.startsWith(`${href}/`)
}

/** Navegação horizontal do header (desktop). */
export function AppNav({ items, className }: { items: NavItem[]; className?: string }) {
  const isActive = useIsActive()

  return (
    <nav className={cn("h-full items-center", className)} aria-label="Navegação principal">
      {items.map((item) => {
        const active = isActive(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative flex h-full items-center gap-2 whitespace-nowrap px-3 text-sm font-semibold transition-colors",
              active ? "text-primary-subtle-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <item.icon className="size-4" />
            {item.label}
            {active && (
              <span className="absolute inset-x-3 bottom-0 h-[2px] rounded-full bg-primary" aria-hidden />
            )}
          </Link>
        )
      })}
    </nav>
  )
}

/** Barra de navegação inferior fixa (mobile), padrão de app nativo. */
export function AppTabBar({ items }: { items: NavItem[] }) {
  const isActive = useIsActive()

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
    >
      <ul className="flex items-stretch">
        {items.map((item) => {
          const active = isActive(item.href)
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-1 whitespace-nowrap py-2.5 text-[11px] font-semibold transition-colors",
                  active ? "text-primary-subtle-foreground" : "text-muted-foreground",
                )}
              >
                <span
                  className={cn(
                    "grid size-8 place-items-center rounded-full transition-colors",
                    active && "bg-primary-subtle",
                  )}
                >
                  <item.icon className="size-[18px]" />
                </span>
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
