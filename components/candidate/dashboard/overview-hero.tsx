import Link from "next/link"
import { ArrowRight, ArrowUpRight } from "lucide-react"
import { ROUTES } from "@/lib/config/routes"

export function OverviewHero() {
  return (
    <section aria-labelledby="overview-title" className="relative isolate overflow-hidden rounded-2xl bg-primary px-5 py-6 text-white sm:px-7 sm:py-7">
      <svg aria-hidden viewBox="0 0 240 240" className="pointer-events-none absolute -right-6 -top-8 -z-10 h-72 w-72 text-white/[0.12]">
        <path fill="currentColor" d="M120 0 133 99 240 120 133 133 120 240 104 135 0 120 104 104Z" />
        <rect x="30" y="30" width="180" height="180" rx="32" fill="none" stroke="currentColor" strokeWidth="2" transform="rotate(12 120 120)" />
      </svg>
      <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/80">Seu próximo capítulo</p>
      <h1 id="overview-title" className="mt-3 max-w-md text-2xl font-semibold leading-tight tracking-tight text-balance sm:text-[28px]">Seu talento merece<br />a oportunidade certa.</h1>
      <p className="mt-3 max-w-sm text-xs leading-relaxed text-white/85">Explore novas vagas e acompanhe cada passo da sua jornada profissional.</p>
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <Link href={ROUTES.candidate.jobs} className="inline-flex min-h-11 items-center gap-3 rounded-full bg-ink py-2 pl-4 pr-2 text-xs font-medium text-white transition-colors hover:bg-primary-deep">
          Buscar oportunidades<span className="grid size-7 place-items-center rounded-full bg-white text-ink"><ArrowRight aria-hidden className="size-4" /></span>
        </Link>
        <Link href={ROUTES.candidate.applications} className="inline-flex min-h-11 items-center gap-1.5 rounded-lg px-3 text-xs text-white/90 transition-colors hover:bg-white/10">Minhas candidaturas<ArrowUpRight aria-hidden className="size-3.5" /></Link>
      </div>
    </section>
  )
}
