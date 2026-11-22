"use client"

import { useCallback, useEffect, useState } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import { AnimatePresence, MotionConfig, motion } from "framer-motion"
import { ArrowLeft, ArrowUpRight, Briefcase, Maximize2, MessageCircle, X } from "lucide-react"
import { EntityAvatar } from "@/components/ui/entity-avatar"
import { ChatList } from "./chat-list"
import { ChatConversa, StatusConexao } from "./chat-conversa"
import { useChatSocket, useChats } from "@/lib/queries/use-chat"
import { ROUTES } from "@/lib/config/routes"
import { chatContato, type ChatPerspectiva } from "@/lib/types/chat.types"
import { cn } from "@/lib/utils"

const EASE_OUT = [0.22, 1, 0.36, 1] as const

const ROTAS = {
  candidato: { lista: ROUTES.candidate.messages, chat: ROUTES.candidate.chat, candidatura: ROUTES.candidate.application, candidaturaLabel: "Ver candidatura" },
  empresa: { lista: ROUTES.company.messages, chat: ROUTES.company.chat, candidatura: ROUTES.company.candidate, candidaturaLabel: "Ver candidato" },
} as const

function formatBadge(count: number) {
  return count > 9 ? "9+" : String(count)
}

/** Botão circular da topbar (mesmo formato do sino) */
const ICON_BUTTON =
  "grid size-10 shrink-0 place-items-center rounded-full border border-border bg-card text-strong-foreground transition-colors hover:border-primary/40 hover:bg-primary-subtle hover:text-primary"

/**
 * Ícone de chat da topbar: abre um painel à direita com as conversas e,
 * ao escolher uma, a conversa completa — sem sair da tela atual.
 */
export function ChatDrawerButton({ perspectiva }: { perspectiva: ChatPerspectiva }) {
  const [aberto, setAberto] = useState(false)
  const [ativoId, setAtivoId] = useState<string | null>(null)
  const [montado, setMontado] = useState(false)
  const { naoLidas } = useChats(perspectiva)

  useEffect(() => setMontado(true), [])

  const fechar = useCallback(() => setAberto(false), [])

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        aria-expanded={aberto}
        aria-haspopup="dialog"
        aria-label={naoLidas > 0 ? `Mensagens, ${naoLidas} não lidas` : "Mensagens"}
        className={cn(ICON_BUTTON, "relative", aberto && "border-primary/40 bg-primary-subtle text-primary")}
      >
        <MessageCircle aria-hidden className="size-[18px]" strokeWidth={1.75} />
        {naoLidas > 0 && (
          <span
            aria-hidden
            className="absolute -right-1 -top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none tabular-nums text-primary-foreground ring-2 ring-card"
          >
            {formatBadge(naoLidas)}
          </span>
        )}
      </button>

      {montado &&
        createPortal(
          <ChatDrawer
            aberto={aberto}
            onClose={fechar}
            perspectiva={perspectiva}
            ativoId={ativoId}
            onAtivoChange={setAtivoId}
          />,
          document.body,
        )}
    </>
  )
}

