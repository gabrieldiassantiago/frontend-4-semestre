"use client"

import { Fragment, useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react"
import { ArrowUp, Check, CheckCheck, Clock, LoaderCircle, MessageCircle, MessageSquarePlus } from "lucide-react"
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
      <div className={cn("flex min-h-0 flex-1 flex-col bg-surface", className)}>
        <AguardandoEmpresa contatoNome={contatoNome} />
      </div>
    )
  }

  const vazio = !loading && !error && mensagens.length === 0

  return (
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
  )
}

function AguardandoEmpresa({ contatoNome }: { contatoNome: string }) {
  return (
    <div className="m-auto flex max-w-xs flex-col items-center px-6 py-10 text-center">
      <span className="grid size-12 place-items-center rounded-2xl bg-muted text-muted-foreground">
        <Clock className="size-5" aria-hidden />
      </span>
      <p className="mt-4 text-base font-semibold text-foreground">Aguardando a empresa</p>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
        O chat é aberto por {contatoNome}. Assim que a empresa iniciar a conversa, você poderá responder por aqui e em Mensagens.
      </p>
    </div>
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

  const marcar = marcarLidas.mutate
  // Só dispara quando o total muda, para uma falha no PATCH não virar um loop de tentativas.
  useEffect(() => {
    if (naoLidas > 0) marcar()
  }, [naoLidas, marcar])

  useEffect(() => {
    fimRef.current?.scrollIntoView({ block: "end" })
  }, [mensagens.length, candidaturaId])

  return (
    <ol aria-label="Mensagens" aria-live="polite" className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-surface px-4 py-5 sm:px-6">
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
          <span className="grid size-12 place-items-center rounded-2xl bg-primary-subtle text-primary">
            {perspectiva === "empresa" ? (
              <MessageSquarePlus className="size-5" aria-hidden />
            ) : (
              <MessageCircle className="size-5" aria-hidden />
            )}
          </span>
          <p className="mt-4 text-sm font-semibold text-foreground">Comece a conversa</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {perspectiva === "empresa"
              ? `Envie a primeira mensagem para ${contatoNome}. O histórico fica salvo para os dois lados.`
              : "Envie uma mensagem sobre esta candidatura."}
          </p>
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
                <li role="separator" className="my-4 flex justify-center first:mt-0">
                  <span className="rounded-full border border-border bg-card px-3 py-1 text-[11px] font-semibold text-muted-foreground">
                    {dia}
                  </span>
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

export function StatusConexao({ conexao }: { conexao: ChatConexao }) {
  const config = {
    online: { label: "Tempo real", dot: "bg-success" },
    conectando: { label: "Conectando", dot: "bg-warning animate-pulse" },
    offline: { label: "Offline", dot: "bg-subtle-foreground" },
  }[conexao]
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground">
      <span aria-hidden className={cn("size-1.5 rounded-full", config.dot)} />
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
    <li className={cn("flex items-end gap-2", minha ? "justify-end" : "justify-start", inicioGrupo ? "mt-3" : "mt-0.5")}>
      {!minha && (
        <span className="w-8 shrink-0">
          {fimGrupo && (
            <EntityAvatar name={mensagem.remetente || contatoNome} src={contatoImagemUrl} size="sm" className="size-8 rounded-full" />
          )}
        </span>
      )}
      <div className={cn("flex max-w-[80%] flex-col gap-1 sm:max-w-[65%]", minha ? "items-end" : "items-start")}>
        {!minha && inicioGrupo && <span className="px-1 text-[11px] font-semibold text-muted-foreground">{mensagem.remetente}</span>}
        <p
          className={cn(
            "whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-sm leading-relaxed",
            minha ? "bg-primary text-primary-foreground" : "border border-border bg-card text-foreground",
            minha && !inicioGrupo && "rounded-tr-md",
            minha && !fimGrupo && "rounded-br-md",
            minha && fimGrupo && "rounded-br-sm",
            !minha && !inicioGrupo && "rounded-tl-md",
            !minha && !fimGrupo && "rounded-bl-md",
            !minha && fimGrupo && "rounded-bl-sm",
          )}
        >
          {mensagem.mensagem}
        </p>
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
    <form onSubmit={(event) => void submeter(event)} className="border-t border-border-subtle bg-card px-4 py-3 sm:px-6">
      {sugestoes && !texto && (
        <div className="mb-3 flex gap-2 overflow-x-auto pb-1" aria-label="Sugestões de mensagem">
          {sugestoes.map((sugestao) => (
            <button
              key={sugestao}
              type="button"
              onClick={() => {
                onTextoChange(sugestao)
                inputRef.current?.focus()
              }}
              className="shrink-0 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-strong-foreground transition-colors hover:border-primary/40 hover:bg-primary-subtle"
            >
              {sugestao}
            </button>
          ))}
        </div>
      )}
      {erro && (
        <p role="alert" className="mb-2 text-xs font-medium text-danger-foreground">
          {erro}
        </p>
      )}
      <div className="flex items-end gap-2 rounded-2xl border border-border bg-background py-1.5 pl-3 pr-1.5 transition-colors focus-within:border-primary focus-within:shadow-[0_0_0_3px_var(--primary-ring)]">
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
        <button
          type="submit"
          disabled={!podeEnviar}
          aria-label="Enviar mensagem"
          className="grid size-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary-hover disabled:bg-muted disabled:text-subtle-foreground"
        >
          {enviar.isPending ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : <ArrowUp className="size-4" aria-hidden />}
        </button>
      </div>
      <p className="mt-1.5 flex justify-between gap-3 px-1 text-[11px] text-subtle-foreground">
        <span className="hidden sm:inline">Enter envia · Shift+Enter quebra linha</span>
        <span className={cn("ml-auto tabular-nums", pertoDoLimite ? "font-semibold text-warning-foreground" : "invisible")}>
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
