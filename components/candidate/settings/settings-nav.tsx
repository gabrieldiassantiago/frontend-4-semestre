"use client"

import { useEffect, useRef, useState } from "react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export interface SettingsNavSection {
  id: string
  label: string
  icon: LucideIcon
  danger?: boolean
}
export function SettingsNav({ sections }: { sections: readonly SettingsNavSection[] }) {
  const [activeId, setActiveId] = useState(sections[0]?.id)
  const listRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    const elements = sections
      .map((section) => document.getElementById(section.id))
      .filter((el): el is HTMLElement => Boolean(el))
    if (elements.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActiveId(visible[0].target.id)
      },
      { rootMargin: "-140px 0px -55% 0px", threshold: 0 },
    )

    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [sections])

  useEffect(() => {
    const list = listRef.current
    const item = list?.querySelector<HTMLElement>(`[data-section="${activeId}"]`)
    if (!list || !item || list.scrollWidth <= list.clientWidth) return
    list.scrollTo({ left: item.offsetLeft - 16, behavior: "smooth" })
  }, [activeId])

  return (
    <nav
      aria-label="Seções das configurações"
      className="sticky top-[var(--topbar-offset,76px)] z-10 -mx-4 transition-[top] duration-300 ease-out border-b border-border-subtle bg-background/90 px-4 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/75 sm:-mx-6 sm:px-6 lg:top-[calc(var(--topbar-offset,76px)+20px)] lg:mx-0 lg:self-start lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none"
    >
      <ul
        ref={listRef}
        className="flex gap-1.5 overflow-x-auto no-scrollbar lg:flex-col lg:gap-0.5 lg:overflow-visible lg:rounded-card lg:border lg:border-border lg:bg-card lg:p-2"
      >
        {sections.map((section) => {
          const current = section.id === activeId
          return (
            <li
              key={section.id}
              data-section={section.id}
              className={cn("shrink-0", section.danger && "lg:mt-1.5 lg:border-t lg:border-border-subtle lg:pt-1.5")}
            >
              <a
                href={`#${section.id}`}
                onClick={() => setActiveId(section.id)}
                aria-current={current ? "location" : undefined}
                className={cn(
                  "flex h-9 items-center gap-2 whitespace-nowrap rounded-full px-3.5 text-sm font-medium transition-colors lg:h-10 lg:w-full lg:rounded-lg lg:px-3",
                  current
                    ? section.danger
                      ? "bg-danger-subtle text-danger-foreground"
                      : "bg-primary-subtle text-primary-subtle-foreground"
                    : section.danger
                      ? "text-danger-foreground hover:bg-danger-subtle"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <section.icon aria-hidden className="size-4 shrink-0" />
                {section.label}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
