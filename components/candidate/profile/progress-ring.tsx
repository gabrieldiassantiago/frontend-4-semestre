import { cn } from "@/lib/utils"

export function ProgressRing({
  value,
  size = 64,
  stroke = 6,
  tone = "primary",
  label,
  className,
}: {
  value: number
  size?: number
  stroke?: number
  tone?: "primary" | "success"
  label: string
  className?: string
}) {
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (Math.min(100, Math.max(0, value)) / 100) * circumference

  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={cn("relative grid shrink-0 place-items-center", className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={stroke} className="stroke-muted" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn(
            "transition-[stroke-dashoffset] duration-700 ease-out motion-reduce:transition-none",
            tone === "success" ? "stroke-success" : "stroke-primary",
          )}
        />
      </svg>
      <span className="absolute text-sm font-bold tabular-nums text-foreground">{value}%</span>
    </div>
  )
}
