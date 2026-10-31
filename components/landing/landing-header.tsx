"use client"

import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import Image from "next/image"
import Link from "next/link"
import { gsap } from "gsap"
import { ArrowRight, Menu, X } from "lucide-react"

import { SelectaLogo } from "@/components/ui/selecta-logo"
import { AuthMenu, profileHref } from "./auth-menu"
import { AUTH_PROFILES, NAV_LINKS } from "@/lib/data/landing"
import { ROUTES } from "@/lib/config/routes"
import { cn } from "@/lib/utils"

export function LandingHeader() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const panel = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useLayoutEffect(() => {
    if (!open || !panel.current) return
    document.body.style.overflow = "hidden"
    const ctx = gsap.context(() => {
      gsap.from(panel.current, { opacity: 0, y: -12, duration: 0.3, ease: "power2.out" })
      gsap.from("[data-mobile-item]", { y: 14, opacity: 0, duration: 0.35, stagger: 0.05, delay: 0.08, ease: "power2.out" })
    }, panel)
    return () => {
      document.body.style.overflow = ""
      ctx.revert()
    }
  }, [open])

  return (
    <header
      data-hero="header"
      className={cn(
        "sticky top-0 z-40 transition-[background-color,box-shadow,backdrop-filter] duration-300",
        scrolled && !open ? "bg-background/80 shadow-[0_1px_0_var(--border)] backdrop-blur-xl" : "bg-background",
      )}
    >
      <div className="mx-auto flex h-[72px] max-w-[1400px] items-center justify-between px-5 sm:px-8 lg:h-[88px] lg:px-12">
        <Link href={ROUTES.home} aria-label="Selecta, página inicial" className="shrink-0">
          <SelectaLogo className="h-8 lg:h-9" />
        </Link>

        <nav aria-label="Principal" className="hidden items-center gap-10 lg:flex">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} className="group relative py-1 text-[15px] text-strong-foreground transition-colors hover:text-foreground">
              {l.label}
              <span className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-primary transition-transform duration-300 group-hover:scale-x-100" aria-hidden />
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <AuthMenu intent="login" />
          <AuthMenu intent="signup" />
        </div>

        <button
          type="button"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
          aria-controls="landing-mobile-menu"
          onClick={() => setOpen((v) => !v)}
          className="grid size-11 place-items-center rounded-full border border-border bg-background lg:hidden"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && createPortal(
        <div
          ref={panel}
          id="landing-mobile-menu"
          className="fixed inset-x-0 bottom-0 top-[72px] z-[39] overflow-y-auto overscroll-contain border-t border-border-subtle bg-background px-5 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-2 lg:hidden"
        >
          <nav aria-label="Principal (mobile)" className="flex flex-col">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                data-mobile-item
                href={l.href}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between border-b border-border-subtle py-4 text-lg font-medium"
              >
                {l.label}
                <ArrowRight className="size-4 text-subtle-foreground" aria-hidden />
              </a>
            ))}
          </nav>

          <MobileAuthGroup title="Entrar como" intent="login" onNavigate={() => setOpen(false)} />
          <MobileAuthGroup title="Criar conta como" intent="signup" onNavigate={() => setOpen(false)} />
        </div>,
        document.body,
      )}
    </header>
  )
}

function MobileAuthGroup({ title, intent, onNavigate }: { title: string; intent: "login" | "signup"; onNavigate: () => void }) {
  return (
    <div data-mobile-item className="mt-7">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{title}</p>
      <div className="grid grid-cols-2 gap-3">
        {AUTH_PROFILES.map((p) => (
          <Link
            key={p.id}
            href={profileHref(p.href, intent)}
            onClick={onNavigate}
            className={cn(
              "flex flex-col items-start gap-3 rounded-2xl border p-4 transition-colors",
              intent === "signup" ? "border-primary/20 bg-primary-subtle hover:border-primary/40" : "border-border bg-muted hover:border-border-strong",
            )}
          >
            <span className="relative size-10 overflow-hidden rounded-xl bg-background">
              <Image src={p.icon} alt="" fill sizes="40px" className="object-cover" />
            </span>
            <span className="text-sm font-semibold">{p.id === "candidato" ? "Candidato" : "Empresa"}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
