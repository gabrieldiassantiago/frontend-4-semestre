import Image from "next/image"
import Link from "next/link"
import { Briefcase } from "lucide-react"

import { CompanyLogo } from "@/components/shared/company-logo"
import { SelectaLogo } from "@/components/ui/selecta-logo"
import { FOOTER_COLUMNS } from "@/lib/data/landing"
import { ROUTES } from "@/lib/config/routes"

function PeekCard({ title, company, when, tags, className }: { title: string; company: string; when: string; tags: string[]; className: string }) {
  return (
    <div className={className} aria-hidden>
      <div className="relative pt-3">
        <div className="absolute inset-x-5 top-0 h-10 rounded-t-2xl bg-white/35" />
        <div className="relative rounded-t-2xl bg-white px-5 pb-20 pt-5 shadow-[0_-12px_40px_-12px_rgba(32,16,110,0.5)]">
          <div className="flex items-center gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-border">
              <CompanyLogo name={company} size="sm" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium leading-tight text-foreground">{title}</p>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">{company}</p>
            </div>
            <span className="shrink-0 self-start whitespace-nowrap text-xs text-muted-foreground">{when}</span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {tags.map((t) => (
              <span key={t} className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-strong-foreground">{t}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function CtaSection() {
  return (
    <section aria-labelledby="cta-title" className="px-3 py-12 sm:px-6 lg:py-20">
      <div
        data-cta
        className="relative mx-auto max-w-[1320px] overflow-hidden rounded-[32px] bg-[radial-gradient(130%_140%_at_0%_0%,#8b6dff_0%,#6d47f1_42%,#3b1fae_100%)] px-6 pb-40 pt-20 text-center text-white sm:pb-44 lg:pb-48 lg:pt-24"
      >
        <div data-parallax="-14" className="pointer-events-none absolute -left-24 -top-24 size-80 rounded-full bg-white/15 blur-3xl" aria-hidden />
        <div data-parallax="12" className="pointer-events-none absolute -bottom-32 right-[10%] size-96 rounded-full bg-mint/40 blur-[110px]" aria-hidden />

        <div className="relative mx-auto max-w-3xl">
          <h2 id="cta-title" data-split aria-label="Dê o primeiro passo rumo ao seu novo emprego" className="relative text-balance text-[34px] font-normal leading-[1.1] tracking-[-0.03em] sm:text-5xl lg:text-[60px]">
            <span aria-hidden data-float="6" className="absolute -left-2 -top-6 hidden size-14 -rotate-12 place-items-center rounded-2xl bg-strong shadow-xl sm:grid lg:-left-6">
              <Image src="/images/selecta_solo.svg" alt="" width={30} height={30} className="h-7 w-auto brightness-0 invert" />
            </span>
            <span aria-hidden data-float="8" className="absolute -right-2 top-0 hidden size-14 rotate-12 place-items-center rounded-2xl bg-white shadow-xl sm:grid lg:-right-6">
              <Briefcase className="size-7 text-primary" />
            </span>
            {["Dê o primeiro passo rumo", "ao seu novo emprego"].map((line) => (
              <span key={line} className="block" aria-hidden>
                {line.split(" ").map((w, i, arr) => (
                  <span key={i}>
                    <span className="inline-block overflow-hidden pb-1 align-bottom"><span data-word className="inline-block">{w}</span></span>
                    {i < arr.length - 1 ? " " : null}
                  </span>
                ))}
              </span>
            ))}
          </h2>
          <p data-reveal className="mx-auto mt-6 max-w-md text-base text-white/85 sm:text-lg">
            Comece sua jornada hoje e descubra oportunidades com transparência em cada etapa.
          </p>
          <div data-reveal className="mt-9 flex flex-wrap justify-center gap-3">
            <Link href={`${ROUTES.auth.candidate}?modo=cadastro`} className="inline-flex h-12 items-center rounded-full bg-mint px-7 text-[15px] font-medium text-ink transition-all hover:-translate-y-0.5 hover:bg-mint-hover hover:shadow-[0_14px_30px_-12px_rgba(0,0,0,0.45)]">
              Sou candidato
            </Link>
            <Link href={`${ROUTES.auth.company}?modo=cadastro`} className="inline-flex h-12 items-center rounded-full border border-white/50 px-7 text-[15px] font-medium text-white transition-colors hover:bg-white/10">
              Sou empresa
            </Link>
          </div>
        </div>

        <PeekCard title="UX/UI Manager" company="Designlabz" when="há 10 min" tags={["Remoto", "CLT", "Pleno"]} className="cta-peek absolute -bottom-16 left-[calc(50%-150px)] w-[300px] -rotate-[4deg] text-left sm:left-[4%] sm:w-[340px] lg:left-[6%] lg:w-[400px]" />
        <PeekCard title="Designer UX/UI" company="Pulse Tech" when="há 1 min" tags={["Híbrido", "PJ", "Sênior"]} className="cta-peek absolute -bottom-16 right-[4%] hidden w-[340px] rotate-[4deg] text-left sm:block lg:right-[6%] lg:w-[400px]" />
      </div>
    </section>
  )
}

const SOCIALS = [
  { label: "Instagram", href: "https://instagram.com", path: "M12 2.2c3.2 0 3.6 0 4.8.1 1.2.1 1.8.2 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1.1.4 2.2.1 1.3.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1.1.4-2.2.4-1.3.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-1.2-.1-1.8-.2-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1.1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.8c.1-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1.1-.4 2.2-.4C8.4 2.2 8.8 2.2 12 2.2Zm0 4.9a4.9 4.9 0 1 0 0 9.8 4.9 4.9 0 0 0 0-9.8Zm0 8.1a3.2 3.2 0 1 1 0-6.4 3.2 3.2 0 0 1 0 6.4Zm5.1-9.4a1.1 1.1 0 1 0 0 2.3 1.1 1.1 0 0 0 0-2.3Z" },
  { label: "X", href: "https://x.com", path: "M17.8 3h3.1l-6.8 7.7L22 21h-6.2l-4.9-6.4L5.3 21H2.2l7.2-8.3L1.8 3h6.4l4.4 5.8L17.8 3Zm-1.1 16.2h1.7L7.4 4.7H5.6l11.1 14.5Z" },
  { label: "LinkedIn", href: "https://linkedin.com", path: "M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4v11H3v-11Zm6.5 0h3.8v1.5h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1v5.45h-4v-4.83c0-1.15-.02-2.63-1.6-2.63-1.6 0-1.85 1.25-1.85 2.55v4.91h-4v-11Z" },
]

export function LandingFooter() {
  return (
    <footer id="contato" className="mx-auto max-w-[1320px] scroll-mt-24 px-5 pb-10 pt-6 sm:px-8 lg:px-12">
      <div data-reveal className="grid gap-12 md:grid-cols-[1.6fr_repeat(3,1fr)]">
        <div>
          <SelectaLogo />
          <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-strong-foreground">
            A Selecta é uma plataforma de vagas feita para conectar <strong className="font-semibold text-foreground">profissionais talentosos</strong> com <strong className="font-semibold text-foreground">empresas que olham de verdade</strong>.
          </p>
        </div>
        {FOOTER_COLUMNS.map((c) => (
          <nav key={c.title} aria-label={c.title}>
            <h3 className="font-medium">{c.title}</h3>
            <ul className="mt-5 space-y-3.5">
              {c.links.map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="text-[15px] text-strong-foreground transition-colors hover:text-primary">{label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="mt-14 flex flex-col-reverse items-center justify-between gap-5 border-t border-border pt-7 sm:flex-row">
        <p className="text-sm text-subtle-foreground">© {new Date().getFullYear()} Selecta. Todos os direitos reservados.</p>
        <ul className="flex gap-3">
          {SOCIALS.map((s) => (
            <li key={s.label}>
              <a href={s.href} target="_blank" rel="noreferrer" aria-label={s.label} className="grid size-12 place-items-center rounded-full border border-border text-foreground transition-all hover:-translate-y-0.5 hover:border-primary hover:text-primary">
                <svg viewBox="0 0 24 24" className="size-5 fill-current" aria-hidden><path d={s.path} /></svg>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  )
}
