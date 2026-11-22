import Image from "next/image"
import Link from "next/link"
import { ArrowDownRight, ArrowUpRight, Check, ChevronDown, Search, Star, X } from "lucide-react"

import { CompanyLogo } from "@/components/shared/company-logo"
import { SectionHeading } from "./section-heading"
import { FEATURES, STATS, TESTIMONIALS, TIPS } from "@/lib/data/landing"
import { ROUTES } from "@/lib/config/routes"
import { getInitials } from "@/lib/format"
import { cn } from "@/lib/utils"

export function AboutSection() {
  return (
    <section id="sobre" aria-labelledby="sobre-title" className="mx-auto max-w-[1400px] scroll-mt-24 px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col justify-between gap-10">
          <div>
            <p data-reveal className="mb-6 flex items-center gap-3 text-sm font-medium uppercase tracking-[0.2em] text-strong-foreground">
              <span className="size-2.5 bg-primary" aria-hidden /> Sobre nós
            </p>
            <h2 id="sobre-title" data-reveal className="max-w-[640px] text-balance text-[32px] font-normal leading-[1.15] tracking-[-0.03em] sm:text-[44px]">
              <span className="font-semibold">Nós conectamos você a</span> vagas de empresas humanas que olham de verdade para você
            </h2>
          </div>
          <ul data-stagger className="flex flex-wrap gap-2.5">
            {["Empoderar", "Conectar", "Conquistar"].map((label) => (
              <li key={label} className="flex items-center gap-2 rounded-full border border-border bg-background py-2 pl-2.5 pr-4 text-[15px] text-strong-foreground">
                <span className="grid size-5 place-items-center rounded-full bg-primary text-white"><Check className="size-3" strokeWidth={3} aria-hidden /></span>
                {label}
              </li>
            ))}
          </ul>
        </div>

        <div data-stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
          {STATS.map((s) => (
            <div
              key={s.tag}
              data-tilt
              className={cn(
                "flex min-h-[240px] flex-col justify-between rounded-3xl border p-6 lg:min-h-[295px]",
                s.featured
                  ? "relative isolate overflow-hidden border-transparent bg-primary text-white"
                  : "border-border/60 bg-background",
              )}
            >
              {s.featured && (
                <svg aria-hidden viewBox="0 0 240 240" className="pointer-events-none absolute -bottom-10 -right-10 -z-10 size-52 text-white/[0.12]">
                  <path fill="currentColor" d="M120 0 133 99 240 120 133 133 120 240 104 135 0 120 104 104Z" />
                  <rect x="30" y="30" width="180" height="180" rx="32" fill="none" stroke="currentColor" strokeWidth="2" transform="rotate(12 120 120)" />
                </svg>
              )}
              <div>
                <p className="text-6xl font-normal tracking-[-0.04em]">
                  {s.prefix && <span className={s.featured ? "text-mint" : "text-primary"}>{s.prefix}</span>}
                  <span data-count={s.value}>{s.value}</span>
                  <span className={s.featured ? "text-mint" : "text-primary"}>{s.suffix}</span>
                </p>
                <p className={cn("mt-3 max-w-[26ch] text-[15px] leading-relaxed", s.featured ? "text-white/90" : "text-muted-foreground")}>{s.label}</p>
              </div>
              <span className={cn("w-fit rounded-full px-3.5 py-1.5 text-xs font-medium", s.featured ? "bg-mint text-ink" : "border border-border bg-muted text-strong-foreground")}>{s.tag}</span>
            </div>
          ))}
          <Link
            href="#vagas"
            data-tilt
            className="group flex min-h-[240px] flex-col justify-between rounded-3xl border border-border/60 bg-background p-6 transition-colors hover:border-primary/40 hover:bg-primary-subtle lg:min-h-[295px]"
          >
            <p className="text-[28px] font-normal leading-tight tracking-tight">Veja outras<br />estatísticas</p>
            <span className="grid size-14 place-self-end rounded-full bg-primary text-white transition-transform duration-300 group-hover:-rotate-45 group-hover:scale-105">
              <ArrowDownRight className="m-auto size-6" aria-hidden />
            </span>
          </Link>
        </div>
      </div>
    </section>
  )
}

function MiniList() {
  const rows = [
    { t: "Designer UX/UI", c: "Pulse Tech", w: "Postada ontem", focus: false },
    { t: "Desenvolvedor Front-end", c: "Nexus Care", w: "Há 1 min", focus: true },
    { t: "Engenheiro de UI", c: "Abigail Corp.", w: "Há 5 min", focus: false },
  ]
  return (
    <div data-cycle className="mx-auto flex w-full max-w-[420px] flex-col items-center gap-2">
      {rows.map((r) => (
        <div
          key={r.t}
          data-cycle-item
          data-focus={r.focus}
          className="flex w-full scale-90 items-center gap-3 rounded-2xl border border-border-subtle bg-white p-3 opacity-60 transition-all duration-500 ease-out data-[focus=true]:scale-100 data-[focus=true]:border-primary/30 data-[focus=true]:opacity-100"
        >
          <span className="grid size-11 place-items-center rounded-xl border border-border bg-white"><CompanyLogo name={r.c} size="sm" /></span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-medium">{r.t}</p>
            <p className="text-xs text-muted-foreground">{r.c}</p>
          </div>
          <span className="self-start whitespace-nowrap text-xs text-muted-foreground">{r.w}</span>
        </div>
      ))}
    </div>
  )
}

