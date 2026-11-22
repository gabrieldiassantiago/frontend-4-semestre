"use client"

import { Fragment, useEffect, useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode } from "react"
import { MotionConfig, motion } from "framer-motion"
import { ArrowUp, Check, CheckCheck, Clock, LoaderCircle, MessageCircle, MessageSquarePlus, Sparkles } from "lucide-react"
import { EntityAvatar } from "@/components/ui/entity-avatar"
import { CardSkeleton, ErrorState } from "@/components/ui/states"
import { useEnviarMensagem, useMarcarLidas, useMensagens, type ChatConexao } from "@/lib/queries/use-chat"
import { getErrorMessage } from "@/lib/errors"
import { CHAT_MAX_CARACTERES, type ChatMensagem, type ChatPerspectiva } from "@/lib/types/chat.types"
import { cn } from "@/lib/utils"

interface ChatConversaProps {
  candidaturaId: string
  perspectiva: ChatPerspectiva
  contatoNome: string
  contatoImagemUrl?: string | null
  className?: string
}

const SUGESTOES_EMPRESA = [
  "Olá! Gostamos do seu perfil e queremos conversar sobre a vaga.",
  "Você tem disponibilidade para uma entrevista nesta semana?",
  "Pode nos enviar seu portfólio ou projetos recentes?",
]

/** Mensagens do mesmo remetente enviadas em até 5 minutos formam um grupo visual. */
const GROUP_WINDOW_MS = 5 * 60 * 1000

const EASE_OUT = [0.22, 1, 0.36, 1] as const

/**
 * Histórico + campo de envio. A API só deixa a empresa enviar a primeira
 * mensagem; até lá o candidato vê a tela de espera.
 */
export function ChatConversa({ candidaturaId, perspectiva, contatoNome, contatoImagemUrl, className }: ChatConversaProps) {
  const { mensagens, loading, error } = useMensagens(candidaturaId)
  const aguardandoEmpresa = perspectiva === "candidato" && !loading && !error && mensagens.length === 0
  const [rascunho, setRascunho] = useState("")

  if (aguardandoEmpresa) {
    return (
      <MotionConfig reducedMotion="user">
        <div className={cn("chat-canvas flex min-h-0 flex-1 flex-col", className)}>
          <AguardandoEmpresa contatoNome={contatoNome} />
        </div>
      </MotionConfig>
    )
  }

  const vazio = !loading && !error && mensagens.length === 0

  return (
    <MotionConfig reducedMotion="user">
      <div className={cn("flex min-h-0 flex-1 flex-col", className)}>
        <Historico
          candidaturaId={candidaturaId}
          perspectiva={perspectiva}
          contatoNome={contatoNome}
          contatoImagemUrl={contatoImagemUrl}
        />
        <ChatComposer
          candidaturaId={candidaturaId}
          texto={rascunho}
          onTextoChange={setRascunho}
          sugestoes={vazio && perspectiva === "empresa" ? SUGESTOES_EMPRESA : undefined}
        />
      </div>
    </MotionConfig>
  )
}

/** Ícone em bloco dos estados vazios da conversa. */
function IconePulsante({ children, tone = "muted" }: { children: ReactNode; tone?: "muted" | "primary" }) {
  return (
    <span className="grid size-14 place-items-center">
      <span
        className={cn(
          "grid size-14 place-items-center rounded-2xl",
          tone === "primary" ? "bg-primary-subtle text-primary" : "bg-card text-muted-foreground ring-1 ring-border",
        )}
      >
        {children}
      </span>
    </span>
  )
}

function AguardandoEmpresa({ contatoNome }: { contatoNome: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: EASE_OUT }}
      className="m-auto flex max-w-xs flex-col items-center px-6 py-10 text-center"
    >
      <IconePulsante>
        <Clock className="size-5" aria-hidden />
      </IconePulsante>
      <p className="mt-5 text-base font-semibold tracking-tight text-foreground">Aguardando a empresa</p>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
        O chat é aberto por {contatoNome}. Assim que a empresa iniciar a conversa, você poderá responder por aqui e em Mensagens.
      </p>
    </motion.div>
  )
}

