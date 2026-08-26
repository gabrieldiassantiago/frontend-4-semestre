import Link from "next/link"
import { SearchX } from "lucide-react"
import { SelectaLogo } from "@/components/ui/selecta-logo"

export default function VagaNaoEncontrada() {
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center px-4 sm:px-6">
          <Link href="/" aria-label="Selecta — página inicial">
            <SelectaLogo />
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        <span className="grid size-14 place-items-center rounded-2xl bg-primary-subtle text-primary-subtle-foreground">
          <SearchX className="size-6" aria-hidden />
        </span>

        <h1 className="mt-5 text-xl font-bold tracking-tight text-foreground text-balance">
          Esta vaga não está mais disponível
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
          O link pode ter expirado ou a empresa removeu a publicação. Veja outras oportunidades
          abertas agora.
        </p>

        <Link href="/dashboard" className="btn-primary mt-7">
          Explorar vagas
        </Link>
      </main>
    </div>
  )
}
