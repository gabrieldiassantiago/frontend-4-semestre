import React from "react"
import { cn } from "@/lib/utils"

interface ApplicantFacepileProps {
  count?: number
  timeText?: string
  className?: string
}

export function ApplicantFacepile({
  count = 0,
  timeText = "há 6 dias",
  className,
}: ApplicantFacepileProps) {
  return (
    <div className={cn("flex items-center gap-2 text-xs text-slate-400", className)}>
      <div className="flex items-center -space-x-1.5">
        {/* Avatar 1 */}
        <div className="relative size-6 overflow-hidden rounded-full border-2 border-white bg-slate-200 ring-1 ring-slate-100">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop&crop=faces"
            alt="Candidato"
            className="size-full object-cover"
          />
        </div>
        {/* Avatar 2 */}
        <div className="relative size-6 overflow-hidden rounded-full border-2 border-white bg-slate-300 ring-1 ring-slate-100">
          <img
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=faces"
            alt="Candidato"
            className="size-full object-cover"
          />
        </div>
      </div>

      {count > 0 && (
        <span className="text-[11px] font-semibold text-slate-500">
          +{count}
        </span>
      )}

      {timeText && (
        <span className="text-[11px] text-slate-400 font-medium">
          {timeText}
        </span>
      )}
    </div>
  )
}
