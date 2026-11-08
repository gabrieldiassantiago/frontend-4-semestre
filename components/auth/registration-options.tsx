import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

export function RegistrationOptions({ label, options, value, onChange }: {
  label: string
  options: readonly string[]
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div role="group" aria-label={label} className="grid grid-cols-2 gap-2">
      {options.map(option => (
        <button key={option} type="button" aria-pressed={value === option} onClick={() => onChange(option)}
          className={cn("flex min-h-12 items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left text-sm font-medium focus-visible:outline-primary",
            value === option ? "border-primary bg-primary-subtle text-primary-deep" : "border-border hover:border-primary-soft")}>
          {option}{value === option && <Check aria-hidden className="size-4 shrink-0" />}
        </button>
      ))}
    </div>
  )
}