function Historico({
  candidaturaId,
  perspectiva,
  contatoNome,
  contatoImagemUrl,
}: {
  candidaturaId: string
  perspectiva: ChatPerspectiva
  contatoNome: string
  contatoImagemUrl?: string | null
}) {
  const { mensagens, naoLidas, loading, error, refetch } = useMensagens(candidaturaId)
  const marcarLidas = useMarcarLidas(candidaturaId)
  const fimRef = useRef<HTMLLIElement>(null)
  const primeiraRenderizacao = useRef(true)

  const marcar = marcarLidas.mutate
  // Só dispara quando o total muda, para uma falha no PATCH não virar um loop de tentativas.
  useEffect(() => {
    if (naoLidas > 0) marcar()
  }, [naoLidas, marcar])

  useEffect(() => {
    // Primeira carga vai direto ao fim; mensagens novas rolam suavemente.
    fimRef.current?.scrollIntoView({ block: "end", behavior: primeiraRenderizacao.current ? "auto" : "smooth" })
    primeiraRenderizacao.current = false
  }, [mensagens.length, candidaturaId])

  return (
    <ol
      aria-label="Mensagens"
      aria-live="polite"
      className="chat-canvas flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-5 sm:px-6"
    >
      {loading ? (
        <li>
          <CardSkeleton rows={3} />
        </li>
      ) : error ? (
        <li>
          <ErrorState
            description={error}
            action={
              <button type="button" className="btn-secondary" onClick={() => void refetch()}>
                Tentar novamente
              </button>
            }
          />
        </li>
      ) : mensagens.length === 0 ? (
        <li className="m-auto flex max-w-xs flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: EASE_OUT }}
            className="flex flex-col items-center"
          >
            <IconePulsante tone="primary">
              {perspectiva === "empresa" ? <MessageSquarePlus className="size-5" aria-hidden /> : <MessageCircle className="size-5" aria-hidden />}
            </IconePulsante>
            <p className="mt-5 text-sm font-semibold tracking-tight text-foreground">Comece a conversa</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {perspectiva === "empresa"
                ? `Envie a primeira mensagem para ${contatoNome}. O histórico fica salvo para os dois lados.`
                : "Envie uma mensagem sobre esta candidatura."}
            </p>
          </motion.div>
        </li>
      ) : (
        mensagens.map((mensagem, index) => {
          const anterior = mensagens[index - 1]
          const proxima = mensagens[index + 1]
          const dia = formatDia(mensagem.enviadoEm)
          const novoDia = index === 0 || dia !== formatDia(anterior.enviadoEm)
          const inicioGrupo = novoDia || !mesmoGrupo(anterior, mensagem)
          const fimGrupo = !proxima || formatDia(proxima.enviadoEm) !== dia || !mesmoGrupo(mensagem, proxima)
          return (
            <Fragment key={`${mensagem.enviadoEm}-${index}`}>
              {novoDia && dia && (
                <li role="separator" className="my-5 flex items-center gap-3 first:mt-0">
                  <span aria-hidden className="h-px flex-1 bg-border" />
                  <span className="rounded-full bg-card px-3 py-1 text-[11px] font-medium text-muted-foreground ring-1 ring-border">
                    {dia}
                  </span>
                  <span aria-hidden className="h-px flex-1 bg-border" />
                </li>
              )}
              <MensagemItem
                mensagem={mensagem}
                inicioGrupo={inicioGrupo}
                fimGrupo={fimGrupo}
                contatoNome={contatoNome}
                contatoImagemUrl={contatoImagemUrl}
              />
            </Fragment>
          )
        })
      )}
      <li ref={fimRef} aria-hidden />
    </ol>
  )
}

function mesmoGrupo(a: ChatMensagem, b: ChatMensagem) {
  if (a.enviadoPorSiMesmo !== b.enviadoPorSiMesmo || a.remetente !== b.remetente) return false
  return Math.abs(new Date(b.enviadoEm).getTime() - new Date(a.enviadoEm).getTime()) <= GROUP_WINDOW_MS
}

const CONEXAO_ESTILO = {
  online: { label: "Tempo real", chip: "bg-mint-subtle text-mint-strong", dot: "bg-mint-strong", ping: true },
  conectando: { label: "Conectando", chip: "bg-warning-subtle text-warning-foreground", dot: "bg-warning", ping: false },
  offline: { label: "Offline", chip: "bg-muted text-muted-foreground", dot: "bg-subtle-foreground", ping: false },
} as const

