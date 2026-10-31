"use client"

import { useLayoutEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

/**
 * Orquestra as animações da landing via atributos de dados:
 *  data-hero="header|pill|title|text|search|card"  → timeline de entrada do hero
 *  data-depth="12"       → parallax do hero seguindo o ponteiro (amplitude em px)
 *  data-float="8"        → flutuação contínua (amplitude em px)
 *  data-split            → palavras ([data-word]) sobem em cascata ao entrar na viewport
 *  data-reveal           → fade + subida ao entrar na viewport
 *  data-stagger          → filhos diretos entram em cascata
 *  data-count="10" data-suffix="%" → contador animado
 *  data-bar              → barra cresce da esquerda
 *  data-typing="a|b|c"   → digita e apaga as palavras em loop
 *  data-clip             → imagem revelada de baixo para cima
 *  data-tilt             → inclinação 3D leve seguindo o ponteiro
 *  data-parallax="-8"    → deslocamento vertical durante o scroll
 * Com prefers-reduced-motion nada é animado e o conteúdo permanece visível.
 */
export function LandingMotion({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const scope = root.current!
    const mm = gsap.matchMedia()

    mm.add(
      { motion: "(prefers-reduced-motion: no-preference)", fine: "(hover: hover) and (pointer: fine)" },
      (ctx) => {
        const { motion, fine } = ctx.conditions as { motion: boolean; fine: boolean }
        if (!motion) return
        const all = <T extends HTMLElement = HTMLElement>(s: string) => gsap.utils.toArray<T>(s, scope)
        const cleanups: (() => void)[] = []

        const heroBars = all("[data-hero-stage] [data-bar]")
        const heroCounters = all("[data-hero-count]").map((el) => {
          const state = { n: 0 }
          const end = Number(el.dataset.heroCount)
          const suffix = el.dataset.suffix ?? ""
          el.textContent = `0${suffix}`
          return gsap.to(state, { n: end, duration: 1.6, ease: "power2.out", paused: true, onUpdate: () => { el.textContent = `${Math.round(state.n)}${suffix}` } })
        })
        gsap
          .timeline({ defaults: { ease: "power3.out" }, onComplete: () => fine && enablePointerDepth() })
          .from("[data-hero='header']", { y: -24, opacity: 0, duration: 0.6, clearProps: "transform" })
          .from("[data-hero='pill']", { y: 16, opacity: 0, scale: 0.96, duration: 0.5 }, "-=0.25")
          .from("[data-hero='title'] > span > span", { yPercent: 110, duration: 0.9, stagger: 0.12, ease: "power4.out" }, "-=0.3")
          .from("[data-hero='text']", { y: 16, opacity: 0, duration: 0.5 }, "-=0.5")
          .from("[data-hero='search']", { y: 24, opacity: 0, scale: 0.96, duration: 0.7 }, "-=0.35")
          .from("[data-hero='card']", { y: 90, opacity: 0, scale: 0.9, duration: 1, stagger: 0.1, ease: "back.out(1.4)" }, "-=0.45")
          .from(heroBars, { scaleX: 0, duration: 0.9, stagger: 0.1, ease: "power3.out" }, "-=0.6")
          .add(() => heroCounters.forEach((t) => t.play()), "<")

        function enablePointerDepth() {
          const stage = scope.querySelector<HTMLElement>("[data-hero-stage]")
          if (!stage) return
          const layers = gsap.utils.toArray<HTMLElement>("[data-depth]", stage).map((el) => ({
            depth: Number(el.dataset.depth) || 10,
            x: gsap.quickTo(el, "x", { duration: 0.8, ease: "power3.out" }),
            y: gsap.quickTo(el, "y", { duration: 0.8, ease: "power3.out" }),
          }))
          const onMove = (e: PointerEvent) => {
            const r = stage.getBoundingClientRect()
            const dx = (e.clientX - r.left) / r.width - 0.5
            const dy = (e.clientY - r.top) / r.height - 0.5
            layers.forEach((l) => { l.x(dx * l.depth * 2); l.y(dy * l.depth) })
          }
          const onLeave = () => layers.forEach((l) => { l.x(0); l.y(0) })
          stage.addEventListener("pointermove", onMove)
          stage.addEventListener("pointerleave", onLeave)
          cleanups.push(() => {
            stage.removeEventListener("pointermove", onMove)
            stage.removeEventListener("pointerleave", onLeave)
          })
        }

        all("[data-float]").forEach((el, i) => {
          gsap.to(el, {
            y: `+=${Number(el.dataset.float) || 8}`,
            duration: 2.4 + (i % 4) * 0.35,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
            delay: 1.8 + i * 0.15,
          })
        })

        all("[data-split]").forEach((el) => {
          gsap.from(el.querySelectorAll("[data-word]"), {
            yPercent: 115, rotate: 4, duration: 0.9, ease: "power4.out", stagger: 0.045,
            scrollTrigger: { trigger: el, start: "top 88%", once: true },
          })
        })

        all("[data-reveal]").forEach((el) => {
          gsap.from(el, {
            y: 36, opacity: 0, duration: 0.8, ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 90%", once: true },
          })
        })

        all("[data-stagger]").forEach((el) => {
          gsap.from(el.children, {
            y: 50, opacity: 0, duration: 0.8, ease: "power3.out", stagger: 0.09,
            scrollTrigger: { trigger: el, start: "top 86%", once: true },
          })
        })

        all("[data-count]").forEach((el) => {
          const end = Number(el.dataset.count)
          const suffix = el.dataset.suffix ?? ""
          const state = { n: 0 }
          el.textContent = `0${suffix}`
          gsap.to(state, {
            n: end, duration: 2, ease: "power2.out",
            onUpdate: () => { el.textContent = `${Math.round(state.n)}${suffix}` },
            scrollTrigger: { trigger: el, start: "top 92%", once: true },
          })
        })

        all("[data-bar]").filter((el) => !heroBars.includes(el)).forEach((el, i) => {
          gsap.from(el, {
            scaleX: 0, duration: 1, ease: "power3.out", delay: (i % 3) * 0.12,
            scrollTrigger: { trigger: el, start: "top 92%", once: true },
          })
        })

        all("[data-clip]").forEach((el) => {
          const img = el.querySelector("img")
          gsap.fromTo(el, { clipPath: "inset(18% 6% 0% 6% round 24px)" }, {
            clipPath: "inset(0% 0% 0% 0% round 24px)", duration: 1.2, ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 88%", once: true },
          })
          if (img) gsap.from(img, { scale: 1.25, duration: 1.6, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 88%", once: true } })
        })

        all("[data-typing]").forEach((el) => {
          const words = (el.dataset.typing ?? "").split("|").filter(Boolean)
          const tl = gsap.timeline({ repeat: -1, scrollTrigger: { trigger: el, start: "top 95%", toggleActions: "play pause resume pause" } })
          words.forEach((word) => {
            const s = { n: 0 }
            const write = () => { el.textContent = word.slice(0, Math.round(s.n)) }
            tl.to(s, { n: word.length, duration: word.length * 0.07, ease: "none", onUpdate: write })
              .to({}, { duration: 1.2 })
              .to(s, { n: 0, duration: word.length * 0.035, ease: "none", onUpdate: write })
              .to({}, { duration: 0.25 })
          })
        })
        all("[data-caret]").forEach((el) => gsap.to(el, { opacity: 0, duration: 0.5, repeat: -1, yoyo: true, ease: "steps(1)" }))

        all(".cta-peek").forEach((el, i) => {
          gsap.from(el, {
            y: 160, rotate: i === 0 ? -14 : 14, duration: 1.2, ease: "power3.out",
            scrollTrigger: { trigger: el.parentElement, start: "top 75%", once: true },
          })
        })
        all("[data-cta]").forEach((el) => {
          gsap.fromTo(el, { scale: 0.94, borderRadius: 64 }, {
            scale: 1, borderRadius: 32, ease: "none",
            scrollTrigger: { trigger: el, start: "top bottom", end: "top 40%", scrub: true },
          })
        })

        all("[data-parallax]").forEach((el) => {
          gsap.to(el, {
            yPercent: Number(el.dataset.parallax) || -8, ease: "none",
            scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true },
          })
        })

        if (fine) {
          all("[data-tilt]").forEach((el) => {
            const rx = gsap.quickTo(el, "rotationX", { duration: 0.5, ease: "power3.out" })
            const ry = gsap.quickTo(el, "rotationY", { duration: 0.5, ease: "power3.out" })
            gsap.set(el, { transformPerspective: 900 })
            const onMove = (e: PointerEvent) => {
              const r = el.getBoundingClientRect()
              ry(((e.clientX - r.left) / r.width - 0.5) * 6)
              rx(-((e.clientY - r.top) / r.height - 0.5) * 6)
            }
            const onLeave = () => { rx(0); ry(0) }
            el.addEventListener("pointermove", onMove)
            el.addEventListener("pointerleave", onLeave)
            cleanups.push(() => {
              el.removeEventListener("pointermove", onMove)
              el.removeEventListener("pointerleave", onLeave)
            })
          })
        }

        return () => cleanups.forEach((fn) => fn())
      },
      scope,
    )

    return () => mm.revert()
  }, [])

  return (
    <div ref={root} className="overflow-x-clip bg-background text-foreground">
      {children}
    </div>
  )
}
