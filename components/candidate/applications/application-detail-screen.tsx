"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  ArrowUpRight,
  Bookmark,
  Calendar,
  Check,
  CircleAlert,
  Clock,
  LoaderCircle,
  MapPin,
  MoreVertical,
  RefreshCw,
  Share2,
  Trash2,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useCandidatura, revalidarCandidatura } from "@/lib/hooks/useCandidaturas"
import { desistirCandidatura } from "@/lib/services/candidatura.service"
import { getErrorMessage } from "@/lib/errors"
import { formatDate, formatRelativeDate } from "@/lib/format"
import { Modal } from "@/components/ui/modal"
import { ErrorState, Skeleton } from "@/components/ui/states"
import {
  ETAPA_HINTS,
  ETAPA_LABELS,
  STATUS_LABELS,
  isFinalizada,
  type EtapaProcesso,
} from "@/lib/types/candidatura.types"
import { CompanyBrandLogo } from "@/components/candidate/jobs/company-brand-logo"

// Ilustração SVG vetorial de montanha com bandeira no pico
function MountainIllustration() {
  return (
    <svg
      viewBox="0 0 160 90"
      className="h-16 w-28 shrink-0 select-none overflow-visible sm:h-20 sm:w-36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <ellipse cx="28" cy="74" rx="20" ry="10" fill="#ede9fe" fillOpacity="0.8" />
      <ellipse cx="132" cy="76" rx="22" ry="9" fill="#ede9fe" fillOpacity="0.8" />
      <ellipse cx="44" cy="78" rx="16" ry="7" fill="#ede9fe" />

      {/* Montanha secundária à esquerda */}
      <path d="M10 82L42 34L68 82H10Z" fill="#c4b5fd" />
      <path d="M42 34L68 82H42V34Z" fill="#a78bfa" />

      {/* Montanha principal central / direita */}
      <path d="M40 82L86 16L126 82H40Z" fill="#a78bfa" />
      <path d="M86 16L126 82H86V16Z" fill="#8b5cf6" />

      {/* Mastro e Bandeira roxa */}
      <line x1="86" y1="16" x2="86" y2="4" stroke="#6d28d9" strokeWidth="2" strokeLinecap="round" />
      <path d="M86 4L105 10L86 16V4Z" fill="#7c3aed" />

      {/* Pico iluminado */}
      <path d="M86 16L78 28L86 25L94 28L86 16Z" fill="#f5f3ff" />
    </svg>
  )
}

const ETAPAS_VISUAIS = [
  { key: "INSCRICAO", label: "Candidatura" },
  { key: "TRIAGEM", label: "Triagem" },
  { key: "ENTREVISTA", label: "Entrevista" },
  { key: "PROPOSTA", label: "Proposta" },
  { key: "CONTRATACAO", label: "Contratação" },
]

function mapEtapaParaIndiceVisual(etapa: EtapaProcesso): number {
  switch (etapa) {
    case "INSCRICAO":
      return 0
    case "TRIAGEM":
      return 1
    case "ENTREVISTA_RH":
    case "TESTE_TECNICO":
    case "ENTREVISTA_TECNICA":
      return 2
    case "PROPOSTA":
      return 3
    case "CONTRATACAO":
      return 4
    default:
      return 1
  }
}

function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-[1080px] px-4 py-6 sm:px-6 sm:py-8" aria-busy="true">
      <Skeleton className="h-5 w-44" />
      <Skeleton className="mt-6 h-36 rounded-3xl" />
      <Skeleton className="mt-6 h-64 rounded-3xl" />
      <div className="mt-8 space-y-4">
        <Skeleton className="h-6 w-52" />
        <Skeleton className="h-20 rounded-2xl" />
        <Skeleton className="h-20 rounded-2xl" />
      </div>
      <Skeleton className="mt-8 h-28 rounded-3xl" />
    </div>
  )
}

