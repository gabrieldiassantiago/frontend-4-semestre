import React from "react"
import { cn } from "@/lib/utils"

interface CompanyBrandLogoProps {
  company: string
  variant?: "unisal-purple" | "unisal-navy" | "itau" | "accenture" | "google" | "netflix"
  className?: string
}

export function CompanyBrandLogo({ company, variant, className }: CompanyBrandLogoProps) {
  const norm = company.toLowerCase()

  // Google SVG logo
  if (variant === "google" || norm.includes("google")) {
    return (
      <div
        className={cn(
          "grid size-12 shrink-0 place-items-center rounded-2xl border border-slate-100 bg-white shadow-xs",
          className
        )}
      >
        <svg className="size-6" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
          />
          <path
            fill="#FBBC05"
            d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
          />
        </svg>
      </div>
    )
  }

  // Netflix logo
  if (variant === "netflix" || norm.includes("netflix")) {
    return (
      <div
        className={cn(
          "grid size-12 shrink-0 place-items-center rounded-2xl bg-[#e50914] text-white shadow-xs",
          className
        )}
      >
        <span className="font-black text-2xl tracking-tighter leading-none">N</span>
      </div>
    )
  }

  // Itaú logo
  if (variant === "itau" || norm.includes("itaú") || norm.includes("itau")) {
    return (
      <div
        className={cn(
          "grid size-12 shrink-0 place-items-center rounded-2xl bg-[#ff6600] text-white shadow-xs",
          className
        )}
      >
        <span className="font-bold text-sm tracking-tight leading-none">Itaú</span>
      </div>
    )
  }

  // Accenture logo
  if (variant === "accenture" || norm.includes("accenture")) {
    return (
      <div
        className={cn(
          "grid size-12 shrink-0 place-items-center rounded-2xl bg-[#008080] text-white shadow-xs",
          className
        )}
      >
        <span className="font-bold text-xl leading-none">S</span>
      </div>
    )
  }

  // UNISAL Navy (Tech Lead)
  if (variant === "unisal-navy") {
    return (
      <div
        className={cn(
          "grid size-12 shrink-0 place-items-center rounded-2xl bg-[#1e293b] text-white shadow-xs",
          className
        )}
      >
        <span className="font-bold text-2xl leading-none">A</span>
      </div>
    )
  }

  // UNISAL Purple
  if (variant === "unisal-purple" || norm.includes("unisal")) {
    return (
      <div
        className={cn(
          "grid size-12 shrink-0 place-items-center rounded-2xl bg-[#ede9fe] text-[#7c3aed] shadow-xs",
          className
        )}
      >
        <span className="font-bold text-2xl leading-none">U</span>
      </div>
    )
  }

  // Fallback default
  return (
    <div
      className={cn(
        "grid size-12 shrink-0 place-items-center rounded-2xl bg-[#ede9fe] text-[#7c3aed] shadow-xs font-bold text-lg",
        className
      )}
    >
      {company.charAt(0).toUpperCase()}
    </div>
  )
}
