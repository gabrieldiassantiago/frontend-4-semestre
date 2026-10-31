"use client"

import { useLayoutEffect, useRef, useState } from "react"
import Link from "next/link"
import { gsap } from "gsap"
import { Banknote, BarChart3, Bookmark, Briefcase, CodeXml, Handshake, LayoutGrid, MapPin, Palette, Share2, Sparkles, type LucideIcon } from "lucide-react"

import { CompanyLogo } from "@/components/shared/company-logo"
import { SectionHeading } from "./section-heading"
import { JOB_TABS, TABBED_CATEGORIES, type JobTabId, type LandingJob } from "@/lib/data/landing"
import { ROUTES } from "@/lib/config/routes"
import { cn } from "@/lib/utils"

const TAB_ICONS: Record<string, LucideIcon> = {
  TODAS: LayoutGrid,
  DESIGN_UX_UI: Palette,
  DESENVOLVIMENTO_SOFTWARE: CodeXml,
  CIENCIA_DE_DADOS_IA: BarChart3,
  VENDAS: Handshake,
  OUTRAS: Sparkles,
}

function matchesTab(job: LandingJob, tab: JobTabId) {
  if (tab === "TODAS") return true
  if (tab === "OUTRAS") return !TABBED_CATEGORIES.includes(job.categoria)
  return job.categoria === tab
}

