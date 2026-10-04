import Link from "next/link"
import { ArrowRight, Building2, UserRound } from "lucide-react"

export interface RoleCardProps {
  href: string
  title: string
  description: string
  cta: string
  tone: "candidate" | "company"
}

export function RoleCard({ href, title, description, cta, tone }: RoleCardProps) {
  const Icon = tone === "candidate" ? UserRound : Building2
  return (
    <li className="min-w-0">
      <Link href={href} className="group flex h-full flex-col rounded-xl border border-border bg-card p-7 text-left transition-colors hover:border-primary/50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary sm:p-8">
        <span className="grid size-12 place-items-center rounded-lg border border-border bg-surface text-strong-foreground"><Icon className="size-6" strokeWidth={1.5} aria-hidden /></span>
        <h2 className="mt-6 text-xl font-semibold tracking-tight text-foreground">{title}</h2>
        <p className="mt-3 flex-1 text-sm leading-7 text-muted-foreground">{description}</p>
        <span className="mt-8 flex items-center justify-between border-t border-border pt-5 text-sm font-semibold text-foreground group-hover:text-primary">{cta}<ArrowRight className="size-4" aria-hidden /></span>
      </Link>
    </li>
  )
}
