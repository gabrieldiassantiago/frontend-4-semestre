"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Banknote, Briefcase, ChevronDown, MapPin, Rocket, Search, Send, X } from "lucide-react"

import { CompanyLogo } from "@/components/shared/company-logo"
import { LogoMarquee } from "./logo-marquee"
import { ROUTES } from "@/lib/config/routes"

const STEP_LABELS = ["Candidatura enviada", "Currículo em análise", "Entrevista marcada", "Proposta recebida"]

const BARS = [
  { label: "enviadas", value: 12, normal: "68%", boosted: "32%" },
  { label: "vistas", value: 6, normal: "72%", boosted: "26%" },
  { label: "chamadas", value: 4, normal: "58%", boosted: "40%" },
]

export function HeroSection() {
  const router = useRouter()
  const [q, setQ] = useState("")
  const [local, setLocal] = useState("")

  function submit(e: React.FormEvent) {
    e.preventDefault()
    router.push(ROUTES.candidate.jobSearch([q, local].filter(Boolean).join(" ")))
  }

  return (
    <section aria-labelledby="hero-title" className="px-3 sm:px-6">
      <div
        data-hero-stage
        className="relative mx-auto max-w-[1400px] overflow-hidden rounded-[28px] bg-primary-subtle"
      >
        <div className="hero-dots pointer-events-none absolute inset-0" aria-hidden />
        <svg aria-hidden viewBox="0 0 240 240" data-parallax="-14" className="pointer-events-none absolute -left-16 top-10 hidden size-72 text-primary/[0.07] lg:block">
          <path fill="currentColor" d="M120 0 133 99 240 120 133 133 120 240 104 135 0 120 104 104Z" />
          <rect x="30" y="30" width="180" height="180" rx="32" fill="none" stroke="currentColor" strokeWidth="2" transform="rotate(12 120 120)" />
        </svg>

        <div className="relative mx-auto max-w-5xl px-5 pb-10 pt-12 text-center sm:pt-14 lg:pt-16">
          <p data-hero="pill" className="mx-auto mb-7 inline-flex items-center gap-2.5 rounded-full border border-border/60 bg-white py-1.5 pl-2 pr-4 text-xs text-strong-foreground sm:text-sm">
            <span className="flex -space-x-1.5" aria-hidden>
              {[
                { i: "CL", cls: "bg-primary text-white" },
                { i: "AV", cls: "bg-mint text-ink" },
                { i: "RM", cls: "bg-ink text-white" },
              ].map(({ i, cls }) => (
                <span key={i} className={`grid size-6 place-items-center rounded-full border-2 border-white text-[9px] font-semibold ${cls}`}>
                  {i}
                </span>
              ))}
            </span>
            <span>Já temos <strong className="font-semibold text-foreground">+200 empresas</strong> afiliadas em nossa plataforma</span>
          </p>

          <h1 id="hero-title" data-hero="title" className="text-balance text-[38px] font-normal leading-[1.05] tracking-[-0.035em] text-foreground sm:text-[56px] lg:text-[68px]">
            <span className="block overflow-hidden pb-2"><span className="block">Encontre oportunidades que</span></span>
            <span className="block overflow-hidden pb-2"><span className="block">fazem sentido <span className="relative inline-block px-1 text-primary"><span data-hero="marker" aria-hidden className="absolute inset-x-0 bottom-[10%] top-[64%] origin-left bg-mint" /><span className="relative">para você</span></span></span></span>
          </h1>

          <p data-hero="text" className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            Aqui você encontra empresas que olham de verdade para você e não te deixam sem saber o porquê você não passou numa vaga.
          </p>

          <form
            data-hero="search"
            role="search"
            onSubmit={submit}
            className="mx-auto mt-9 flex max-w-[740px] flex-col gap-1 rounded-3xl border border-border/60 bg-white p-2 transition-colors focus-within:border-primary/50 sm:flex-row sm:items-center sm:rounded-full"
          >
            <label className="flex flex-1 items-center gap-3 px-4">
              <Search className="size-5 shrink-0 text-muted-foreground" aria-hidden />
              <span className="sr-only">Buscar por título ou empresa</span>
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por título, empresa" className="h-12 w-full bg-transparent text-[15px] outline-none placeholder:text-muted-foreground" />
            </label>
            <span className="mx-4 h-px bg-border sm:mx-0 sm:h-7 sm:w-px" aria-hidden />
            <label className="flex flex-1 items-center gap-3 px-4">
              <MapPin className="size-5 shrink-0 text-muted-foreground" aria-hidden />
              <span className="sr-only">Cidade ou estado</span>
              <input value={local} onChange={(e) => setLocal(e.target.value)} placeholder="Cidade ou Estado" className="h-12 w-full bg-transparent text-[15px] outline-none placeholder:text-muted-foreground" />
            </label>
            <button type="submit" data-magnetic className="group inline-flex h-12 items-center justify-center gap-3 rounded-full bg-primary pl-6 pr-1.5 text-sm font-medium text-white transition-colors hover:bg-primary-hover sm:h-[54px]">
              Encontrar vagas
              <span className="grid size-9 place-items-center rounded-full bg-white text-primary transition-transform duration-300 group-hover:translate-x-0.5 sm:size-[42px]"><ArrowRight className="size-4" aria-hidden /></span>
            </button>
          </form>
        </div>

        <HeroCards />
      </div>

      <div data-reveal className="mx-auto max-w-[1400px] px-2 pb-6 pt-12 text-center">
        <p className="text-sm text-muted-foreground">Mais de 200 empresas confiam na Selecta</p>
        <LogoMarquee />
      </div>
    </section>
  )
}