export function StatusConexao({ conexao }: { conexao: ChatConexao }) {
  const config = CONEXAO_ESTILO[conexao]
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors duration-300",
        config.chip,
      )}
    >
      <span aria-hidden className="relative flex size-1.5">
        {config.ping && (
          <span className="absolute inline-flex h-full w-full rounded-full bg-mint-strong opacity-75 motion-safe:animate-ping" />
        )}
        <span className={cn("relative inline-flex size-1.5 rounded-full", config.dot, conexao === "conectando" && "animate-pulse")} />
      </span>
      {config.label}
    </span>
  )
}

function MensagemItem({
  mensagem,
  inicioGrupo,
  fimGrupo,
  contatoNome,
  contatoImagemUrl,
}: {
  mensagem: ChatMensagem
  inicioGrupo: boolean
  fimGrupo: boolean
  contatoNome: string
  contatoImagemUrl?: string | null
}) {
  const minha = mensagem.enviadoPorSiMesmo
  return (
    <li className={cn("flex items-end gap-2", minha ? "justify-end" : "justify-start", inicioGrupo ? "mt-4" : "mt-1")}>
      {!minha && (
        <span className="w-8 shrink-0">
          {fimGrupo && (
            <EntityAvatar
              name={mensagem.remetente || contatoNome}
              src={contatoImagemUrl}
              size="sm"
              className="size-8 rounded-full ring-2 ring-card"
            />
          )}
        </span>
      )}
      <div className={cn("flex max-w-[80%] flex-col gap-1 sm:max-w-[65%]", minha ? "items-end" : "items-start")}>
        {!minha && inicioGrupo && <span className="px-1 text-[11px] font-semibold text-muted-foreground">{mensagem.remetente}</span>}
        <motion.p
          initial={{ opacity: 0, y: 10, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.3, ease: EASE_OUT }}
          className={cn(
            "whitespace-pre-wrap break-words px-3.5 py-2.5 text-sm leading-relaxed",
            minha ? "bubble-mine text-primary-foreground" : "border border-border bg-card text-foreground",
            minha && !inicioGrupo && "rounded-tr-md",
            minha && !fimGrupo && "rounded-br-md",
            minha && fimGrupo && "rounded-br-sm",
            !minha && !inicioGrupo && "rounded-tl-md",
            !minha && !fimGrupo && "rounded-bl-md",
            !minha && fimGrupo && "rounded-bl-sm",
            "rounded-2xl",
          )}
        >
          {mensagem.mensagem}
        </motion.p>
        {fimGrupo && (
          <span className="flex items-center gap-1 px-1 text-[11px] text-subtle-foreground">
            <time dateTime={mensagem.enviadoEm}>{formatHora(mensagem.enviadoEm)}</time>
            {minha &&
              (mensagem.lida ? (
                <CheckCheck aria-label="Lida" className="size-3.5 text-primary" />
              ) : (
                <Check aria-label="Enviada" className="size-3.5" />
              ))}
          </span>
        )}
      </div>
    </li>
  )
}

const SUGESTOES_CONTAINER = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
}

const SUGESTAO_ITEM = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: EASE_OUT } },
}

