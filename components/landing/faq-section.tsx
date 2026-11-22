"use client"

import { useId, useRef, useState } from "react"
import { gsap } from "gsap"
import { ChevronDown } from "lucide-react"

import { FAQ } from "@/lib/data/landing"
import { cn } from "@/lib/utils"

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0)
  const panels = useRef<(HTMLDivElement | null)[]>([])
  const icons = useRef<(HTMLSpanElement | null)[]>([])
  const baseId = useId()

  function toggle(i: number) {
    const next = open === i ? null : i
    FAQ.forEach((_, idx) => {
      const isOpen = idx === next
      gsap.to(panels.current[idx], { height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0, duration: 0.45, ease: "power3.inOut" })
      gsap.to(icons.current[idx], { rotate: isOpen ? 180 : 0, duration: 0.35, ease: "power2.out" })
    })
    setOpen(next)
  }

  return (
    <section id="faq" aria-labelledby="faq-title" className="mx-auto grid max-w-[1400px] scroll-mt-24 gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[1fr_1.35fr] lg:gap-16 lg:px-12 lg:py-24">
      <div data-reveal className="lg:sticky lg:top-32 lg:self-start">
        <h2 id="faq-title" className="text-[34px] font-normal leading-[1.1] tracking-[-0.03em] sm:text-5xl lg:text-[56px]">
          Perguntas<br />frequentes
        </h2>
        <p className="mt-5 text-base text-muted-foreground sm:text-lg">Ficou com alguma dúvida? Fale com a nossa equipe!</p>
        <a href="#contato" data-magnetic className="mt-8 inline-flex h-12 items-center rounded-full bg-primary px-7 text-[15px] font-medium text-white transition-colors hover:bg-primary-hover">
          Falar com a equipe
        </a>
      </div>

      <div data-stagger className="space-y-4">
        {FAQ.map((f, i) => {
          const isOpen = open === i
          return (
            <div key={f.q} className={cn("rounded-3xl border transition-colors duration-300", isOpen ? "border-transparent bg-primary-subtle" : "border-border/60 bg-background hover:border-primary/40")}>
              <h3>
                <button
                  type="button"
                  id={`${baseId}-q${i}`}
                  aria-expanded={isOpen}
                  aria-controls={`${baseId}-a${i}`}
                  onClick={() => toggle(i)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-6 text-left text-lg font-normal sm:text-[22px]"
                >
                  {f.q}
                  <span ref={(el) => { icons.current[i] = el }} className={cn("grid size-10 shrink-0 place-items-center rounded-full border transition-colors duration-300", isOpen ? "border-primary bg-primary text-white" : "border-border text-strong-foreground")} style={{ transform: isOpen ? "rotate(180deg)" : undefined }}>
                    <ChevronDown className="size-5" aria-hidden />
                  </span>
                </button>
              </h3>
              <div
                ref={(el) => { panels.current[i] = el }}
                id={`${baseId}-a${i}`}
                role="region"
                aria-labelledby={`${baseId}-q${i}`}
                style={{ height: i === 0 ? "auto" : 0, opacity: i === 0 ? 1 : 0 }}
                className="overflow-hidden"
              >
                <p className="max-w-[60ch] px-6 pb-6 text-base leading-relaxed text-strong-foreground">{f.a}</p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