function MiniStats() {
  const rows = [["12", "enviadas", "68%"], ["6", "vistas", "74%"], ["4", "chamadas", "54%"]]
  return (
    <div className="mx-auto w-full max-w-[330px] rounded-3xl border border-border/60 bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="font-medium">Suas estatísticas</p>
        <span className="flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] text-muted-foreground">Últimos 7 dias <ChevronDown className="size-3" aria-hidden /></span>
      </div>
      <div className="mt-4 space-y-2.5">
        {rows.map(([n, l, w]) => (
          <div key={l} className="flex items-center gap-3">
            <span data-bar className="flex h-8 flex-1 origin-left overflow-hidden rounded-md">
              <span className="h-full bg-primary" style={{ width: w }} />
              <span className="h-full flex-1 bg-mint" />
            </span>
            <span className="w-[76px] text-sm text-muted-foreground"><strong className="font-semibold text-foreground">{n}</strong> {l}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-4 text-xs text-strong-foreground">
        <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-primary" /> Normal</span>
        <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-mint" /> Impulsionado</span>
      </div>
    </div>
  )
}

function MiniArticles() {
  const cards = [
    { tip: TIPS[1], cls: "-rotate-[6deg] h-36 w-40 sm:w-48 translate-y-3 opacity-80" },
    { tip: TIPS[0], cls: "z-10 h-44 w-48 sm:w-60" },
    { tip: TIPS[2], cls: "rotate-[6deg] h-36 w-40 sm:w-48 translate-y-3 opacity-80" },
  ]
  return (
    <div className="mx-auto flex w-full items-center justify-center -space-x-8 sm:-space-x-4">
      {cards.map(({ tip, cls }) => (
        <div key={tip.title} className={cn("relative shrink-0 overflow-hidden rounded-2xl bg-strong transition-[translate,opacity] duration-500 ease-out hover:z-20 hover:-translate-y-3 hover:opacity-100", cls)}>
          <Image src={tip.image} alt="" fill sizes="240px" className="object-cover" />
          <span className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" aria-hidden />
          <span className="absolute right-2.5 top-2.5 grid size-8 place-items-center rounded-full bg-white/90"><ArrowUpRight className="size-4" aria-hidden /></span>
          <p className="absolute inset-x-3 bottom-3 line-clamp-2 text-xs font-medium leading-snug text-white sm:text-sm">{tip.title}</p>
        </div>
      ))}
    </div>
  )
}

function MiniSearch() {
  return (
    <div className="mx-auto w-full max-w-[390px] rounded-3xl border border-border/60 bg-white p-5">
      <div className="flex items-center justify-between font-medium">
        Buscar vagas
        <span className="grid size-8 place-items-center rounded-full border border-border"><X className="size-4" aria-hidden /></span>
      </div>
      <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-border bg-muted px-3.5 py-3 text-sm">
        <Search className="size-4 text-muted-foreground" aria-hidden />
        <span data-typing="designer ux|front-end react|analista de dados" className="text-foreground" />
        <span data-caret className="-ml-2 h-4 w-px bg-primary" aria-hidden />
      </div>
      <div className="mt-4 flex flex-wrap gap-2 text-xs text-strong-foreground">
        {["ui design", "designer ux", "front-end"].map((t) => (
          <span key={t} className="rounded-full border border-border px-2.5 py-1">{t}</span>
        ))}
      </div>
    </div>
  )
}

export function FeaturesSection() {
  const visuals = [<MiniList key="a" />, <MiniStats key="b" />, <MiniArticles key="c" />, <MiniSearch key="d" />]
  return (
    <section aria-label="Recursos" className="mx-auto max-w-[1400px] px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
      <SectionHeading eyebrow="Recursos" lines={["Uma forma mais inteligente de", "encontrar seu próximo emprego"]} />
      <div data-stagger className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-12">
        {FEATURES.map((f, i) => (
          <article
            key={f.id}
            className={cn(
              "group flex flex-col justify-between gap-8 overflow-hidden rounded-[28px] border border-border/60 bg-surface p-6 transition-colors duration-300 hover:border-primary/40 sm:p-7",
              ["lg:col-span-6", "lg:col-span-6", "lg:col-span-7", "lg:col-span-5"][i],
            )}
          >
            <div className="flex min-h-[220px] items-center sm:min-h-[260px]">{visuals[i]}</div>
            <div>
              <h3 className="text-2xl font-normal tracking-tight transition-colors duration-300 group-hover:text-primary sm:text-[28px]">{f.title}</h3>
              <p className="mt-2 max-w-md text-[15px] leading-relaxed text-muted-foreground">{f.text}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

const FLOW = [
  { title: "Crie seu perfil", text: "Conta gratuita de candidato. Você preenche uma vez e usa em todas as candidaturas." },
  { title: "Encontre a vaga", text: "Filtre por cargo, área, cidade ou modalidade e candidate-se." },
  { title: "Acompanhe cada etapa", text: "Veja em que fase está cada processo e seja avisado a cada avanço." },
  { title: "Converse com a empresa", text: "Quando a empresa abre o contato, a conversa acontece no chat da candidatura." },
]

export function HowItWorksSection() {
  return (
    <section aria-label="Como funciona" className="mx-auto max-w-[1400px] px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
      <SectionHeading eyebrow="Como funciona" lines={["Do cadastro à resposta,", "sem ficar no escuro"]} />
      <div data-flow className="relative mt-14">
        <span aria-hidden className="absolute inset-x-0 top-6 hidden h-px bg-border lg:block" />
        <span data-flow-line aria-hidden className="absolute inset-x-0 top-6 hidden h-px origin-left bg-primary lg:block" />
        <ol data-stagger className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {FLOW.map((step, i) => (
            <li key={step.title} className="relative">
              <span data-flow-dot className="relative grid size-12 place-items-center rounded-full border border-border bg-background text-sm font-semibold tabular-nums text-strong-foreground">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-6 text-xl font-medium tracking-tight">{step.title}</h3>
              <p className="mt-2 max-w-[30ch] text-[15px] leading-relaxed text-muted-foreground">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

export function TipsSection() {
  return (
    <section id="dicas" aria-label="Dicas" className="mx-auto max-w-[1400px] scroll-mt-24 px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
      <SectionHeading eyebrow="Dicas" lines={["Guias e dicas de especialistas", "para a sua carreira"]} />
      <div data-stagger className="mt-14 grid gap-5 md:grid-cols-3">
        {TIPS.map((t) => (
          <Link
            key={t.title}
            href={ROUTES.auth.root}
            data-clip
            className="group relative isolate flex h-[380px] flex-col justify-end overflow-hidden rounded-3xl bg-strong p-6 text-white lg:h-[440px]"
          >
            <Image src={t.image} alt="" fill sizes="(min-width:768px) 33vw, 100vw" className="-z-20 object-cover transition-transform duration-700 ease-out group-hover:scale-110" />
            <span className="absolute inset-0 -z-10 bg-gradient-to-t from-black via-black/40 to-transparent" aria-hidden />
            <span className="absolute right-4 top-4 grid size-12 place-items-center rounded-full bg-white text-strong transition-[rotate,background-color,color] duration-300 group-hover:rotate-45 group-hover:bg-primary group-hover:text-white">
              <ArrowUpRight className="size-5" aria-hidden />
            </span>
            <h3 className="max-w-[22ch] text-[22px] font-medium leading-snug">{t.title}</h3>
            <p className="mt-3 line-clamp-2 text-sm text-white/80">{t.text}</p>
          </Link>
        ))}
      </div>
      <div data-reveal className="mt-10 text-center">
        <Link href={ROUTES.auth.root} data-magnetic className="group inline-flex h-12 items-center gap-3 rounded-full border border-border bg-background pl-6 pr-1.5 text-sm font-medium transition-colors hover:border-primary/40 hover:text-primary">
          Ver todas as dicas
          <span className="grid size-9 place-items-center rounded-full bg-primary-subtle text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-white"><ArrowUpRight className="size-4" aria-hidden /></span>
        </Link>
      </div>
    </section>
  )
}

const TONES: Record<string, string> = {
  violet: "border-transparent bg-primary-subtle",
  pink: "border-transparent bg-mint-subtle",
  blue: "border-transparent bg-primary-subtle",
  none: "border-border/60 bg-background",
}

export function TestimonialsSection() {
  return (
    <section aria-label="Depoimentos" className="mx-auto max-w-[1400px] px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
      <SectionHeading eyebrow="Depoimentos" lines={["Veja o que dizem nossos", "usuários satisfeitos"]} />
      <div data-stagger className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {TESTIMONIALS.map((t) => (
          <figure key={t.author} data-tilt className={cn("flex min-h-[270px] flex-col rounded-3xl border p-6", TONES[t.tone])}>
            <span className="flex w-fit items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-sm font-medium text-foreground ring-1 ring-border/60">
              <Star className="size-4 fill-primary text-primary" aria-hidden /> {t.rating}
              <span className="sr-only">de 5 estrelas</span>
            </span>
            <blockquote className="mt-5 flex-1 text-[17px] leading-relaxed text-strong-foreground">{`“${t.quote}”`}</blockquote>
            <figcaption className="mt-6 flex items-end justify-between gap-4">
              <span>
                <span className="block font-medium">{t.author}</span>
                <span className="text-sm text-muted-foreground">{t.role}</span>
              </span>
              <span aria-hidden className="grid size-12 shrink-0 place-items-center rounded-full bg-primary text-sm font-semibold text-white">
                {getInitials(t.author, "?")}
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}
