"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  ArrowRight,
  Bookmark,
  Briefcase,
  Calendar,
  MapPin,
  Sparkles,
} from "lucide-react"

import { PageShell } from "@/components/ui/page"
import { RouteSkeleton } from "@/components/ui/route-skeleton"
import { ErrorState } from "@/components/ui/states"
import { CompanyBrandLogo } from "@/components/candidate/jobs/company-brand-logo"
import { useCandidateProfile } from "@/lib/queries/use-candidate-profile"
import { useCurrentUser } from "@/lib/queries/use-auth"
import { useMinhasCandidaturas } from "@/lib/queries/use-candidaturas"
import { EtapaTrilha, StatusBadge } from "@/components/candidatura/candidatura-ui"
import { useVagas } from "@/lib/queries/use-vagas"
import { formatCurrency, formatDate } from "@/lib/format"
import { MODALIDADE_LABELS, type Vaga } from "@/lib/types/vaga.types"
import type { Candidatura } from "@/lib/types/candidatura.types"
import { cn } from "@/lib/utils"

// ── Ilustração da Entrevista (Laptop, Caneca, Planta, Post-it) ───────────────
function DeskIllustration() {
  return (
    <div className="relative flex items-center justify-center lg:justify-end select-none pointer-events-none">
      {/* Glow de fundo */}
      <div className="absolute -inset-4 rounded-full bg-purple-200/40 blur-2xl" />

      <div className="relative w-full max-w-[340px] sm:max-w-[400px]">
        {/* Post-it "Você consegue!" */}
        <div className="absolute -top-3 right-6 z-20 rotate-6 rounded-lg bg-[#ede9fe] px-3.5 py-2 shadow-sm border border-purple-200/80">
          <p className="text-xs font-bold text-[#6d28d9] tracking-tight">
            Você consegue! ✨
          </p>
        </div>

        {/* Caneca com café */}
        <div className="absolute -bottom-1 right-2 z-10 hidden sm:block">
          <div className="relative size-14 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center">
            <div className="size-8 rounded-full bg-amber-900/20" />
            <div className="absolute -right-2 top-3 size-4 rounded-r-lg border-2 border-slate-200 bg-transparent" />
          </div>
        </div>

        {/* Vasinho com planta */}
        <div className="absolute bottom-0 left-2 z-10 hidden sm:block">
          <div className="flex flex-col items-center">
            <div className="flex gap-1 -mb-1">
              <span className="size-4 rounded-full bg-emerald-500/80 -rotate-12" />
              <span className="size-5 rounded-full bg-emerald-600 -mt-1" />
              <span className="size-4 rounded-full bg-emerald-500/80 rotate-12" />
            </div>
            <div className="h-7 w-9 rounded-b-xl rounded-t-sm bg-slate-300 border border-slate-400/40 shadow-xs" />
          </div>
        </div>

        {/* SVG Ilustração do Laptop */}
        <svg
          viewBox="0 0 420 280"
          className="w-full h-auto drop-shadow-md"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Base da mesa / sombra */}
          <ellipse cx="210" cy="260" rx="190" ry="14" fill="#6d28d9" fillOpacity="0.08" />

          {/* Tampa do Laptop aberta */}
          <rect x="75" y="40" width="270" height="175" rx="14" fill="#1e1e24" />
          <rect x="83" y="48" width="254" height="159" rx="8" fill="#2d2b38" />

          {/* Tela do Laptop com interface / vídeo */}
          <rect x="88" y="53" width="244" height="149" rx="6" fill="#f8f7ff" />
          <rect x="88" y="53" width="244" height="24" rx="4" fill="#ede9fe" />
          <circle cx="100" cy="65" r="3" fill="#c4b5fd" />
          <circle cx="109" cy="65" r="3" fill="#c4b5fd" />
          <circle cx="118" cy="65" r="3" fill="#c4b5fd" />

          {/* Vídeo / Pessoa na chamada */}
          <rect x="100" y="86" width="120" height="75" rx="6" fill="#ede9fe" />
          <circle cx="160" cy="115" r="16" fill="#7c3aed" />
          <path d="M140 148 C140 132, 180 132, 180 148 Z" fill="#7c3aed" />

          {/* Gráfico / Apresentação de dados */}
          <rect x="228" y="86" width="94" height="75" rx="6" fill="#ffffff" stroke="#e2e8f0" />
          <rect x="236" y="130" width="12" height="22" rx="2" fill="#7c3aed" />
          <rect x="254" y="118" width="12" height="34" rx="2" fill="#c4b5fd" />
          <rect x="272" y="102" width="12" height="50" rx="2" fill="#7c3aed" />
          <rect x="290" y="112" width="12" height="40" rx="2" fill="#a78bfa" />

          {/* Barra de controle da chamada */}
          <rect x="135" y="172" width="150" height="18" rx="9" fill="#1e1e24" />
          <circle cx="160" cy="181" r="5" fill="#ef4444" />
          <circle cx="185" cy="181" r="5" fill="#ffffff" fillOpacity="0.8" />
          <circle cx="210" cy="181" r="5" fill="#ffffff" fillOpacity="0.8" />
          <circle cx="235" cy="181" r="5" fill="#ffffff" fillOpacity="0.8" />
          <circle cx="260" cy="181" r="5" fill="#10b981" />

          {/* Teclado e base do Laptop */}
          <path
            d="M40 215 L380 215 L360 250 L60 250 Z"
            fill="#d1d5db"
            stroke="#9ca3af"
            strokeWidth="1.5"
          />
          <path d="M70 218 L350 218 L338 244 L82 244 Z" fill="#e5e7eb" />

          {/* Trackpad */}
          <rect x="180" y="224" width="60" height="20" rx="4" fill="#f3f4f6" stroke="#d1d5db" />
          <path d="M190 215 L230 215" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  )
}

