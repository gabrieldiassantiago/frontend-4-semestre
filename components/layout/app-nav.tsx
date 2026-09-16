"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export type NavItem = {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string | number
  dotBadge?: boolean
}

function useIsActive() {
  const pathname = usePathname()
  return (href: string) => {
    if (pathname === href) return true
    if (href === "/vagas" && (pathname === "/dashboard" || pathname === "/vagas")) return true
    if (href !== "/dashboard" && href !== "/vagas" && pathname.startsWith(`${href}/`)) return true
    return false
  }
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
    <nav className={cn("flex flex-col gap-1.5", className)} aria-label="Navegação lateral">
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
              "group relative flex items-center rounded-2xl text-sm font-medium transition-all duration-200 ease-out",
              collapsed
                ? "size-11 justify-center mx-auto"
                : "justify-between gap-3 px-3.5 py-2.5",
              active
                ? "bg-[#f3f0ff] font-semibold text-[#7c3aed]"
                : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900",
            )}
          >
            <div className={cn("flex items-center", !collapsed && "gap-3")}>
              <span
                className={cn(
                  "grid shrink-0 place-items-center rounded-lg transition-all duration-200",
                  collapsed ? "size-6" : "size-7",
                )}
              >
                <Icon
                  className={cn(
                    "size-[18px] shrink-0 transition-transform duration-200 group-hover:scale-105",
                    active ? "text-[#7c3aed]" : "text-slate-500 group-hover:text-slate-800"
                  )}
                />
              </span>
              {!collapsed && <span className="tracking-[-0.01em]">{item.label}</span>}
            </div>

            {!collapsed && item.dotBadge && (
              <span
                className="size-2 rounded-full bg-[#7c3aed]"
                aria-label="Nova mensagem"
              />
            )}

            {!collapsed && item.badge !== undefined && (
              <span
                className={cn(
                  "grid size-5 place-items-center rounded-full text-[10px] font-bold",
                  active
                    ? "bg-[#7c3aed] text-white"
                    : "bg-[#f3f0ff] text-[#7c3aed]"
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
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/80 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgba(0,0,0,0.06)] backdrop-blur-md lg:hidden"
    >
      <ul className="flex items-stretch justify-around">
        {items.map((item) => {
          const active = isActive(item.href)
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-1 whitespace-nowrap py-2 text-[11px] font-semibold transition-colors",
                  active ? "text-[#7c3aed] font-bold" : "text-slate-500 hover:text-slate-800",
                )}
              >
                <span
                  className={cn(
                    "relative grid place-items-center rounded-full transition-all duration-200",
                    active ? "size-9 bg-[#f3f0ff] text-[#7c3aed] scale-105 shadow-xs" : "size-9 text-slate-500",
                  )}
                >
                  <item.icon className={cn("transition-all duration-200", active ? "size-5 text-[#7c3aed]" : "size-[18px]")} />
                  {item.dotBadge && (
                    <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-[#7c3aed] ring-1 ring-white" />
                  )}
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

