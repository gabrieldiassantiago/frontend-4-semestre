"use client"

import { cn } from "@/lib/utils"

export type SegmentedOption<T extends string> = { value: T; label: string; count?: number }

/** Alternador compacto de opções (filtros, períodos, modos de visualização). */
export function SegmentedControl<T extends string>({
  label,
  value,
  onChange,
  options,
  className,
}: {
  label: string
  value: T
  onChange: (value: T) => void
  options: SegmentedOption<T>[]
  className?: string
}) {
  return (
    <div role="group" aria-label={label} className={cn("inline-flex max-w-full overflow-x-auto rounded-lg bg-muted p-1", className)}>
      {options.map((option) => {
        const selected = value === option.value
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              "inline-flex min-h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md px-3 text-xs font-semibold transition-colors",
              selected ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {option.label}
            {typeof option.count === "number" && (
              <span
                className={cn(
                  "rounded-full px-1.5 text-[11px] tabular-nums",
                  selected ? "bg-primary-subtle text-primary-subtle-foreground" : "bg-card/70 text-muted-foreground",
                )}
              >
                {option.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