function ChatComposer({
  candidaturaId,
  texto,
  onTextoChange,
  sugestoes,
}: {
  candidaturaId: string
  texto: string
  onTextoChange: (value: string) => void
  sugestoes?: string[]
}) {
  const [erro, setErro] = useState<string | null>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const enviar = useEnviarMensagem(candidaturaId)
  const conteudo = texto.trim()
  const podeEnviar = conteudo.length > 0 && conteudo.length <= CHAT_MAX_CARACTERES && !enviar.isPending
  const pertoDoLimite = texto.length > CHAT_MAX_CARACTERES * 0.8

  async function submeter(event?: FormEvent) {
    event?.preventDefault()
    if (!podeEnviar) return
    setErro(null)
    try {
      await enviar.mutateAsync(conteudo)
      onTextoChange("")
    } catch (requestError) {
      setErro(getErrorMessage(requestError, "Não foi possível enviar a mensagem."))
    }
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || event.shiftKey) return
    if (event.nativeEvent.isComposing || event.keyCode === 229) return
    event.preventDefault()
    void submeter()
  }

  return (
    <form onSubmit={(event) => void submeter(event)} className="border-t border-border-subtle bg-card/95 px-4 pb-3 pt-3 backdrop-blur sm:px-6">
      {sugestoes && !texto && (
        <motion.div
          variants={SUGESTOES_CONTAINER}
          initial="hidden"
          animate="show"
          className="mb-3 flex gap-2 overflow-x-auto pb-1"
          aria-label="Sugestões de mensagem"
        >
          <span className="flex shrink-0 items-center gap-1 text-[11px] font-semibold text-primary">
            <Sparkles aria-hidden className="size-3.5" />
            Sugestões
          </span>
          {sugestoes.map((sugestao) => (
            <motion.button
              key={sugestao}
              variants={SUGESTAO_ITEM}
              type="button"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                onTextoChange(sugestao)
                inputRef.current?.focus()
              }}
              className="shrink-0 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-strong-foreground transition-colors hover:border-primary/40 hover:bg-primary-subtle hover:text-primary-subtle-foreground"
            >
              {sugestao}
            </motion.button>
          ))}
        </motion.div>
      )}
      {erro && (
        <p role="alert" className="mb-2 text-xs font-medium text-danger-foreground">
          {erro}
        </p>
      )}
      <div className="flex items-end gap-2 rounded-2xl border border-border bg-background py-1.5 pl-3 pr-1.5 transition-[border-color,box-shadow] duration-200 focus-within:border-primary focus-within:shadow-[0_0_0_4px_var(--primary-ring)]">
        <label htmlFor={`chat-${candidaturaId}`} className="sr-only">
          Escreva uma mensagem
        </label>
        <textarea
          ref={inputRef}
          id={`chat-${candidaturaId}`}
          rows={1}
          value={texto}
          maxLength={CHAT_MAX_CARACTERES}
          onChange={(event) => onTextoChange(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Escreva uma mensagem..."
          className="max-h-36 min-h-9 flex-1 resize-none bg-transparent py-2 text-sm leading-relaxed text-foreground outline-none [field-sizing:content] placeholder:text-subtle-foreground"
        />
        <motion.button
          type="submit"
          disabled={!podeEnviar}
          aria-label="Enviar mensagem"
          whileHover={podeEnviar ? { scale: 1.06 } : undefined}
          whileTap={podeEnviar ? { scale: 0.88, rotate: -8 } : undefined}
          transition={{ type: "spring", stiffness: 500, damping: 22 }}
          className="grid size-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground shadow-none transition-[background-color,box-shadow,color] duration-200 hover:bg-primary-hover disabled:bg-muted disabled:text-subtle-foreground"
        >
          {enviar.isPending ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : <ArrowUp className="size-4" aria-hidden />}
        </motion.button>
      </div>
      <p className="mt-1.5 flex justify-between gap-3 px-1 text-[11px] text-subtle-foreground">
        <span className="hidden sm:inline">Enter envia · Shift+Enter quebra linha</span>
        <span className={cn("ml-auto tabular-nums transition-colors", pertoDoLimite ? "font-semibold text-warning-foreground" : "invisible")}>
          {texto.length}/{CHAT_MAX_CARACTERES}
        </span>
      </p>
    </form>
  )
}

function formatHora(value: string) {
  const data = new Date(value)
  if (Number.isNaN(data.getTime())) return ""
  return data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
}

function formatDia(value: string) {
  const data = new Date(value)
  if (Number.isNaN(data.getTime())) return ""
  const hoje = new Date()
  const ontem = new Date(hoje)
  ontem.setDate(hoje.getDate() - 1)
  if (data.toDateString() === hoje.toDateString()) return "Hoje"
  if (data.toDateString() === ontem.toDateString()) return "Ontem"
  return data.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: data.getFullYear() === hoje.getFullYear() ? undefined : "numeric" })
}

export function formatQuando(value?: string) {
  if (!value) return ""
  const data = new Date(value)
  if (Number.isNaN(data.getTime())) return ""
  return new Date().toDateString() === data.toDateString() ? formatHora(value) : formatDia(value)
}
