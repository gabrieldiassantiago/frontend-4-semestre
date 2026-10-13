import { ChatThread } from "./chat-thread"
import { ConversationList } from "./conversation-list"
import { ACTIVE_THREAD, CONVERSATIONS } from "./messages-data"

export function MessagesScreen() {
  const active = CONVERSATIONS[0]

  return (
    <main className="mx-auto w-full max-w-[1280px] lg:px-8 lg:py-6">
      <h1 className="sr-only">Mensagens</h1>
      <div className="flex h-[calc(100dvh-8rem-env(safe-area-inset-bottom))] overflow-hidden border-border bg-card lg:h-[calc(100dvh-7rem)] lg:rounded-card lg:border lg:shadow-card">
        <ConversationList
          conversations={CONVERSATIONS}
          activeId={active.id}
          className="hidden w-[340px] shrink-0 border-r lg:flex"
        />
        <ChatThread conversation={active} messages={ACTIVE_THREAD} className="flex-1" />
      </div>
    </main>
  )
}
