"use client"

import { useEffect, useRef } from "react"
import dynamic from "next/dynamic"
import { useReducedMotion } from "framer-motion"

const Lottie = dynamic(() => import("lottie-react").then(module => module.Lottie), { ssr: false })

export function CreatingVagaScreen() {
  const reducedMotion = useReducedMotion()
  const heading = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" })
    heading.current?.focus({ preventScroll: true })
  }, [])

  return (
    <main aria-busy="true" className="mx-auto flex min-h-[calc(100svh-9rem)] max-w-lg flex-col items-center justify-center px-6 py-12 text-center">
      <div aria-hidden="true" className="size-52 sm:size-64">
        <Lottie src="/animations/criando.json" autoplay={!reducedMotion} loop={!reducedMotion} className="size-full" />
      </div>
      <div role="status">
        <h1 ref={heading} tabIndex={-1} className="mt-4 text-2xl font-semibold tracking-tight text-ink outline-none sm:text-3xl">
          Só um minutinho…
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Estamos otimizando a sua vaga.
        </p>
      </div>
    </main>
  )
}
