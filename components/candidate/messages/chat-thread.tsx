import {
  ArrowLeft,
  Briefcase,
  CheckCheck,
  FileText,
  MoreVertical,
  Paperclip,
  SendHorizontal,
  Smile,
  Sparkles,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { EntityAvatar } from "@/components/ui/entity-avatar"
import { cn } from "@/lib/utils"
import type { ChatMessage, Conversation } from "./messages-data"

const QUICK_REPLIES = ["Obrigado pelo retorno!", "Qual o próximo passo?", "Posso enviar meu portfólio"]

export function ChatThread({
  conversation,
  messages,
  className,
}: {
  conversation: Conversation
  messages: ChatMessage[]
  className?: string
}) {
  return (
    <section aria-label={`Conversa com ${conversation.company}`} className={cn("flex min-h-0 min-w-0 flex-col bg-card", className)}>
      <header className="flex items-center gap-3 border-b border-border-subtle px-4 py-3 sm:px-6">
        <button
          type="button"
          aria-label="Voltar para conversas"
          className="grid size-10 shrink-0 place-items-center rounded-lg text-strong-foreground transition-colors hover:bg-muted lg:hidden"
        >
          <ArrowLeft aria-hidden className="size-5" />
        </button>
        <EntityAvatar name={conversation.company} size="md" />
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 truncate text-sm font-semibold text-foreground">
            {conversation.recruiter}
            <span className="font-normal text-subtle-foreground">·</span>
            <span className="truncate font-medium text-muted-foreground">{conversation.company}</span>
          </p>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            {conversation.online && <span aria-hidden className="size-1.5 rounded-full bg-success" />}
            {conversation.online ? "Online agora" : "Visto recentemente"}
          </p>
        </div>
        <a href="#" className="btn-secondary hidden min-h-10 md:inline-flex">
          <Briefcase aria-hidden className="size-4" />
          Ver vaga
        </a>
        <button
          type="button"
          aria-label="Mais opções"
          className="grid size-10 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <MoreVertical aria-hidden className="size-5" />
        </button>
      </header>

      <div className="flex items-center gap-3 border-b border-border-subtle bg-muted px-4 py-2.5 sm:px-6">
        <span className="truncate text-xs font-medium text-muted-foreground">
          Sobre a vaga <span className="font-semibold text-strong-foreground">{conversation.role}</span>
        </span>
        <Badge variant="primary" size="sm" className="ml-auto">
          Entrevista técnica
        </Badge>
      </div>

      <ol aria-label="Mensagens" className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto bg-surface px-4 py-6 sm:px-6">
        {messages.map((message) => (
          <MessageItem key={message.id} message={message} />
        ))}
        <li className="flex items-end gap-2" aria-label={`${conversation.recruiter} está digitando`}>
          <span className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-border bg-card px-4 py-3 shadow-card">
            <span aria-hidden className="size-1.5 animate-bounce rounded-full bg-subtle-foreground" />
            <span aria-hidden className="size-1.5 animate-bounce rounded-full bg-subtle-foreground [animation-delay:120ms]" />
            <span aria-hidden className="size-1.5 animate-bounce rounded-full bg-subtle-foreground [animation-delay:240ms]" />
          </span>
        </li>
      </ol>

      <footer className="border-t border-border-subtle bg-card px-4 py-3 sm:px-6 sm:py-4">
        <div className="no-scrollbar -mx-1 mb-3 flex gap-2 overflow-x-auto px-1">
          <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-subtle-foreground">
            <Sparkles aria-hidden className="size-3.5" />
            Sugestões
          </span>
          {QUICK_REPLIES.map((reply) => (
            <button
              key={reply}
              type="button"
              className="shrink-0 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-strong-foreground transition-colors hover:border-border-strong hover:bg-muted"
            >
              {reply}
            </button>
          ))}
        </div>
        <form className="flex items-end gap-2 rounded-xl border border-border bg-background p-2 transition-colors focus-within:border-primary focus-within:ring-3 focus-within:ring-primary/10">
          <button
            type="button"
            aria-label="Anexar arquivo"
            className="grid size-10 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Paperclip aria-hidden className="size-[18px]" />
          </button>
          <label htmlFor="chat-message" className="sr-only">
            Escreva uma mensagem
          </label>
          <textarea
            id="chat-message"
            rows={1}
            placeholder="Escreva uma mensagem..."
            className="max-h-32 min-h-10 flex-1 resize-none bg-transparent py-2.5 text-sm leading-relaxed text-foreground outline-none placeholder:text-subtle-foreground"
          />
          <button
            type="button"
            aria-label="Inserir emoji"
            className="hidden size-10 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:grid"
          >
            <Smile aria-hidden className="size-[18px]" />
          </button>
          <button type="button" aria-label="Enviar mensagem" className="btn-primary min-h-10 shrink-0 px-3.5">
            <SendHorizontal aria-hidden className="size-4" />
            <span className="hidden sm:inline">Enviar</span>
          </button>
        </form>
      </footer>
    </section>
  )
}

function MessageItem({ message }: { message: ChatMessage }) {
  if (message.kind === "date") {
    return (
      <li className="my-2 flex items-center gap-3" role="separator">
        <span aria-hidden className="h-px flex-1 bg-border" />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-subtle-foreground">{message.label}</span>
        <span aria-hidden className="h-px flex-1 bg-border" />
      </li>
    )
  }

  if (message.kind === "event") {
    return (
      <li className="flex justify-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-success-border bg-success-subtle px-3 py-1.5 text-xs font-semibold text-success-foreground">
          <span aria-hidden className="size-1.5 rounded-full bg-success" />
          {message.text}
        </span>
      </li>
    )
  }

  const mine = message.from === "me"

  return (
    <li className={cn("flex", mine ? "justify-end" : "justify-start")}>
      <div className={cn("flex max-w-[85%] flex-col gap-1 sm:max-w-[70%]", mine ? "items-end" : "items-start")}>
        {message.kind === "text" ? (
          <p
            className={cn(
              "rounded-2xl px-4 py-2.5 text-sm leading-relaxed text-pretty",
              mine
                ? "rounded-br-md bg-primary text-primary-foreground"
                : "rounded-bl-md border border-border bg-card text-foreground shadow-card",
            )}
          >
            {message.text}
          </p>
        ) : (
          <a
            href="#"
            className={cn(
              "flex items-center gap-3 rounded-2xl border bg-card p-3 pr-4 shadow-card transition-colors hover:border-border-strong",
              mine ? "rounded-br-md border-primary/30" : "rounded-bl-md border-border",
            )}
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-danger-subtle text-danger-foreground">
              <FileText aria-hidden className="size-5" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-foreground">{message.name}</span>
              <span className="block text-xs text-muted-foreground">PDF · {message.size}</span>
            </span>
          </a>
        )}
        <span className="flex items-center gap-1 px-1 text-[11px] text-subtle-foreground">
          {message.time}
          {mine && (
            <CheckCheck
              aria-label={message.read ? "Lida" : "Enviada"}
              className={cn("size-3.5", message.read ? "text-primary" : "text-subtle-foreground")}
            />
          )}
        </span>
      </div>
    </li>
  )
}
