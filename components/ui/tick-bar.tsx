import { cn } from "@/lib/utils"

/**
 * Barra de progresso em traços verticais (decorativa).
 * O valor textual deve ser exibido ao lado por quem usa o componente.
 */
export function TickBar({
  value,
  ticks = 24,
  className,
  filledClassName = "bg-primary",
  trackClassName = "bg-border",
}: {
  /** Percentual de 0 a 100. */
  value: number
  ticks?: number
  className?: string
  filledClassName?: string
  trackClassName?: string
}) {
  const clamped = Math.max(0, Math.min(100, value))
  const filled = Math.round((clamped / 100) * ticks)

  return (
    <div aria-hidden className={cn("flex h-6 items-stretch gap-[3px]", className)}>
      {Array.from({ length: ticks }, (_, index) => (
        <span key={index} className={cn("flex-1 rounded-full", index < filled ? filledClassName : trackClassName)} />
      ))}
    </div>
  )
}
