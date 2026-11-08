"use client"

import { useLayoutEffect, useRef, useState, type ReactNode } from "react"
import { AnimatePresence, motion, useIsPresent, useReducedMotion } from "framer-motion"

export function RegistrationStep({ step, children }: { step: number; children: ReactNode }) {
  const reducedMotion = useReducedMotion()
  const [navigation, setNavigation] = useState({ step, direction: 1 })
  const [height, setHeight] = useState<number>()
  const [resizing, setResizing] = useState(false)

  if (step !== navigation.step) {
    setNavigation({ step, direction: step > navigation.step ? 1 : -1 })
  }

  return (
    <motion.div
      initial={false}
      animate={height === undefined ? undefined : { height }}
      transition={{ duration: reducedMotion ? 0 : 0.22, ease: "easeOut" }}
      onAnimationStart={() => setResizing(true)}
      onAnimationComplete={() => setResizing(false)}
      style={{ overflow: resizing ? "hidden" : "visible" }}
    >
      <AnimatePresence initial={false} mode="wait" custom={navigation.direction}>
        <StepContent key={step} direction={navigation.direction} onHeightChange={setHeight}>
          {children}
        </StepContent>
      </AnimatePresence>
    </motion.div>
  )
}

function StepContent({ direction, onHeightChange, children }: {
  direction: number
  onHeightChange: (height: number) => void
  children: ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  const present = useIsPresent()
  const reducedMotion = useReducedMotion()

  useLayoutEffect(() => {
    const node = ref.current
    if (!node || !present) return
    const observer = new ResizeObserver(() => onHeightChange(node.getBoundingClientRect().height))
    onHeightChange(node.getBoundingClientRect().height)
    observer.observe(node)
    return () => observer.disconnect()
  }, [onHeightChange, present])

  return (
    <motion.div
      ref={ref}
      inert={!present}
      custom={direction}
      variants={{
        enter: (travel: number) => ({ opacity: 0, x: reducedMotion ? 0 : travel * 10 }),
        visible: { opacity: 1, x: 0 },
        exit: (travel: number) => ({ opacity: 0, x: reducedMotion ? 0 : travel * -10 }),
      }}
      initial="enter"
      animate="visible"
      exit="exit"
      transition={{ duration: reducedMotion ? 0 : 0.16, ease: "easeOut" }}
      onAnimationComplete={definition => {
        if (definition === "visible" && present) {
          ref.current?.querySelector<HTMLElement>("[data-step-heading]")?.focus({ preventScroll: true })
        }
      }}
      className="flow-root space-y-4"
    >
      {children}
    </motion.div>
  )
}