export function ApplicationDetailScreen({ id }: { id: string }) {
  const { detalhe, loading, error, refetch } = useCandidatura(id)

  const [isSaved, setIsSaved] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [desistindo, setDesistindo] = useState(false)
  const [acaoErro, setAcaoErro] = useState<string | null>(null)

  if (loading) return <DetailSkeleton />

  if (error || !detalhe) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20">
        <ErrorState
          title="Não encontramos esta candidatura"
          description={error ?? "Ela pode ter sido removida ou não pertence à sua conta."}
          action={
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              <button type="button" onClick={() => void refetch()} className="btn-secondary">
                <RefreshCw className="size-4" aria-hidden />
                Tentar novamente
              </button>
              <Link href="/candidaturas" className="btn-primary">
                Ver minhas candidaturas
              </Link>
            </div>
          }
        />
      </div>
    )
  }

  const { candidatura, historico } = detalhe
  const company = candidatura.nomeEmpresa ?? "Empresa confidencial"
  const encerrada = isFinalizada(candidatura.status)
  const currentStepIndex = mapEtapaParaIndiceVisual(candidatura.etapaAtual)

  const desistir = async () => {
    setDesistindo(true)
    setAcaoErro(null)
    try {
      await desistirCandidatura(candidatura.id)
      await revalidarCandidatura(candidatura.id)
      setConfirmOpen(false)
    } catch (requestError) {
      setAcaoErro(getErrorMessage(requestError, "Não foi possível cancelar a candidatura."))
    } finally {
      setDesistindo(false)
    }
  }

  // Textos da caixa de status conforme a situação real da candidatura
  const getStatusBoxContent = () => {
    if (candidatura.status === "APROVADA") {
      return {
        title: "Parabéns! Sua candidatura foi aprovada!",
        description:
          candidatura.motivoEncerramento ||
          "A empresa concluiu o processo seletivo e sua contratação foi confirmada.",
      }
    }

    if (candidatura.status === "REPROVADA") {
      return {
        title: "Processo seletivo encerrado",
        description:
          candidatura.motivoEncerramento ||
          "Agradecemos sua participação. A empresa decidiu seguir com outros perfis para esta oportunidade.",
      }
    }

    if (candidatura.status === "CANCELADA") {
      return {
        title: "Candidatura cancelada",
        description:
          candidatura.motivoEncerramento ||
          "Você cancelou sua participação neste processo seletivo.",
      }
    }

    // EM_ANDAMENTO
    const etapaNome = ETAPA_LABELS[candidatura.etapaAtual]?.toLowerCase() || "análise"
    return {
      title: `Sua candidatura está em ${etapaNome}`,
      description:
        candidatura.etapaAtualDescricao ||
        ETAPA_HINTS[candidatura.etapaAtual] ||
        "A empresa está analisando seu perfil e suas informações. Em breve, poderá entrar em contato para as próximas etapas.",
    }
  }

  const statusBox = getStatusBoxContent()

  const formattedInscricaoData = candidatura.createdAt
    ? formatDate(candidatura.createdAt, { day: "numeric", month: "long", year: "numeric" })
    : null

  const formattedShortInscricao = candidatura.createdAt
    ? formatDate(candidatura.createdAt, { day: "numeric", month: "short" })
    : null

  const relativeUpdated = candidatura.updatedAt
    ? `Atualizado ${formatRelativeDate(candidatura.updatedAt)}`
    : candidatura.createdAt
    ? `Inscrito ${formatRelativeDate(candidatura.createdAt)}`
    : "Atualizado recentemente"

  // Monta lista de histórico visual: se não houver histórico gravado no banco, cria o item inicial da inscrição
  const historicoOrdenado =
    historico && historico.length > 0
      ? [...historico].reverse()
      : [
          {
            id: "inicial",
            etapaNova: candidatura.etapaAtual,
            statusNovo: candidatura.status,
            observacao: "Sua candidatura foi enviada com sucesso. Boa sorte!",
            createdAt: candidatura.createdAt,
          },
        ]

  return (
    <div className="mx-auto max-w-[1080px] px-4 py-6 sm:px-6 sm:py-8">
      {/* Voltar para candidaturas */}
      <div className="mb-6">
        <Link
          href="/candidaturas"
          className="group inline-flex items-center gap-2 text-sm font-medium text-[#7c3aed] transition-colors hover:text-[#6d28d9]"
        >
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
          <span>Voltar para candidaturas</span>
        </Link>
      </div>

      {/* Card Cabeçalho da Vaga */}
      <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs sm:p-7">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4 sm:gap-5">
            <CompanyBrandLogo
              company={company}
              className="size-16 rounded-2xl border-slate-100"
            />

            <div className="min-w-0">
              <span className="text-sm font-medium text-slate-500">{company}</span>
              <h1 className="mt-0.5 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {candidatura.vagaTitulo}
              </h1>

              {/* Tags / Badges */}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                  {ETAPA_LABELS[candidatura.etapaAtual]}
                </span>
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
                    candidatura.status === "EM_ANDAMENTO" && "bg-purple-50 text-[#7c3aed]",
                    candidatura.status === "APROVADA" && "bg-emerald-50 text-emerald-700",
                    candidatura.status === "REPROVADA" && "bg-red-50 text-red-700",
                    candidatura.status === "CANCELADA" && "bg-slate-100 text-slate-600"
                  )}
                >
                  {STATUS_LABELS[candidatura.status]}
                </span>
              </div>

              {/* Metadados com ícones */}
              <div className="mt-3.5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <MapPin className="size-3.5 text-slate-400" />
                  <span>Brasil</span>
                </div>
                {formattedInscricaoData && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="size-3.5 text-slate-400" />
                    <span>Inscrita em {formattedInscricaoData}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Botões de Ação à Direita */}
          <div className="flex items-center gap-2 self-start sm:self-center">
            <button
              type="button"
              onClick={() => setIsSaved(!isSaved)}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold shadow-xs transition-colors",
                isSaved
                  ? "border-[#7c3aed] bg-[#f5f3ff] text-[#7c3aed]"
                  : "border-slate-200/90 bg-white text-slate-700 hover:bg-slate-50"
              )}
            >
              <Bookmark className={cn("size-4", isSaved && "fill-current")} />
              <span>{isSaved ? "Vaga salva" : "Salvar vaga"}</span>
            </button>

            {candidatura.vagaId && (
              <Link
                href={`/vaga/${candidatura.vagaId}`}
                className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-slate-200/90 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
              >
                <span>Ver vaga</span>
                <ArrowUpRight className="size-3.5 text-slate-400" />
              </Link>
            )}

            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((prev) => !prev)}
                className="grid size-9 place-items-center rounded-xl border border-slate-200/90 text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                aria-label="Mais opções"
              >
                <MoreVertical className="size-4" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full z-20 mt-2 w-52 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false)
                      if (typeof window !== "undefined") {
                        void navigator.clipboard?.writeText?.(window.location.href)
                      }
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-100"
                  >
                    <Share2 className="size-3.5 text-slate-400" />
                    Copiar link do processo
                  </button>

                  {!encerrada && (
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false)
                        setConfirmOpen(true)
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="size-3.5 text-red-500" />
                      Desistir do processo
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Card do Stepper de Acompanhamento */}
      <section className="mt-6 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs sm:p-8">
        {/* Linha das etapas */}
        <div className="relative overflow-x-auto pb-4 pt-2">
          <div className="flex min-w-[580px] items-center justify-between">
            {ETAPAS_VISUAIS.map((step, idx) => {
              const isCompleted = idx < currentStepIndex
              const isCurrent = idx === currentStepIndex
              const isPending = idx > currentStepIndex

              return (
                <div key={step.key} className="flex flex-1 items-center last:flex-none">
                  {/* Ícone e legendas do ponto */}
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "grid size-8 place-items-center rounded-full transition-all",
                        isCompleted && "bg-[#7c3aed] text-white",
                        isCurrent && !encerrada && "bg-[#7c3aed] ring-4 ring-purple-100",
                        isCurrent && candidatura.status === "APROVADA" && "bg-emerald-600 text-white",
                        isCurrent && candidatura.status === "REPROVADA" && "bg-red-600 text-white",
                        isCurrent && candidatura.status === "CANCELADA" && "bg-slate-400 text-white",
                        isPending && "border-2 border-slate-300 bg-white"
                      )}
                    >
                      {isCompleted ? (
                        <Check className="size-4 stroke-[3]" />
                      ) : isCurrent ? (
                        candidatura.status === "APROVADA" ? (
                          <Check className="size-4 stroke-[3]" />
                        ) : candidatura.status === "REPROVADA" ? (
                          <X className="size-4 stroke-[3]" />
                        ) : (
                          <span className="size-2 rounded-full bg-white" />
                        )
                      ) : null}
                    </div>

                    <div className="mt-3 flex flex-col items-center text-center">
                      <span
                        className={cn(
                          "text-sm font-medium",
                          isCurrent
                            ? "font-bold text-slate-900"
                            : isCompleted
                            ? "font-semibold text-slate-800"
                            : "text-slate-500"
                        )}
                      >
                        {step.label}
                      </span>

                      {idx === 0 && formattedShortInscricao && (
                        <span className="mt-0.5 text-xs text-slate-400">
                          {formattedShortInscricao}
                        </span>
                      )}

                      {isCurrent && (
                        <span
                          className={cn(
                            "mt-0.5 text-xs font-semibold",
                            candidatura.status === "EM_ANDAMENTO" && "text-[#7c3aed]",
                            candidatura.status === "APROVADA" && "text-emerald-700",
                            candidatura.status === "REPROVADA" && "text-red-700",
                            candidatura.status === "CANCELADA" && "text-slate-500"
                          )}
                        >
                          {STATUS_LABELS[candidatura.status]}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Linha horizontal conectora */}
                  {idx < ETAPAS_VISUAIS.length - 1 && (
                    <div
                      className={cn(
                        "mx-3 h-[2px] flex-1 -translate-y-4 rounded-full transition-colors",
                        idx < currentStepIndex ? "bg-[#7c3aed]" : "bg-slate-200"
                      )}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Caixa de destaque da etapa atual */}
        <div className="mt-6 flex items-start gap-4 rounded-2xl bg-[#f5f3ff] p-5 sm:gap-5 sm:p-6">
          <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#ede9fe] text-[#7c3aed]">
            <Clock className="size-6" />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold text-slate-900 sm:text-lg">
              {statusBox.title}
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">
              {statusBox.description}
            </p>
            <p className="mt-3 text-xs font-medium text-slate-400">
              {relativeUpdated}
            </p>
          </div>
        </div>
      </section>

      {/* Histórico da Candidatura */}
      <section className="mt-8">
        <h2 className="text-lg font-bold tracking-tight text-slate-900">
          Histórico da candidatura
        </h2>

        <div className="mt-6">
          <ol className="relative flex flex-col">
            {historicoOrdenado.map((item, idx) => {
              const isLast = idx === historicoOrdenado.length - 1
              const isFirst = idx === 0

              const itemTitle = item.etapaNova
                ? ETAPA_LABELS[item.etapaNova]
                : STATUS_LABELS[item.statusNovo] || "Atualização"

              const itemDate = item.createdAt
                ? formatDate(item.createdAt, {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : ""

              return (
                <li key={item.id} className="relative flex gap-4 pb-8 last:pb-0">
                  {/* Linha vertical conectora */}
                  {!isLast && (
                    <span
                      aria-hidden="true"
                      className="absolute left-[11px] top-6 h-full w-[2px] -translate-x-1/2 bg-slate-200"
                    />
                  )}

                  {/* Ponto indicador */}
                  <div className="relative z-10 flex flex-col items-center">
                    <div
                      className={cn(
                        "grid size-6 place-items-center rounded-full text-white",
                        isFirst ? "bg-[#7c3aed] ring-4 ring-purple-100" : "bg-[#7c3aed]"
                      )}
                    >
                      {!isFirst ? (
                        <Check className="size-3.5 stroke-[3]" />
                      ) : (
                        <span className="size-1.5 rounded-full bg-white" />
                      )}
                    </div>
                  </div>

                  {/* Conteúdo do item de histórico */}
                  <div className="-mt-1 flex-1">
                    <h3 className="text-base font-bold text-slate-900">
                      {itemTitle}
                    </h3>
                    {itemDate && (
                      <time className="mt-0.5 block text-xs text-slate-400">
                        {itemDate}
                      </time>
                    )}
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                      {item.observacao || "Status atualizado pela equipe de recrutamento."}
                    </p>
                  </div>
                </li>
              )
            })}
          </ol>
        </div>
      </section>

      {/* Card Motivacional Inferior */}
      <section className="mt-10 rounded-3xl border border-purple-100/90 bg-[#faf8ff] p-6 sm:p-7">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
            <MountainIllustration />
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Você está no caminho certo!
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Continue acompanhando por aqui. Avisaremos sobre qualquer novidade.
              </p>
            </div>
          </div>

          <div className="w-full rounded-2xl border border-purple-200/50 bg-[#ede9fe]/60 p-4 sm:max-w-xs md:max-w-sm">
            <p className="text-center text-xs font-semibold leading-relaxed text-[#7c3aed] sm:text-left sm:text-[13px]">
              “Grandes oportunidades levam tempo, mas chegam para quem está preparado.”
            </p>
          </div>
        </div>
      </section>

      {/* Modal de confirmação de desistência */}
      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Desistir do processo"
        description="Sua candidatura fica registrada como cancelada e a empresa é avisada. O histórico continua disponível para você."
        size="sm"
        footer={
          <>
            <button
              type="button"
              onClick={() => setConfirmOpen(false)}
              disabled={desistindo}
              className="btn-secondary"
            >
              Continuar no processo
            </button>
            <button
              type="button"
              onClick={() => void desistir()}
              disabled={desistindo}
              className="btn-primary bg-red-600 hover:bg-red-700"
            >
              {desistindo && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
              {desistindo ? "Cancelando" : "Confirmar desistência"}
            </button>
          </>
        }
      >
        <p className="text-sm leading-relaxed text-slate-600">
          Você está no processo de <strong className="font-semibold text-slate-900">{candidatura.vagaTitulo}</strong> na{" "}
          {company}. Essa ação não pode ser desfeita.
        </p>

        {acaoErro && (
          <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <CircleAlert className="mt-0.5 size-4 shrink-0 text-red-600" aria-hidden />
            <p role="alert" className="text-sm font-medium leading-relaxed text-red-600">
              {acaoErro}
            </p>
          </div>
        )}
      </Modal>
    </div>
  )
}
