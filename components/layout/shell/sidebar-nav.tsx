"use client"

import { useId } from "react"
import { motion, useReducedMotion } from "framer-motion"
import Link from "next/link"
import { isNavItemActive, type NavGroup, type NavItem } from "@/lib/config/navigation"
import { cn } from "@/lib/utils"

/** Contadores opcionais exibidos ao lado dos itens, indexados pelo `href`. */
export type NavBadges = Partial<Record<string, number>>

function formatBadge(value: number) {
  return value > 99 ? "99+" : String(value)
}

/** Mantido por compatibilidade: as duas áreas usam o mesmo desenho de menu. */
export type SidebarVariant = "default" | "modern"

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
  variant?: SidebarVariant
}) {
  const active = isNavItemActive(pathname, item)
  const reduceMotion = useReducedMotion()
  const Icon = item.icon
  const hasBadge = typeof badge === "number" && badge > 0

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      title={collapsed ? item.label : undefined}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex items-center rounded-full text-sm transition-colors duration-200 active:scale-[0.98] motion-reduce:active:scale-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        collapsed ? "mx-auto size-11 justify-center" : "min-h-11 gap-2.5 py-1 pl-1 pr-3",
        active
          ? cn("font-semibold text-primary-foreground", !layoutId && "bg-primary")
          : "font-medium text-strong-foreground hover:bg-primary-subtle hover:text-primary",
      )}
    >
      {active && layoutId && (
        <motion.span
          layoutId={layoutId}
          aria-hidden
          transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 480, damping: 38 }}
          className="absolute inset-0 rounded-full bg-primary"
        />
      )}

      {/* Ícone em círculo: branco no item ativo, contorno nos demais. */}
      <span
        className={cn(
          "relative grid size-9 shrink-0 place-items-center rounded-full transition-colors duration-200",
          active
            ? collapsed
              ? "text-primary-foreground"
              : "bg-white text-primary"
            : "text-muted-foreground group-hover:text-primary",
        )}
      >
        <Icon aria-hidden strokeWidth={active ? 2 : 1.75} className="size-[18px]" />
        {collapsed && hasBadge && (
          <span aria-hidden className="absolute right-0.5 top-0.5 size-2.5 rounded-full bg-mint ring-2 ring-card" />
        )}
      </span>

      {collapsed ? (
        <span className="sr-only">
          {item.label}
          {hasBadge && ` (${badge})`}
        </span>
      ) : (
        <>
          <span className="relative min-w-0 flex-1 truncate">{item.label}</span>
          {item.tag && !active && !hasBadge && (
            <span className="relative rounded-full bg-mint-subtle px-2 py-0.5 text-[10px] font-semibold text-mint-strong">
              {item.tag}
            </span>
          )}
          {hasBadge && (
            <span
              className={cn(
                "relative grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[11px] font-bold tabular-nums",
                active ? "bg-white text-primary" : "bg-primary-subtle text-primary",
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
  variant?: SidebarVariant
}) {
  const layoutId = `nav-active-${useId()}`

  return (
    <nav aria-label={label} className="flex flex-col gap-5">
      {groups.map((group, index) => (
        <div key={group.label ?? index} className="flex flex-col gap-1">
          {group.label &&
            (collapsed ? (
              index > 0 && <div aria-hidden className="mx-auto mb-1 h-px w-6 bg-border" />
            ) : (
              <p className="px-4 pb-1.5 text-xs text-muted-foreground">{group.label}</p>
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
