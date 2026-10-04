import Link from "next/link"
import { isNavItemActive, type NavGroup, type NavItem } from "@/lib/config/navigation"
import { cn } from "@/lib/utils"

export function SidebarNavLink({
  item,
  pathname,
  collapsed = false,
  onNavigate,
}: {
  item: NavItem
  pathname: string
  collapsed?: boolean
  onNavigate?: () => void
}) {
  const active = isNavItemActive(pathname, item)
  const Icon = item.icon

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      title={collapsed ? item.label : undefined}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group flex min-h-10 items-center gap-3 rounded-lg text-sm transition-colors",
        collapsed ? "mx-auto size-10 justify-center" : "px-3",
        active
          ? "bg-primary-subtle font-semibold text-primary-subtle-foreground"
          : "font-medium text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      <Icon
        aria-hidden
        strokeWidth={active ? 2 : 1.75}
        className={cn("size-[18px] shrink-0", active ? "text-primary" : "text-subtle-foreground group-hover:text-foreground")}
      />
      {collapsed ? <span className="sr-only">{item.label}</span> : <span className="truncate">{item.label}</span>}
    </Link>
  )
}

export function SidebarNav({
  groups,
  pathname,
  collapsed = false,
  onNavigate,
  label = "Navegação principal",
}: {
  groups: NavGroup[]
  pathname: string
  collapsed?: boolean
  onNavigate?: () => void
  label?: string
}) {
  return (
    <nav aria-label={label} className="flex flex-col gap-5">
      {groups.map((group, index) => (
        <div key={group.label ?? index} className="flex flex-col gap-1">
          {group.label &&
            (collapsed ? (
              index > 0 && <div aria-hidden className="mx-3 mb-1 h-px bg-border" />
            ) : (
              <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-subtle-foreground">
                {group.label}
              </p>
            ))}
          {group.items.map((item) => (
            <SidebarNavLink key={item.href} item={item} pathname={pathname} collapsed={collapsed} onNavigate={onNavigate} />
          ))}
        </div>
      ))}
    </nav>
  )
}
