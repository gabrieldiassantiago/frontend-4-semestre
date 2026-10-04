import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { PageHeader, PageShell } from "@/components/ui/page"
import { EmptyState } from "@/components/ui/states"

/** Tela padrão para áreas que ainda não têm conteúdo (mensagens, notificações...). */
export function ComingSoonScreen({
  title,
  description,
  icon,
  emptyTitle,
  emptyDescription,
  action,
}: {
  title: string
  description: string
  icon: LucideIcon
  emptyTitle: string
  emptyDescription: string
  action: { href: string; label: string; icon?: LucideIcon }
}) {
  const ActionIcon = action.icon
  return (
    <PageShell className="max-w-5xl">
      <PageHeader title={title} description={description} />
      <EmptyState
        icon={icon}
        title={emptyTitle}
        description={emptyDescription}
        className="mt-8 py-16 sm:py-20"
        action={
          <Link href={action.href} className="btn-primary">
            {ActionIcon && <ActionIcon aria-hidden className="size-4" />}
            {action.label}
          </Link>
        }
      />
    </PageShell>
  )
}
