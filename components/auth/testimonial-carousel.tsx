"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowUpRight, Quote } from "lucide-react"

import { AUTH_SLIDES } from "@/lib/data/auth-slides"
import { cn } from "@/lib/utils"

const ROTATION_MS = 5500

/**
 * Carrossel de depoimentos da tela de autenticação.
 * Um único componente responsivo — antes desktop e mobile eram blocos duplicados.
 */
export function TestimonialCarousel({ className }: { className?: string }) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const slide = AUTH_SLIDES[index]

  useEffect(() => {
    if (paused) return

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % AUTH_SLIDES.length)
    }, ROTATION_MS)

    return () => window.clearInterval(timer)
  }, [paused])

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className={cn(
        "relative isolate h-full w-full overflow-hidden rounded-3xl bg-strong",
        className,
      )}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.image + index}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.99 }}
          transition={{ opacity: { duration: 0.6 }, scale: { duration: 1.2, ease: "easeOut" } }}
          className="absolute inset-0"
        >
          <Image
            src={slide.image}
            alt={slide.imageAlt}
            fill
            priority={index === 0}
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </motion.div>
      </AnimatePresence>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/10" />

      <span className="absolute left-5 top-5 grid size-10 place-items-center rounded-2xl bg-background/95 text-strong shadow-lg backdrop-blur lg:left-7 lg:top-7 lg:size-11">
        <Quote className="size-4 fill-current lg:size-5" aria-hidden />
      </span>

      <div className="absolute inset-x-0 bottom-0 p-6 lg:p-9">
        <AnimatePresence mode="wait">
          <motion.figure
            key={slide.author + index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <a
              href="#"
              className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-background/10 px-3.5 py-1.5 text-xs font-medium text-white backdrop-blur transition-colors hover:bg-background/20"
            >
              {slide.cta}
              <ArrowUpRight className="size-3.5" aria-hidden />
            </a>

            <blockquote className="max-w-2xl text-pretty text-xl font-semibold leading-tight tracking-tight text-white lg:text-3xl xl:text-4xl">
              {`\u201C${slide.quote}\u201D`}
            </blockquote>

            <figcaption className="mt-5">
              <p className="text-sm font-semibold text-white lg:text-base">{slide.author}</p>
              <p className="mt-0.5 text-xs text-white/70 lg:text-sm">{slide.authorRole}</p>
            </figcaption>
          </motion.figure>
        </AnimatePresence>

        <div className="mt-7 flex gap-2" role="tablist" aria-label="Depoimentos">
          {AUTH_SLIDES.map((item, position) => (
            <button
              key={item.author}
              type="button"
              role="tab"
              aria-selected={position === index}
              aria-label={`Depoimento ${position + 1}: ${item.author}`}
              onClick={() => setIndex(position)}
              className="group h-4 flex-1 cursor-pointer focus-visible:outline-none"
            >
              <span className="block h-1 overflow-hidden rounded-full bg-background/25 transition-colors group-hover:bg-background/40 group-focus-visible:bg-background/60">
                <span
                  className={cn(
                    "block h-full rounded-full bg-background transition-all duration-500",
                    position === index ? "w-full" : "w-0",
                  )}
                />
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
