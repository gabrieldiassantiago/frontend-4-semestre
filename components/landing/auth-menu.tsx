"use client"

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { gsap } from "gsap"
import { ArrowRight, ChevronDown } from "lucide-react"

import { AUTH_PROFILES } from "@/lib/data/landing"
import { ROUTES } from "@/lib/config/routes"
import { cn } from "@/lib/utils"

type Intent = "login" | "signup"

const COPY: Record<Intent, { trigger: string; title: string }> = {
  login: { trigger: "Entrar", title: "Como você quer entrar?" },
  signup: { trigger: "Criar uma conta", title: "Criar conta como" },
}

export function profileHref(href: string, intent: Intent) {
  return intent === "signup" ? `${href}?modo=cadastro` : href
}

/** Botão do header que abre a escolha de perfil (candidato ou empresa). */
export function AuthMenu({ intent, className }: { intent: Intent; className?: string }) {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const panel = useRef<HTMLDivElement>(null)
  const chevron = useRef<SVGSVGElement>(null)
  const menuId = useId()

  useLayoutEffect(() => {
    if (!panel.current) return
    const ctx = gsap.context(() => {
      if (open) {
        gsap.set(panel.current, { display: "block" })
        gsap.fromTo(panel.current, { opacity: 0, y: -8, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.32, ease: "power3.out" })
        gsap.fromTo("[data-auth-item]", { opacity: 0, x: -10 }, { opacity: 1, x: 0, duration: 0.3, stagger: 0.06, delay: 0.06, ease: "power2.out" })
      } else {
        gsap.to(panel.current, { opacity: 0, y: -6, scale: 0.97, duration: 0.18, ease: "power2.in", onComplete: () => { gsap.set(panel.current, { display: "none" }) } })
      }
      gsap.to(chevron.current, { rotate: open ? 180 : 0, duration: 0.3, ease: "power2.out" })
    }, root)
    return () => ctx.kill()
  }, [open])

  useEffect(() => {
    if (!open) return
    const onPointer = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("pointerdown", onPointer)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("pointerdown", onPointer)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  const copy = COPY[intent]

  return (
    <div ref={root} className={cn("relative", className)}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex h-11 items-center gap-1.5 rounded-full px-5 text-sm font-medium transition-colors",
          intent === "login"
            ? "border border-border bg-muted text-foreground hover:bg-border-subtle"
            : "bg-primary text-primary-foreground shadow-[0_8px_20px_-8px_rgba(124,58,237,0.7)] hover:bg-primary-hover",
        )}
      >
        {copy.trigger}
        <ChevronDown ref={chevron} className="size-4 opacity-70" aria-hidden />
      </button>

      <div
        ref={panel}
        id={menuId}
        role="menu"
        aria-label={copy.title}
        style={{ display: "none" }}
        className="absolute right-0 top-[calc(100%+10px)] z-50 w-[300px] origin-top-right rounded-2xl border border-border bg-background p-2 shadow-overlay"
      >
        <p className="px-3 pb-2 pt-2 text-xs font-medium text-muted-foreground">{copy.title}</p>
        {AUTH_PROFILES.map((p) => (
          <Link
            key={p.id}
            data-auth-item
            role="menuitem"
            href={profileHref(p.href, intent)}
            onClick={() => setOpen(false)}
            className="group flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-primary-subtle focus-visible:bg-primary-subtle"
          >
            <span className="relative size-11 shrink-0 overflow-hidden rounded-xl bg-muted">
              <Image src={p.icon} alt="" fill sizes="88px" className="scale-[1.45] object-cover" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-foreground">{p.label}</span>
              <span className="block text-xs text-muted-foreground">{p.description}</span>
            </span>
            <ArrowRight className="size-4 -translate-x-1 text-primary opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" aria-hidden />
          </Link>
        ))}
        {intent === "login" && (
          <p data-auth-item className="mt-1 border-t border-border-subtle px-3 pb-1 pt-3 text-xs text-muted-foreground">
            Faz parte de um time?{" "}
            <Link href={ROUTES.auth.recruiter} onClick={() => setOpen(false)} className="font-medium text-primary hover:underline">
              Entrar como recrutador
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}
