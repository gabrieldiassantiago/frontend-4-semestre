import { Download, FileArchive } from "lucide-react"

export const metadata = {
  title: "Baixar projeto",
  description: "Baixe o código do projeto em formato ZIP.",
}

export default function DownloadPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <section className="flex w-full max-w-md flex-col items-center gap-6 rounded-3xl border border-border bg-card p-8 text-center shadow-sm">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <FileArchive aria-hidden className="size-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-balance">Baixar projeto</h1>
          <p className="text-sm text-muted-foreground text-pretty">
            Arquivo ZIP com todo o código do frontend, incluindo as melhorias da tela inicial e do fluxo de completar perfil.
          </p>
        </div>
        <a
          href="/frontend.zip"
          download="frontend.zip"
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Download aria-hidden className="size-4" />
          Baixar ZIP
        </a>
      </section>
    </main>
  )
}