function ChatDrawer({
  aberto,
  onClose,
  perspectiva,
  ativoId,
  onAtivoChange,
}: {
  aberto: boolean
  onClose: () => void
  perspectiva: ChatPerspectiva
  ativoId: string | null
  onAtivoChange: (id: string | null) => void
}) {
  const { chats, naoLidas, loading, error, refetch } = useChats(perspectiva)
  const conexao = useChatSocket(aberto)
  const rotas = ROTAS[perspectiva]
  const ativo = ativoId ? chats.find((chat) => chat.candidaturaId === ativoId) ?? null : null
  const contato = ativo ? chatContato(ativo, perspectiva) : null
  const contatoNome = contato?.nome ?? (perspectiva === "empresa" ? "Candidato" : "Empresa")

  useEffect(() => {
    if (!aberto) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return
      if (ativoId) onAtivoChange(null)
      else onClose()
    }
    document.addEventListener("keydown", onKeyDown)
    const overflowAnterior = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKeyDown)
      document.body.style.overflow = overflowAnterior
    }
  }, [aberto, ativoId, onAtivoChange, onClose])

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence>
        {aberto && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.button
              type="button"
              aria-label="Fechar mensagens"
              tabIndex={-1}
              onClick={onClose}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 cursor-default bg-foreground/25 backdrop-blur-[2px]"
            />

            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Mensagens"
              initial={{ x: "calc(100% + 1rem)", opacity: 0.6 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "calc(100% + 1rem)", opacity: 0.6 }}
              transition={{ duration: 0.38, ease: EASE_OUT }}
              className="relative m-2 flex w-full flex-col overflow-hidden rounded-[28px] border border-border bg-card shadow-overlay sm:m-3 sm:w-[min(27rem,calc(100vw-1.5rem))]"
            >
              <AnimatePresence mode="wait" initial={false}>
                {ativoId ? (
                  <motion.section
                    key={`conversa-${ativoId}`}
                    aria-label={`Conversa com ${contatoNome}`}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 24 }}
                    transition={{ duration: 0.25, ease: EASE_OUT }}
                    className="flex min-h-0 flex-1 flex-col"
                  >
                    <header className="flex items-center gap-3 border-b border-border-subtle px-4 py-3.5">
                      <button type="button" onClick={() => onAtivoChange(null)} aria-label="Voltar para conversas" className={ICON_BUTTON}>
                        <ArrowLeft aria-hidden className="size-4" />
                      </button>
                      <EntityAvatar name={contatoNome} src={contato?.imagemUrl} size="md" className="rounded-full" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold tracking-tight text-foreground">{contatoNome}</p>
                        {ativo?.vagaTitulo && (
                          <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-muted-foreground">
                            <Briefcase aria-hidden className="size-3 shrink-0" />
                            <span className="truncate">{ativo.vagaTitulo}</span>
                          </p>
                        )}
                      </div>
                      <button type="button" onClick={onClose} aria-label="Fechar mensagens" className={ICON_BUTTON}>
                        <X aria-hidden className="size-4" />
                      </button>
                    </header>

                    <div className="flex items-center justify-between gap-2 border-b border-border-subtle px-4 py-2">
                      <StatusConexao conexao={conexao} />
                      <Link
                        href={rotas.candidatura(ativoId)}
                        onClick={onClose}
                        className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary-subtle"
                      >
                        {rotas.candidaturaLabel}
                        <ArrowUpRight aria-hidden className="size-3.5" />
                      </Link>
                    </div>

                    <ChatConversa
                      candidaturaId={ativoId}
                      perspectiva={perspectiva}
                      contatoNome={contatoNome}
                      contatoImagemUrl={contato?.imagemUrl}
                    />
                  </motion.section>
                ) : (
                  <motion.section
                    key="lista"
                    aria-label="Conversas"
                    initial={{ opacity: 0, x: -24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                    transition={{ duration: 0.25, ease: EASE_OUT }}
                    className="flex min-h-0 flex-1 flex-col"
                  >
                    <header className="flex items-center gap-3 px-5 pb-1 pt-5">
                      <div className="min-w-0 flex-1">
                        <h2 className="text-xl font-semibold tracking-tight text-ink">Mensagens</h2>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {loading
                            ? "Carregando…"
                            : naoLidas > 0
                              ? `${naoLidas} ${naoLidas === 1 ? "mensagem não lida" : "mensagens não lidas"}`
                              : "Tudo em dia"}
                        </p>
                      </div>
                      <Link href={rotas.lista} onClick={onClose} aria-label="Abrir página de mensagens" title="Abrir em tela cheia" className={ICON_BUTTON}>
                        <Maximize2 aria-hidden className="size-4" />
                      </Link>
                      <button type="button" onClick={onClose} aria-label="Fechar mensagens" className={ICON_BUTTON}>
                        <X aria-hidden className="size-4" />
                      </button>
                    </header>

                    <ChatList
                      hideTitle
                      chats={chats}
                      naoLidas={naoLidas}
                      loading={loading}
                      error={error}
                      onRetry={() => void refetch()}
                      activeId={null}
                      perspectiva={perspectiva}
                      onSelect={onAtivoChange}
                      className="min-h-0 flex-1"
                    />
                  </motion.section>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </MotionConfig>
  )
}