export function CandidateOverviewScreen() {
  const { profile, loading: profileLoading, error: profileError, refetch: refetchProfile } = useCandidateProfile()
  const { user: currentUser, loading: userLoading } = useCurrentUser()
  const { candidaturas, loading: candidaturasLoading, error: candidaturasError, refetch: refetchCandidaturas } = useMinhasCandidaturas()
  const { vagas, loading: vagasLoading, error: vagasError, refetch: refetchVagas } = useVagas()

  const [savedJobs, setSavedJobs] = useState<Set<string>>(() => new Set())
  const [greeting, setGreeting] = useState("Boa noite")

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) setGreeting("Bom dia")
    else if (hour >= 12 && hour < 18) setGreeting("Boa tarde")
    else setGreeting("Boa noite")
  }, [])

  const toggleSave = (id: string) => {
    setSavedJobs((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const loading = profileLoading || userLoading || candidaturasLoading || vagasLoading

  const displayName = currentUser?.name
  const firstName = displayName?.split(" ")[0]

  // Candidatura principal para o card de "Suas candidaturas"
  const candidaturaDestaque = useMemo(() => candidaturas[0] ?? null, [candidaturas])

  // Vagas recomendadas para a seção "Vagas para você" (buscadas do servidor)
  const vagasParaVoce = useMemo(() => {
    return vagas.slice(0, 3).map((v: Vaga) => ({
      id: v.id,
      titulo: v.titulo,
      empresa: v.nomeEmpresa || "Empresa",
      logoUrl: v.logoUrlEmpresa,
      tags: [
        v.modalidade in MODALIDADE_LABELS ? MODALIDADE_LABELS[v.modalidade] : "Híbrido",
        v.categoria ? v.categoria.split("_")[0] : "Tecnologia",
      ],
      cidade: v.cidade,
      estado: v.estado,
      salario: v.salario || 0,
    }))
  }, [vagas])

  if (loading) {
    return <RouteSkeleton variant="dashboard" />
  }

  if (profileError || candidaturasError || vagasError) {
    return (
      <PageShell className="max-w-[1180px] py-8">
        <ErrorState
          title="Erro ao carregar visão geral"
          description={profileError || candidaturasError || vagasError || undefined}
          action={
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                void refetchProfile()
                void refetchCandidaturas()
                void refetchVagas()
              }}
            >
              Tentar novamente
            </button>
          }
        />
      </PageShell>
    )
  }

  return (
    <PageShell className="max-w-[1180px] py-6 sm:py-8 space-y-8">
      {/* ── 1. Saudação Principal ── */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          {greeting}, {firstName}! 👋
        </h1>
        <p className="text-sm text-slate-500">
          Veja o que está acontecendo com a sua busca por novas oportunidades.
        </p>
      </div>

      {/* ── 2. Card de Destaque ── */}
      {candidaturaDestaque && <div className="relative overflow-hidden rounded-3xl border border-[#e9e3ff] bg-gradient-to-r from-[#f5f2ff] via-[#f8f6ff] to-[#f0ebff] p-6 sm:p-8 shadow-xs">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[1.35fr_1fr]">
          {/* Coluna de informações do processo */}
          <div className="space-y-4 z-10">
            <div className="flex items-center gap-3">
              <div className="grid size-11 place-items-center rounded-2xl bg-white text-[#7c3aed] shadow-xs border border-purple-100/80">
                <Calendar className="size-5" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#7c3aed]">
                PROCESSO SELETIVO
              </span>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                {candidaturaDestaque.vagaTitulo}
              </h2>
              <div className="mt-2 flex items-center gap-2">
                <CompanyBrandLogo company={candidaturaDestaque.nomeEmpresa ?? "Empresa"} className="size-6 rounded-lg border-0 shadow-none bg-transparent" />
                <span className="text-sm font-semibold text-slate-700">{candidaturaDestaque.nomeEmpresa ?? "Empresa"}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-600 pt-1">
              <div className="flex items-center gap-1.5">
                <Calendar className="size-4 text-slate-400" />
                <span>{candidaturaDestaque.createdAt ? `Inscrição em ${formatDate(candidaturaDestaque.createdAt)}` : "Inscrição registrada"}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-700">Etapa atual:</span>
                <span>{candidaturaDestaque.etapaAtualDescricao ?? candidaturaDestaque.etapaAtual}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href={`/candidaturas/${candidaturaDestaque.id}`}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#6d28d9] px-6 text-sm font-semibold text-white shadow-xs transition-all hover:bg-[#5b21b6] active:scale-95"
              >
                Acompanhar processo
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href={`/candidaturas/${candidaturaDestaque.id}`}
                className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 shadow-xs transition-all hover:bg-slate-50 active:scale-95"
              >
                Ver detalhes
              </Link>
            </div>
          </div>

          {/* Coluna da Ilustração (Desk com Laptop, post-it e caneca) */}
          <DeskIllustration />
        </div>
      </div>}

      {/* ── 3. Seção: Suas candidaturas ── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight text-slate-900">
            Suas candidaturas
          </h2>
          <Link
            href="/candidaturas"
            className="inline-flex items-center gap-1 text-sm font-semibold text-[#7c3aed] transition-colors hover:text-[#6d28d9]"
          >
            Ver todas
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        {candidaturaDestaque ? <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
          {/* Topo: Logo + Empresa + Título + Tags + Botão */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <CompanyBrandLogo
                company={candidaturaDestaque.nomeEmpresa ?? "Empresa"}
                className="size-14 rounded-2xl shrink-0"
              />
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {candidaturaDestaque.nomeEmpresa ?? "Empresa"}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  {candidaturaDestaque.vagaTitulo}
                </h3>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <StatusBadge status={candidaturaDestaque.status} size="sm" />
                </div>
              </div>
            </div>

            <Link
              href={`/candidaturas/${candidaturaDestaque.id}`}
              className="inline-flex h-9 items-center justify-center gap-1.5 self-start rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 shadow-xs transition-all hover:bg-slate-50 sm:self-center"
            >
              Ver processo
              <ArrowRight className="size-3.5" />
            </Link>
          </div>

          <EtapaTrilha
            etapa={candidaturaDestaque.etapaAtual}
            status={candidaturaDestaque.status}
            etapasVaga={candidaturaDestaque.etapasVaga}
            className="mt-6"
          />
        </div> : <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          Você ainda não possui candidaturas. Explore as vagas disponíveis para acompanhar seus processos aqui.
        </div>}
      </section>

      {/* ── 4. Seção: Vagas para você ── */}
      <section className="space-y-4">
        <div className="flex items-baseline justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-900">
              Vagas para você
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Com base no seu perfil e nas suas preferências.
            </p>
          </div>
          <Link
            href="/vagas"
            className="inline-flex items-center gap-1 text-sm font-semibold text-[#7c3aed] transition-colors hover:text-[#6d28d9]"
          >
            Ver todas
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        {/* Grid com até 3 Cards ou estado vazio */}
        {vagasParaVoce.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
            Nenhuma oportunidade aberta no momento.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {vagasParaVoce.map((vaga) => {
              const isSaved = savedJobs.has(vaga.id)
              return (
                <div
                  key={vaga.id}
                  className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all duration-200 hover:border-slate-300 hover:shadow-md"
                >
                  <div>
                    {/* Topo do Card: Logo + Empresa + Bookmark */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <CompanyBrandLogo company={vaga.empresa} logoUrl={vaga.logoUrl} className="size-11 rounded-xl" />
                        <span className="text-xs font-medium text-slate-500">{vaga.empresa}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleSave(vaga.id)}
                        aria-label="Salvar vaga"
                        className="grid size-8 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                      >
                        <Bookmark
                          className={cn(
                            "size-4 transition-colors",
                            isSaved && "fill-[#7c3aed] text-[#7c3aed]"
                          )}
                        />
                      </button>
                    </div>

                    {/* Título da Vaga */}
                    <Link href={`/vagas?vaga=${encodeURIComponent(vaga.id)}`} className="block mt-3">
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-[#7c3aed] transition-colors line-clamp-1">
                        {vaga.titulo}
                      </h3>
                    </Link>

                    {/* Tags da vaga */}
                    <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                      {vaga.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Localização e Salário */}
                  <div className="mt-5 space-y-2 border-t border-slate-100 pt-3 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <MapPin className="size-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">
                        {vaga.cidade}
                        {vaga.estado ? ` - ${vaga.estado}` : ""}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase className="size-3.5 text-slate-400 shrink-0" />
                      <span className="font-semibold text-slate-700">
                        {formatCurrency(vaga.salario)} / mês
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </PageShell>
  )
}
