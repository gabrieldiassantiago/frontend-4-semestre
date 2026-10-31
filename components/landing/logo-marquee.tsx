"use client"

import { useLayoutEffect, useRef } from "react"
import { gsap } from "gsap"
import { Atom, Clover, Hexagon, Orbit, Shield, Zap, type LucideIcon } from "lucide-react"

import { TRUSTED_COMPANIES } from "@/lib/data/landing"

const ICONS: LucideIcon[] = [Hexagon, Clover, Atom, Zap, Shield, Orbit]

export function LogoMarquee() {
  const track = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const el = track.current
    if (!el) return
    const mm = gsap.matchMedia()
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const tween = gsap.to(el, { xPercent: -50, duration: 28, ease: "none", repeat: -1 })
      const slow = () => gsap.to(tween, { timeScale: 0.25, duration: 0.6 })
      const resume = () => gsap.to(tween, { timeScale: 1, duration: 0.6 })
      el.addEventListener("mouseenter", slow)
      el.addEventListener("mouseleave", resume)
      return () => {
        el.removeEventListener("mouseenter", slow)
        el.removeEventListener("mouseleave", resume)
      }
    })
    return () => mm.revert()
  }, [])

  const items = [...TRUSTED_COMPANIES, ...TRUSTED_COMPANIES]

  return (
    <div className="relative mt-8 overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]">
      <div ref={track} className="flex w-max items-center">
        {items.map((name, i) => {
          const Icon = ICONS[i % ICONS.length]
          return (
            <span
              key={`${name}-${i}`}
              aria-hidden={i >= TRUSTED_COMPANIES.length}
              className="flex shrink-0 items-center gap-2.5 px-8 text-2xl font-semibold tracking-tight text-zinc-400 transition-colors hover:text-zinc-600 sm:px-12"
            >
              <Icon className="size-7" strokeWidth={2.4} aria-hidden />
              {name}
            </span>
          )
        })}
      </div>
    </div>
  )
}
