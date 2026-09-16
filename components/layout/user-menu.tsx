"use client"

import Link from "next/link"
import { ChevronDown, ChevronUp, LogOut } from "lucide-react"
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
  side?: "top" | "bottom"
  align?: "left" | "right"
  avatarOnly?: boolean
}

export function UserMenu({
  name,
  secondary,
  avatar,
  links,
  onLogout,
  collapsed = false,
  side = "bottom",
  align = "right",
  avatarOnly = false,
}: UserMenuProps) {
  const { ref, open, toggle, close } = useDismissable()

  const isBottom = side === "bottom"

  return (
    <div ref={ref} className="relative">
      {/* Botão de Trigger */}
      {avatarOnly ? (
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          aria-haspopup="menu"
          className="relative grid size-10 place-items-center rounded-full transition-transform duration-200 hover:scale-105 active:scale-95"
        >
          <div className="relative shrink-0">
            {avatar}
            <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-white bg-emerald-500" />
          </div>
        </button>
      ) : (
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          aria-haspopup="menu"
          className={cn(
            "group relative flex w-full items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-2 text-left shadow-xs transition-all duration-200 ease-out hover:border-slate-300 hover:shadow-sm active:scale-[0.98]",
            collapsed && "justify-center border-none bg-transparent p-0 hover:bg-transparent hover:shadow-none"
          )}
        >
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative shrink-0">
              {avatar}
              <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-white bg-emerald-500" />
            </div>

            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-slate-800 transition-colors group-hover:text-[#7c3aed]">
                  {name}
                </p>
                {secondary && (
                  <p className="truncate text-[11px] font-medium text-slate-400">
                    {secondary}
                  </p>
                )}
              </div>
            )}
          </div>

          {!collapsed && (
            <ChevronDown
              className={cn(
                "size-4 shrink-0 text-slate-400 transition-transform duration-200 ease-out group-hover:text-slate-700",
                open && "rotate-180"
              )}
            />
          )}
        </button>
      )}

      {/* Popover Card */}
      <div
        role="menu"
        className={cn(
          "absolute z-50 overflow-hidden rounded-3xl border border-slate-200 bg-white/95 p-1.5 backdrop-blur-xl transition-all duration-200 ease-out shadow-2xl",
          open
            ? "pointer-events-auto opacity-100 scale-100"
            : "pointer-events-none opacity-0 scale-95",
          // Posição para baixo no cabeçalho ou para cima se side="top"
          isBottom
            ? align === "right"
              ? "top-full right-0 mt-2 min-w-[240px] origin-top-right"
              : "top-full left-0 mt-2 min-w-[240px] origin-top-left"
            : collapsed
              ? "left-full bottom-0 ml-3 min-w-[230px] origin-bottom-left"
              : "bottom-full left-0 mb-3 w-full min-w-[240px] origin-bottom-left"
        )}
      >
        {/* Cabeçalho do Usuário */}
        <div className="relative overflow-hidden rounded-2xl bg-slate-50 p-3">
          <div className="flex items-center gap-3">
            {avatar}
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-slate-900">{name}</p>
              {secondary && (
                <p className="truncate text-[11px] font-medium text-slate-500">
                  {secondary}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="my-1.5 h-px bg-slate-100" />

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
                className="group flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 transition-all duration-200 hover:bg-[#f3f0ff] hover:text-[#7c3aed] active:scale-[0.98]"
              >
                <div className="grid size-7 place-items-center rounded-lg bg-slate-100 text-slate-500 transition-colors group-hover:bg-[#ede9fe] group-hover:text-[#7c3aed]">
                  <Icon className="size-3.5 transition-transform duration-200 group-hover:scale-110" />
                </div>
                {link.label}
              </Link>
            )
          })}
        </div>

        <div className="my-1.5 h-px bg-slate-100" />

        {/* Ação de Sair */}
        <button
          type="button"
          role="menuitem"
          onClick={() => {
            close()
            onLogout()
          }}
          className="group flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 transition-all duration-200 hover:bg-rose-50 active:scale-[0.98]"
        >
          <div className="grid size-7 place-items-center rounded-lg bg-rose-50 text-rose-500 transition-colors group-hover:bg-rose-100 group-hover:text-rose-600">
            <LogOut className="size-3.5 transition-transform duration-200 group-hover:scale-110" />
          </div>
          Sair da conta
        </button>
      </div>
    </div>
  )
}