export function JobsSection({ jobs }: { jobs: LandingJob[] }) {
  const [tab, setTab] = useState<JobTabId>("TODAS")
  const [saved, setSaved] = useState<Set<string>>(new Set())
  const grid = useRef<HTMLDivElement>(null)
  const pill = useRef<HTMLSpanElement>(null)
  const tabs = useRef<Record<string, HTMLButtonElement | null>>({})
  const firstRender = useRef(true)

  const visible = jobs.filter((j) => matchesTab(j, tab))

  useLayoutEffect(() => {
    const el = tabs.current[tab]
    if (!el || !pill.current) return
    gsap.to(pill.current, { x: el.offsetLeft, width: el.offsetWidth, duration: firstRender.current ? 0 : 0.45, ease: "power3.out" })
    const onResize = () => gsap.set(pill.current, { x: el.offsetLeft, width: el.offsetWidth })
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [tab])

  useLayoutEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    if (!grid.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    gsap.fromTo(
      grid.current.children,
      { y: 28, opacity: 0, scale: 0.97 },
      { y: 0, opacity: 1, scale: 1, duration: 0.55, stagger: 0.07, ease: "power3.out", overwrite: true, clearProps: "opacity,scale,y" },
    )
  }, [tab])

  function toggleSaved(id: string) {
    setSaved((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function share(job: LandingJob) {
    const url = `${window.location.origin}${ROUTES.publicJob(job.id)}`
    if (navigator.share) {
      await navigator.share({ title: job.titulo, text: `${job.titulo} · ${job.empresa}`, url }).catch(() => {})
    } else {
      await navigator.clipboard?.writeText(url)
    }
  }

  return (
    <section id="vagas" aria-label="Vagas recentes" className="mx-auto max-w-[1400px] scroll-mt-24 px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
      <SectionHeading eyebrow="Explorar" lines={["Navegue pelas vagas", "mais recentes"]} />

      <div data-reveal className="no-scrollbar -mx-5 mt-10 flex overflow-x-auto px-5 sm:mx-0 sm:justify-center sm:px-0">
        <div role="tablist" aria-label="Filtrar por área" className="relative flex shrink-0 gap-2">
          <span ref={pill} className="absolute inset-y-0 left-0 w-0 rounded-full bg-strong" aria-hidden />
          {JOB_TABS.map((t) => {
            const Icon = TAB_ICONS[t.id] ?? Briefcase
            const active = tab === t.id
            return (
              <button
                key={t.id}
                ref={(el) => { tabs.current[t.id] = el }}
                role="tab"
                aria-selected={active}
                onClick={() => setTab(t.id)}
                className={cn(
                  "relative z-10 flex h-12 items-center gap-2 whitespace-nowrap rounded-full border px-5 text-[15px] transition-colors duration-300",
                  active ? "border-transparent text-white" : "border-border bg-muted text-strong-foreground hover:border-border-strong",
                )}
              >
                <Icon className="size-4" aria-hidden />
                {t.label}
              </button>
            )
          })}
        </div>
      </div>

      <div ref={grid} data-reveal className="mt-10 grid min-h-[320px] gap-5 md:grid-cols-2 lg:grid-cols-3">
        {visible.map((j) => (
          <article key={j.id} className="flex flex-col overflow-hidden rounded-3xl border border-border bg-background transition-[box-shadow,translate] duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_-30px_rgba(59,31,174,0.35)]">
            <header className="flex items-start gap-3 border-b border-border bg-muted px-6 py-5">
              <span className="grid size-12 shrink-0 place-items-center rounded-xl border border-border bg-white">
                <CompanyLogo name={j.empresa} size="sm" />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-lg font-medium leading-tight">{j.titulo}</h3>
                <p className="mt-0.5 text-sm text-muted-foreground">{j.empresa}</p>
              </div>
              <span className="whitespace-nowrap text-xs text-muted-foreground">{j.quando}</span>
            </header>
            <div className="flex flex-1 flex-col px-6 pb-6 pt-5">
              <p className="font-medium">Sobre a vaga</p>
              <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{j.resumo}</p>
              <Link href={ROUTES.publicJob(j.id)} className="mt-4 w-fit text-sm font-medium underline-offset-4 hover:text-primary hover:underline">Ler mais</Link>
              <div className="mt-5 flex flex-wrap gap-2 text-[13px] text-strong-foreground">
                {j.local && <span className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5"><MapPin className="size-3.5" aria-hidden />{j.local}</span>}
                {j.modalidade && <span className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5"><Briefcase className="size-3.5" aria-hidden />{j.modalidade}</span>}
                <span className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5"><Banknote className="size-3.5" aria-hidden />{j.salario}</span>
              </div>
              <footer className="mt-auto flex items-center gap-2 pt-6">
                <Link href={ROUTES.publicJob(j.id)} className="flex h-12 flex-1 items-center justify-center rounded-full bg-strong text-[15px] font-medium text-white transition-colors hover:bg-primary">
                  Candidatar-se
                </Link>
                <button
                  type="button"
                  aria-label={saved.has(j.id) ? "Remover dos salvos" : "Salvar vaga"}
                  aria-pressed={saved.has(j.id)}
                  onClick={() => toggleSaved(j.id)}
                  className={cn("grid size-12 place-items-center rounded-full border transition-colors", saved.has(j.id) ? "border-primary bg-primary-subtle text-primary" : "border-border text-strong-foreground hover:border-border-strong")}
                >
                  <Bookmark className={cn("size-[18px]", saved.has(j.id) && "fill-primary")} aria-hidden />
                </button>
                <button type="button" aria-label="Compartilhar vaga" onClick={() => share(j)} className="grid size-12 place-items-center rounded-full border border-border text-strong-foreground transition-colors hover:border-border-strong">
                  <Share2 className="size-[18px]" aria-hidden />
                </button>
              </footer>
            </div>
          </article>
        ))}
        {visible.length === 0 && (
          <p className="col-span-full grid place-items-center rounded-3xl border border-dashed border-border py-20 text-center text-sm text-muted-foreground">
            Nenhuma vaga recente nesta área. Crie sua conta para ser avisado.
          </p>
        )}
      </div>

      <div data-reveal className="mt-10 text-center">
        <Link href={ROUTES.candidate.jobs} className="inline-flex h-12 items-center rounded-full border border-border bg-muted px-7 text-sm font-medium transition-colors hover:bg-border-subtle">
          Ver todas as vagas
        </Link>
      </div>
    </section>
  )
}
