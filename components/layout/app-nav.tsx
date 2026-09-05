"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export type NavItem = {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string | number
}

function useIsActive() {
  const pathname = usePathname()
  return (href: string) => pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`))
}

export function SidebarNav({
  items,
  collapsed = false,
  className,
}: {
  items: NavItem[]
  collapsed?: boolean
  className?: string
}) {
  const isActive = useIsActive()

  return (
    <nav className={cn("flex flex-col gap-1", className)} aria-label="Navegação lateral">
      {items.map((item) => {
        const active = isActive(item.href)
        const Icon = item.icon

        return (
          <Link
            key={item.href}
            href={item.href}
            title={collapsed ? item.label : undefined}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group relative flex items-center rounded-2xl text-sm font-semibold transition-all duration-200 ease-out",
              collapsed
                ? "size-11 justify-center mx-auto"
                : "justify-between gap-3 px-3.5 py-2.5",
              active
                ? "bg-primary text-primary-foreground shadow-[0_6px_16px_-4px_rgb(124_58_237/0.45)]"
                : "text-muted-foreground hover:bg-muted hover:text-foreground hover:translate-x-0.5",
            )}
          >
            <div className={cn("flex items-center", !collapsed && "gap-3")}>
              <span
                className={cn(
                  "grid shrink-0 place-items-center rounded-lg transition-all duration-200",
                  collapsed ? "size-6" : "size-7",
                  active ? "" : "bg-transparent group-hover:bg-background/60",
                )}
              >
                <Icon
                  className={cn(
                    "size-4 shrink-0 transition-transform duration-200 group-hover:scale-110",
                    active ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
              </span>
              {!collapsed && <span className="tracking-[-0.01em]">{item.label}</span>}
            </div>

            {!collapsed && item.badge !== undefined && (
              <span
                className={cn(
                  "grid size-5 place-items-center rounded-full text-[10px] font-bold",
                  active
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-primary-subtle text-primary"
                )}
              >
                {item.badge}
              </span>
            )}
          </Link>
        )
      })}
    </nav>
  )
}


export function AppNav({ items, className }: { items: NavItem[]; className?: string }) {
  const isActive = useIsActive()

  return (
    <nav
      className={cn("flex items-center gap-1 overflow-x-auto no-scrollbar", className)}
      aria-label="Navegação principal"
    >
      {items.map((item) => {
        const active = isActive(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group relative flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200",
              active
                ? "bg-primary-subtle text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <item.icon
              className={cn(
                "size-4 transition-transform duration-200 group-hover:scale-110",
                active ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
              )}
            />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

export function AppTabBar({ items }: { items: NavItem[] }) {
  const isActive = useIsActive()

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_-12px_rgb(0_0_0/0.15)] backdrop-blur lg:hidden"
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
                  active ? "text-primary font-bold" : "text-muted-foreground",
                )}
              >
                <span
                  className={cn(
                    "grid place-items-center rounded-full transition-all duration-200",
                    active ? "size-9 bg-primary-subtle text-primary scale-105" : "size-9 text-muted-foreground",
                  )}
                >
                  <item.icon className={cn("transition-all duration-200", active ? "size-5" : "size-[18px]")} />
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

