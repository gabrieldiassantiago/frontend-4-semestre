"use client"

import { useState } from "react"
import { Building2 } from "lucide-react"
import { cn } from "@/lib/utils"

export function CompanyLogo({ url, name = "Empresa", className }: { url?: string | null; name?: string; className?: string }) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null)
  return (
    <span className={cn("grid size-10 shrink-0 place-items-center overflow-hidden rounded-lg border border-border bg-white text-muted-foreground", className)}>
      {url && failedUrl !== url ? <img src={url} alt={"Logotipo de " + name} className="size-full object-contain p-1" onError={() => setFailedUrl(url)} /> : <Building2 className="size-5" strokeWidth={1.5} aria-hidden />}
    </span>
  )
}
