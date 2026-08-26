"use client"

import { useState } from "react"
import { Check, Link2, Share2 } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Compartilha o link público da vaga.
 * Usa o compartilhamento nativo quando disponível (mobile) e cai para
 * "copiar link" no desktop, com confirmação visual.
 */
export function ShareVagaButton({
  path,
  title,
  variant = "outline",
  className,
}: {
  /** Caminho relativo da vaga, ex: /vaga/123 */
  path: string
  title: string
  variant?: "outline" | "icon"
  className?: string
}) {
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    const url = new URL(path, window.location.origin).toString()

    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, url })
        return
      } catch (error) {
        // Usuário cancelou o menu nativo: não faz sentido copiar em seguida.
        if (error instanceof Error && error.name === "AbortError") return
      }
    }

    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt("Copie o link da vaga:", url)
    }
  }

  const label = copied ? "Link copiado" : "Compartilhar vaga"

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={handleShare}
        title={label}
        aria-label={label}
        className={cn(
          "grid size-9 shrink-0 place-items-center rounded-full border border-border text-strong-foreground transition-colors hover:bg-muted hover:text-foreground",
          copied && "border-success-border bg-success-subtle text-success-foreground",
          className,
        )}
      >
        {copied ? <Check className="size-4" /> : <Share2 className="size-4" />}
      </button>
    )
  }

  return (
    <button type="button" onClick={handleShare} className={cn("btn-secondary", className)}>
      {copied ? (
        <>
          <Check className="size-4 text-success" aria-hidden />
          Link copiado
        </>
      ) : (
        <>
          <Link2 className="size-4" aria-hidden />
          Compartilhar
        </>
      )}
      <span className="sr-only" aria-live="polite">
        {copied ? "Link copiado para a área de transferência" : ""}
      </span>
    </button>
  )
}
