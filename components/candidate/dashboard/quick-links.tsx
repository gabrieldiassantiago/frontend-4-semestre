import Link from "next/link"
import { Bell, ChevronRight, MessageCircle, UserRound } from "lucide-react"
import { ROUTES } from "@/lib/config/routes"

const LINKS = [
  { href: ROUTES.candidate.messages, label: "Mensagens", hint: "Converse com as empresas", icon: MessageCircle },
  { href: ROUTES.candidate.notifications, label: "Notificações", hint: "Atualizações dos processos", icon: Bell },
  { href: ROUTES.candidate.profile, label: "Meu perfil", hint: "Como as empresas te veem", icon: UserRound },
] as const

export function QuickLinks() {
  return (
    <nav aria-label="Atalhos" className="overflow-hidden rounded-2xl border border-border/70 bg-card p-2">
      <h2 className="px-3 pb-2 pt-3 text-sm font-semibold tracking-tight">Tudo ao seu alcance</h2>
      <ul className="divide-y divide-border-subtle">
        {LINKS.map(({ href, label, hint, icon: Icon }) => (
          <li key={href}>
            <Link
              href={href}
              className="group flex items-center gap-3 rounded-lg px-3 py-4 transition-colors hover:bg-primary-subtle/50 focus-visible:bg-primary-subtle"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted text-strong-foreground transition-colors group-hover:bg-primary-subtle group-hover:text-primary-subtle-foreground">
                <Icon aria-hidden className="size-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-foreground">{label}</span>
                <span className="block truncate text-xs text-muted-foreground">{hint}</span>
              </span>
              <ChevronRight
                aria-hidden
                className="size-4 shrink-0 text-subtle-foreground transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
