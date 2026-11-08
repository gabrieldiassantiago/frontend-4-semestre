import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

export function RegistrationProgress({ step, company }: { step: number; company: boolean }) {
  const labels = company ? ["Responsável", "Empresa", "Localização"] : ["Interesses", "Localização", "Conta"]
  return (
      <ol className="mb-5 grid w-full grid-cols-3 gap-2 sm:gap-3" aria-label="Etapas do cadastro">
        {labels.map((label, index) => {
          const number = index + 1
          const completed = number < step
          const active = number === step
          return (
            <li aria-current={active ? "step" : undefined} key={number} className="space-y-2">
              <div
                className={cn(
                  "h-1.5 rounded-full transition-colors duration-300",
                  number <= step ? "bg-primary" : "bg-border",
                )}
              />
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold transition-colors sm:h-7 sm:w-7",
                    active && "border-primary bg-primary-subtle text-primary-subtle-foreground",
                    completed && "border-success bg-success text-white",
                    !active && !completed && "border-border text-subtle-foreground",
                  )}
                >
                  {completed ? <Check className="h-3.5 w-3.5" /> : number}
                </span>
                <span
                  className={cn(
                    "truncate text-[11px] font-semibold sm:text-xs",
                    active ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {label}
                </span>
              </div>
            </li>
          )
        })}
      </ol>
  )
}
