import Link from "next/link"
import { ArrowUpRight, Bell, MessageCircle, UserRound } from "lucide-react"
import { ROUTES } from "@/lib/config/routes"

const LINKS = [
  { href: ROUTES.candidate.messages, label: "Mensagens", hint: "Converse com as empresas", icon: MessageCircle },
  { href: ROUTES.candidate.notifications, label: "Notificações", hint: "Atualizações dos processos", icon: Bell },
  { href: ROUTES.candidate.profile, label: "Meu perfil", hint: "Como as empresas te veem", icon: UserRound },
] as const

export function QuickLinks() {
  return (
    <nav aria-label="Atalhos" className="rounded-[28px] border border-border/60 bg-card p-2">
      <h2 className="px-4 pb-3 pt-4 text-sm font-semibold tracking-tight">Tudo ao seu alcance</h2>
      <ul className="flex flex-col gap-1.5">
        {LINKS.map(({ href, label, hint, icon: Icon }) => (
          <li key={href}>
            <Link
              href={href}
              className="group flex items-center gap-3 rounded-[20px] bg-surface px-3 py-3 transition-colors hover:bg-muted"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-full border border-border bg-card text-strong-foreground">
                <Icon aria-hidden strokeWidth={1.75} className="size-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-foreground">{label}</span>
                <span className="block truncate text-xs text-muted-foreground">{hint}</span>
              </span>
              <ArrowUpRight
                aria-hidden
                strokeWidth={1.75}
                className="mr-1 size-4 shrink-0 text-subtle-foreground transition-colors group-hover:text-primary"
              />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
