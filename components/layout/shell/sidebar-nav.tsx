"use client"

import { useId } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { isNavItemActive, type NavGroup, type NavItem } from "@/lib/config/navigation"
import { cn } from "@/lib/utils"

/** Contadores opcionais exibidos ao lado dos itens, indexados pelo `href`. */
export type NavBadges = Partial<Record<string, number>>

function formatBadge(value: number) {
  return value > 99 ? "99+" : String(value)
}

export function SidebarNavLink({
  item,
  pathname,
  collapsed = false,
  badge,
  onNavigate,
  layoutId,
}: {
  item: NavItem
  pathname: string
  collapsed?: boolean
  badge?: number
  onNavigate?: () => void
  /** Quando informado, o destaque do item ativo desliza entre os itens. */
  layoutId?: string
}) {
  const active = isNavItemActive(pathname, item)
  const Icon = item.icon
  const hasBadge = typeof badge === "number" && badge > 0

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      title={collapsed ? item.label : undefined}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex min-h-10 items-center gap-3 rounded-lg text-sm transition-colors",
        collapsed ? "mx-auto size-10 justify-center" : "px-3",
        active
          ? cn("font-semibold text-primary-subtle-foreground", !layoutId && "bg-primary-subtle")
          : "font-medium text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      {active && layoutId && (
        <motion.span
          layoutId={layoutId}
          aria-hidden
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
          className="absolute inset-0 rounded-lg bg-primary-subtle"
        >
          {!collapsed && (
            <span className="absolute -left-3 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-primary" />
          )}
        </motion.span>
      )}
      <span className="relative shrink-0 transition-transform duration-200 group-hover:scale-110">
        <Icon
          aria-hidden
          strokeWidth={active ? 2 : 1.75}
          className={cn("size-[18px]", active ? "text-primary" : "text-subtle-foreground group-hover:text-foreground")}
        />
        {collapsed && hasBadge && (
          <span aria-hidden className="absolute -right-1 -top-1 size-2 rounded-full bg-primary ring-2 ring-card" />
        )}
      </span>
      {collapsed ? (
        <span className="sr-only">
          {item.label}
          {hasBadge && ` (${badge})`}
        </span>
      ) : (
        <>
          <span className="relative min-w-0 flex-1 truncate transition-transform duration-200 group-hover:translate-x-0.5">{item.label}</span>
          {hasBadge && (
            <span
              className={cn(
                "grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[11px] font-semibold tabular-nums",
                active ? "bg-primary text-primary-foreground" : "bg-muted text-strong-foreground group-hover:bg-card",
              )}
            >
              {formatBadge(badge)}
            </span>
          )}
        </>
      )}
    </Link>
  )
}

export function SidebarNav({
  groups,
  pathname,
  collapsed = false,
  badges,
  onNavigate,
  label = "Navegação principal",
}: {
  groups: NavGroup[]
  pathname: string
  collapsed?: boolean
  badges?: NavBadges
  onNavigate?: () => void
  label?: string
}) {
  const layoutId = `nav-active-${useId()}`

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
            <SidebarNavLink
              key={item.href}
              item={item}
              pathname={pathname}
              collapsed={collapsed}
              badge={badges?.[item.href]}
              onNavigate={onNavigate}
              layoutId={layoutId}
            />
          ))}
        </div>
      ))}
    </nav>
  )
}
