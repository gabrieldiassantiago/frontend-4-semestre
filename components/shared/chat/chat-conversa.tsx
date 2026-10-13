"use client"

import { Fragment, useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react"
import { Check, CheckCheck, Clock, LoaderCircle, MessageCircle, MessageSquarePlus, SendHorizontal } from "lucide-react"
import { CardSkeleton, ErrorState } from "@/components/ui/states"
import { useEnviarMensagem, useMarcarLidas, useMensagens, type ChatConexao } from "@/lib/queries/use-chat"
import { getErrorMessage } from "@/lib/errors"
import { CHAT_MAX_CARACTERES, type ChatMensagem, type ChatPerspectiva } from "@/lib/types/chat.types"
import { cn } from "@/lib/utils"

interface ChatConversaProps {
  candidaturaId: string
  perspectiva: ChatPerspectiva
  contatoNome: string
  className?: string
}

/**
 * Histórico + campo de envio. A API só deixa a empresa enviar a primeira
 * mensagem; até lá o candidato vê a tela de espera.
 */
export function ChatConversa({ candidaturaId, perspectiva, contatoNome, className }: ChatConversaProps) {
  const { mensagens, loading, error } = useMensagens(candidaturaId)
  const aguardandoEmpresa = perspectiva === "candidato" && !loading && !error && mensagens.length === 0

  if (aguardandoEmpresa) {
    return (
      <div className={cn("flex min-h-0 flex-1 flex-col bg-surface", className)}>
        <AguardandoEmpresa contatoNome={contatoNome} />
      </div>
    )
  }

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col", className)}>
      <Historico candidaturaId={candidaturaId} perspectiva={perspectiva} contatoNome={contatoNome} />
      <ChatComposer candidaturaId={candidaturaId} />
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
}: {
  candidaturaId: string
  perspectiva: ChatPerspectiva
  contatoNome: string
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
    <ol aria-label="Mensagens" aria-live="polite" className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto bg-surface px-4 py-5 sm:px-6">
      {loading ? (
        <li><CardSkeleton rows={3} /></li>
      ) : error ? (
        <li>
          <ErrorState
            description={error}
            action={<button type="button" className="btn-secondary" onClick={() => void refetch()}>Tentar novamente</button>}
          />
        </li>
      ) : mensagens.length === 0 ? (
        <li className="m-auto max-w-xs text-center">
          {perspectiva === "empresa" ? (
            <MessageSquarePlus className="mx-auto size-8 text-subtle-foreground" aria-hidden />
          ) : (
            <MessageCircle className="mx-auto size-8 text-subtle-foreground" aria-hidden />
          )}
          <p className="mt-3 text-sm font-semibold text-foreground">Nenhuma mensagem ainda</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {perspectiva === "empresa"
              ? `Envie a primeira mensagem para iniciar o chat com ${contatoNome}. O histórico fica salvo para os dois lados.`
              : "Envie uma mensagem sobre esta candidatura."}
          </p>
        </li>
      ) : (
        mensagens.map((mensagem, index) => {
          const dia = formatDia(mensagem.enviadoEm)
          const novoDia = index === 0 || dia !== formatDia(mensagens[index - 1].enviadoEm)
          return (
            <Fragment key={`${mensagem.enviadoEm}-${index}`}>
              {novoDia && dia && (
                <li role="separator" className="my-1 flex items-center gap-3">
                  <span aria-hidden className="h-px flex-1 bg-border" />
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-subtle-foreground">{dia}</span>
                  <span aria-hidden className="h-px flex-1 bg-border" />
                </li>
              )}
              <MensagemItem mensagem={mensagem} />
            </Fragment>
          )
        })
      )}
      <li ref={fimRef} aria-hidden />
    </ol>
  )
}

export function StatusConexao({ conexao }: { conexao: ChatConexao }) {
  const config = {
    online: { label: "Tempo real", dot: "bg-success" },
    conectando: { label: "Conectando", dot: "bg-warning animate-pulse" },
    offline: { label: "Offline", dot: "bg-subtle-foreground" },
  }[conexao]
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
      <span aria-hidden className={cn("size-1.5 rounded-full", config.dot)} />
      {config.label}
    </span>
  )
}

function MensagemItem({ mensagem }: { mensagem: ChatMensagem }) {
  const minha = mensagem.enviadoPorSiMesmo
  return (
    <li className={cn("flex", minha ? "justify-end" : "justify-start")}>
      <div className={cn("flex max-w-[85%] flex-col gap-1 sm:max-w-[70%]", minha ? "items-end" : "items-start")}>
        {!minha && <span className="px-1 text-[11px] font-semibold text-muted-foreground">{mensagem.remetente}</span>}
        <p
          className={cn(
            "whitespace-pre-wrap break-words rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
            minha ? "rounded-br-md bg-primary text-primary-foreground" : "rounded-bl-md border border-border bg-card text-foreground",
          )}
        >
          {mensagem.mensagem}
        </p>
        <span className="flex items-center gap-1 px-1 text-[11px] text-subtle-foreground">
          <time dateTime={mensagem.enviadoEm}>{formatHora(mensagem.enviadoEm)}</time>
          {minha &&
            (mensagem.lida ? (
              <CheckCheck aria-label="Lida" className="size-3.5 text-primary" />
            ) : (
              <Check aria-label="Enviada" className="size-3.5" />
            ))}
        </span>
      </div>
    </li>
  )
}

function ChatComposer({ candidaturaId }: { candidaturaId: string }) {
  const [texto, setTexto] = useState("")
  const [erro, setErro] = useState<string | null>(null)
  const enviar = useEnviarMensagem(candidaturaId)
  const conteudo = texto.trim()
  const podeEnviar = conteudo.length > 0 && conteudo.length <= CHAT_MAX_CARACTERES && !enviar.isPending

  async function submeter(event?: FormEvent) {
    event?.preventDefault()
    if (!podeEnviar) return
    setErro(null)
    try {
      await enviar.mutateAsync(conteudo)
      setTexto("")
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
      {erro && <p role="alert" className="mb-2 text-xs font-medium text-danger-foreground">{erro}</p>}
      <div className="flex items-end gap-2 rounded-xl border border-border bg-background p-2 transition-colors focus-within:border-primary">
        <label htmlFor={`chat-${candidaturaId}`} className="sr-only">Escreva uma mensagem</label>
        <textarea
          id={`chat-${candidaturaId}`}
          rows={1}
          value={texto}
          maxLength={CHAT_MAX_CARACTERES}
          onChange={(event) => setTexto(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Escreva uma mensagem..."
          className="max-h-32 min-h-10 flex-1 resize-none bg-transparent px-2 py-2.5 text-sm leading-relaxed text-foreground outline-none placeholder:text-subtle-foreground"
        />
        <button type="submit" disabled={!podeEnviar} aria-label="Enviar mensagem" className="btn-primary min-h-10 shrink-0 px-3.5">
          {enviar.isPending ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : <SendHorizontal className="size-4" aria-hidden />}
        </button>
      </div>
      <p className="mt-1.5 flex justify-between text-[11px] text-subtle-foreground">
        <span>Enter envia · Shift+Enter quebra linha</span>
        <span className="tabular-nums">{texto.length}/{CHAT_MAX_CARACTERES}</span>
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
