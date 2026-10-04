import Link from "next/link"
import { isNavItemActive, type NavItem } from "@/lib/config/navigation"
import { cn } from "@/lib/utils"

/** Barra de navegação inferior, visível apenas abaixo de `lg`. */
export function MobileTabBar({ items, pathname }: { items: NavItem[]; pathname: string }) {
  return (
    <nav
      aria-label="Navegação rápida"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
    >
      <ul className="mx-auto flex max-w-lg items-stretch">
        {items.map((item) => {
          const active = isNavItemActive(pathname, item)
          const Icon = item.icon
          return (
            <li key={item.href} className="min-w-0 flex-1">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-16 flex-col items-center justify-center gap-1 px-1 text-[11px] transition-colors",
                  active ? "font-semibold text-primary" : "font-medium text-muted-foreground hover:text-foreground",
                )}
              >
                <span
                  className={cn(
                    "grid h-7 w-12 place-items-center rounded-full transition-colors",
                    active && "bg-primary-subtle",
                  )}
                >
                  <Icon aria-hidden className="size-[18px]" strokeWidth={active ? 2.1 : 1.75} />
                </span>
                <span className="max-w-full truncate">{item.shortLabel ?? item.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
