"use client"

import { useState } from "react"
import { getInitials } from "@/lib/format"
import { cn } from "@/lib/utils"

const SIZES = {
  xs: "size-6 rounded-md text-[10px]",
  sm: "size-9 rounded-lg text-xs",
  md: "size-11 rounded-xl text-sm",
  lg: "size-14 rounded-xl text-base",
  xl: "size-20 rounded-2xl text-xl",
} as const

const TONES = [
  "bg-primary-subtle text-primary-subtle-foreground",
  "bg-success-subtle text-success-foreground",
  "bg-info-subtle text-info",
  "bg-warning-subtle text-warning-foreground",
  "bg-muted text-strong-foreground",
] as const

export type CompanyLogoSize = keyof typeof SIZES

/**
 * Logotipo de empresa usado em todas as áreas (candidato, empresa e páginas públicas).
 * Mostra a imagem enviada pela empresa e, se ela não existir ou falhar,
 * um monograma com cor estável derivada do nome.
 */
export function CompanyLogo({
  url,
  name,
  size = "md",
  className,
}: {
  url?: string | null
  name?: string | null
  size?: CompanyLogoSize
  className?: string
}) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null)
  const label = name?.trim() || "Empresa"
  const showImage = Boolean(url) && failedUrl !== url

  if (showImage) {
    return (
      <span
        className={cn(
          "grid shrink-0 place-items-center overflow-hidden border border-border bg-card",
          SIZES[size],
          className,
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- logos vêm de domínios arbitrários da API */}
        <img
          src={url!}
          alt={`Logotipo de ${label}`}
          loading="lazy"
          className="size-full object-contain p-1"
          onError={() => setFailedUrl(url!)}
        />
      </span>
    )
  }

  const hash = Array.from(label).reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return (
    <span
      aria-hidden
      className={cn("grid shrink-0 place-items-center font-semibold", SIZES[size], TONES[hash % TONES.length], className)}
    >
      {getInitials(label, "?")}
    </span>
  )
}
