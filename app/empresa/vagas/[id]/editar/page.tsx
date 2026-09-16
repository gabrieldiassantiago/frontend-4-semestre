"use client"

import { RouteSkeleton } from "@/components/ui/route-skeleton"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { AlertCircle, ArrowLeft } from "lucide-react"
import { getVagaById } from "@/lib/services/vagas.service"
import type { Vaga } from "@/lib/types/vaga.types"
import { EditVagaForm } from "@/components/company/vagas/edit-vaga/edit-vaga-form"

export default function EditarVagaPage() {
  const params = useParams<{ id: string }>()
  const id = params?.id

  const [vaga, setVaga] = useState<Vaga | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    setLoading(true)
    getVagaById(id)
      .then(setVaga)
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Erro ao carregar a vaga.")
      })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <RouteSkeleton variant="form" />

  if (error || !vaga) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-5 px-4 text-center">
        <span className="grid size-14 place-items-center rounded-full bg-danger-subtle text-danger-foreground">
          <AlertCircle className="size-7" aria-hidden />
        </span>
        <div>
          <h1 className="text-xl font-bold text-foreground">Vaga não encontrada</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {error ?? "Não foi possível carregar os dados da vaga."}
          </p>
        </div>
        <Link
          href="/empresa/vagas"
          className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
        >
          <ArrowLeft className="size-4" />
          Voltar para minhas vagas
        </Link>
      </div>
    )
  }

  return <EditVagaForm vaga={vaga} />
}
