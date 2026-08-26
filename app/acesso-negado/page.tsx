import Link from "next/link"
import { ArrowRight, ShieldX } from "lucide-react"
import { SelectaLogo } from "@/components/ui/selecta-logo"

export default function AccessDeniedPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f7f7f5] px-4 py-12">
      <div className="w-full max-w-md rounded-[24px] border border-border bg-background p-7 text-center sm:p-9">
        <div className="flex justify-center"><SelectaLogo /></div>
        <div className="mx-auto mt-8 grid h-14 w-14 place-items-center rounded-2xl bg-danger-subtle text-danger-foreground">
          <ShieldX className="h-6 w-6" />
        </div>
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.14em] text-danger-foreground">Erro 403</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground">Acesso não permitido</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Esta área pertence a outro tipo de conta. Use o ambiente correspondente ao seu perfil.
        </p>
        <Link href="/auth" className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-primary-hover">
          Ir para meu ambiente <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </main>
  )
}