function HeroCards() {
  return (
    <div className="relative mx-auto h-[300px] max-w-[1180px] sm:h-[360px] lg:h-[400px]">
      {/* Seus dados */}
      <div data-hero="card" data-depth="14" className="absolute bottom-12 left-0 hidden w-[260px] lg:block lg:left-[3%] lg:w-[320px]">
        <div data-float="8" className="-rotate-[4deg] rounded-3xl border border-border/60 bg-white p-5 shadow-[0_24px_60px_-32px_rgba(24,24,27,0.3)]">
          <div className="flex items-center justify-between">
            <span className="text-base font-medium">Seus dados</span>
            <span className="flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground">Em 7 dias <ChevronDown className="size-3" aria-hidden /></span>
          </div>
          <div className="mt-5 space-y-2.5">
            {BARS.map((b) => (
              <div key={b.label} className="flex items-center gap-3">
                <span data-bar className="flex h-7 flex-1 origin-left overflow-hidden rounded-md">
                  <span className="h-full bg-primary" style={{ width: b.normal }} />
                  <span className="h-full bg-mint" style={{ width: b.boosted }} />
                </span>
                <span className="w-[84px] whitespace-nowrap text-sm text-muted-foreground"><strong className="font-semibold text-foreground">{b.value}</strong> {b.label}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-4 text-xs text-strong-foreground">
            <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-primary" /> Normal</span>
            <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-mint" /> Impulsionado</span>
          </div>
        </div>
      </div>

      {/* Detalhes da vaga */}
      <div data-hero="card" data-depth="6" className="absolute bottom-0 left-1/2 w-[min(92%,380px)] -translate-x-1/2 lg:w-[400px]">
        <div className="overflow-hidden rounded-t-[28px] border border-b-0 border-border/60 bg-white shadow-[0_-10px_60px_-32px_rgba(24,24,27,0.3)]">
          <div className="bg-muted px-5 pb-4 pt-5">
            <div className="flex items-center justify-between">
              <span className="text-lg font-medium">Detalhes da vaga</span>
              <span className="grid size-9 place-items-center rounded-full border border-border bg-white"><X className="size-4" aria-hidden /></span>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <span className="grid size-12 place-items-center rounded-xl border border-border bg-white">
                <CompanyLogo name="Pulse Tech" size="sm" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-medium leading-tight">Designer UX/UI</p>
                <p className="text-sm text-muted-foreground">Pulse Tech</p>
              </div>
              <span className="self-start text-xs text-muted-foreground">Há 1 min</span>
            </div>
          </div>
          <div className="border-t border-border px-5 pb-6 pt-4">
            <p className="text-sm font-medium">Sobre a vaga</p>
            <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
              A Pulse Tech é referência em soluções inovadoras com tecnologia de ponta, dedicada a criar experiências digitais transformadoras.
            </p>
            <p className="mt-3 text-xs font-medium">Ver mais</p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-strong-foreground">
              <span className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5"><MapPin className="size-3.5" aria-hidden /> São Paulo</span>
              <span className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5"><Briefcase className="size-3.5" aria-hidden /> Tempo integral</span>
              <span className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5"><Banknote className="size-3.5" aria-hidden /> R$ 7.000 – R$ 9.000</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chips da direita */}
      {/* Status ao vivo: as etapas avançam em loop (data-steps) */}
      <div data-hero="card" data-depth="18" className="absolute right-0 top-0 hidden lg:block lg:right-[4%]">
        <div data-float="7" data-steps className="w-[290px] rounded-3xl border border-border/60 bg-white p-4 text-left shadow-[0_24px_60px_-32px_rgba(24,24,27,0.3)]">
          <div className="flex items-center gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary text-white"><Send className="size-[18px]" aria-hidden /></span>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">Sua candidatura</p>
              <p data-step-label data-labels={STEP_LABELS.join("|")} className="truncate font-medium leading-tight">{STEP_LABELS[2]}</p>
            </div>
          </div>
          <div className="mt-4 flex gap-1.5" aria-hidden>
            {STEP_LABELS.map((label, i) => (
              <span key={label} data-step data-active={i <= 2} className="h-1.5 flex-1 rounded-full bg-border transition-colors duration-500 data-[active=true]:bg-primary" />
            ))}
          </div>
        </div>
      </div>

      <div data-hero="card" data-depth="24" className="absolute bottom-20 right-0 hidden lg:block lg:right-[5%]">
        <div data-float="10" className="-rotate-[4deg] flex items-center gap-4 rounded-3xl border border-border/60 bg-white py-4 pl-4 pr-6 shadow-[0_24px_60px_-32px_rgba(24,24,27,0.3)]">
          <span className="grid size-14 place-items-center rounded-full bg-mint text-ink"><Rocket className="size-6" aria-hidden /></span>
          <div>
            <p className="text-3xl font-medium leading-none tracking-tight" data-hero-count="90" data-suffix="%">90%</p>
            <p className="mt-1.5 text-sm text-muted-foreground">Taxa de contratação</p>
          </div>
        </div>
      </div>

      {/* Mobile: um destaque compacto sobre o card central */}
      <div data-hero="card" className="absolute right-3 top-2 sm:right-[12%] lg:hidden">
        <div data-float="6" className="flex rotate-[4deg] items-center gap-2.5 rounded-2xl bg-white py-2 pl-2 pr-4 shadow-raised">
          <span className="grid size-9 place-items-center rounded-full bg-mint text-ink"><Rocket className="size-4" aria-hidden /></span>
          <div className="text-left">
            <p className="text-lg font-semibold leading-none">90%</p>
            <p className="text-[10px] text-muted-foreground">Taxa de contratação</p>
          </div>
        </div>
      </div>
    </div>
  )
}
