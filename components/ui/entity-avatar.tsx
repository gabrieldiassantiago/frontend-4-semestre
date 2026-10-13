"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { getInitials } from "@/lib/format"

/**
 * Avatar de empresas e pessoas. Mostra a foto quando `src` existe e carrega;
 * caso contrário, cai para as iniciais com cor determinística derivada do nome.
 */
const TONES = [
  "bg-primary-subtle text-primary-subtle-foreground",
  "bg-success-subtle text-success-foreground",
  "bg-info-subtle text-info",
  "bg-warning-subtle text-warning-foreground",
  "bg-muted text-strong-foreground",
] as const

const SIZES = {
  sm: "size-9 rounded-lg text-[11px]",
  md: "size-11 rounded-xl text-sm",
  lg: "size-14 rounded-2xl text-base",
} as const

export function EntityAvatar({
  name,
  src,
  size = "md",
  className,
}: {
  name?: string | null
  src?: string | null
  size?: keyof typeof SIZES
  className?: string
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const label = name?.trim() || "Empresa"
  const hash = Array.from(label).reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const showImage = Boolean(src) && failedSrc !== src

  if (showImage) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- fotos vêm de domínios arbitrários da API
      <img
        src={src!}
        alt=""
        aria-hidden
        loading="lazy"
        onError={() => setFailedSrc(src!)}
        className={cn("shrink-0 bg-muted object-cover", SIZES[size], className)}
      />
    )
  }

  return (
    <span
      aria-hidden
      className={cn(
        "grid shrink-0 place-items-center font-bold",
        SIZES[size],
        TONES[hash % TONES.length],
        className,
      )}
    >
      {getInitials(label, "?")}
    </span>
  )
}
