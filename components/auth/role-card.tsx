"use client"

import Link from "next/link"
import { ArrowRight, Check } from "lucide-react"
import { motion, useReducedMotion } from "framer-motion"

export interface RoleCardProps {
  href: string
  title: string
  eyebrow: string
  description: string
  features: string[]
  cta: string
  tone: "candidate" | "company"
  index?: number
}

export function RoleCard({
  href,
  title,
  eyebrow,
  description,
  features,
  cta,
  index = 0,
}: RoleCardProps) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.li
      className="min-w-0"
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.05 + index * 0.06, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        href={href}
        className="group flex h-full flex-col rounded-xl border border-border bg-card p-6 text-left shadow-xs transition-[border-color,box-shadow,transform] duration-200 ease-out hover:-translate-y-1 hover:border-primary hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:translate-y-0 motion-reduce:transform-none sm:p-8"
      >
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{eyebrow}</p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>

        <ul className="mt-6 flex-1 space-y-3 border-t border-border-subtle pt-6">
          {features.map((feature) => (
            <li key={feature} className="flex items-start gap-3 text-sm leading-5 text-strong-foreground">
              <Check className="mt-0.5 size-4 shrink-0 text-primary" strokeWidth={2} aria-hidden />
              {feature}
            </li>
          ))}
        </ul>

        <span className="mt-8 inline-flex min-h-11 items-center justify-between rounded-lg bg-ink px-5 text-sm font-semibold text-white transition-colors duration-200 group-hover:bg-primary">
          {cta}
          <ArrowRight
            className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transform-none"
            aria-hidden
          />
        </span>
      </Link>
    </motion.li>
  )
}
