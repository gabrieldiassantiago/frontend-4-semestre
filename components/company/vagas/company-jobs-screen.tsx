"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { BriefcaseBusiness, Plus, Search } from "lucide-react"

import { useCompanyVagas } from "@/lib/hooks/useCompanyVagas"
import { deleteVaga, updateVaga } from "@/lib/services/vagas.service"
import { getErrorMessage } from "@/lib/errors"
import type { Vaga } from "@/lib/types/vaga.types"
import { PageHeader, PageShell } from "@/components/ui/page"
import { Card } from "@/components/ui/card"
import { InputWithIcon } from "@/components/ui/form-field"
import { Alert, CardSkeleton, EmptyState } from "@/components/ui/states"
import { VagaRow } from "./vaga-row"
import { VagaFormModal } from "./vaga-form-modal"

export function CompanyJobsScreen() {
  const { vagas, companyProfileId, loading, error, refetch } = useCompanyVagas()

  const [query, setQuery] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [vagaToEdit, setVagaToEdit] = useState<Vaga | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return vagas

    return vagas.filter((vaga) =>
      `${vaga.titulo} ${vaga.cidade} ${vaga.estado}`.toLowerCase().includes(term),
    )
  }, [vagas, query])

  const closeModal = () => {
    setModalOpen(false)
    setVagaToEdit(null)
  }

  const handleSuccess = () => {
    closeModal()
    void refetch()
  }

  const handleDelete = async (vaga: Vaga) => {
    if (!window.confirm(`Remover a vaga "${vaga.titulo}" permanentemente?`)) return

    setActionError(null)
    setDeletingId(vaga.id)
    try {
      await deleteVaga(vaga.id)
      void refetch()
    } catch (err) {
      setActionError(getErrorMessage(err, "Erro ao remover a vaga."))
    } finally {
      setDeletingId(null)
    }
  }

  const handleToggleActive = async (vaga: Vaga) => {
    setActionError(null)
    try {
      await updateVaga(vaga.id, { ativa: !vaga.ativa })
      void refetch()
    } catch (err) {
      setActionError(getErrorMessage(err, "Erro ao atualizar a vaga."))
    }
  }

  return (
    <PageShell>
      <PageHeader
        eyebrow="Recrutamento"
        title="Vagas"
        description="Crie e gerencie as oportunidades publicadas pela sua empresa."
        actions={
          <Link href="/empresa/vagas/nova" className="btn-primary">
            <Plus className="size-4" aria-hidden />
            Nova vaga
          </Link>
        }
      />

      <div className="mt-6 flex flex-col gap-3">
        {error && <Alert tone="danger">{error}</Alert>}
        {actionError && <Alert tone="danger">{actionError}</Alert>}
      </div>

      <Card className="mt-6 overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-border-subtle p-4 sm:flex-row sm:items-center sm:px-6">
          <InputWithIcon
            icon={Search}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por título, cidade ou estado"
            aria-label="Buscar vaga"
            wrapperClassName="w-full sm:max-w-md"
          />
          <p className="text-sm text-muted-foreground sm:ml-auto" aria-live="polite">
            <span className="font-bold tabular-nums text-foreground">{filtered.length}</span>{" "}
            {filtered.length === 1 ? "vaga" : "vagas"}
          </p>
        </div>

        {loading ? (
          <div className="p-5">
            <CardSkeleton rows={4} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={BriefcaseBusiness}
              title={query ? "Nenhuma vaga encontrada" : "Nenhuma vaga publicada"}
              description={
                query
                  ? "Tente outro termo de busca ou limpe o filtro."
                  : "Publique sua primeira vaga para começar a receber candidaturas."
              }
              action={
                query ? (
                  <button type="button" onClick={() => setQuery("")} className="btn-secondary">
                    Limpar busca
                  </button>
                ) : (
                  <Link href="/empresa/vagas/nova" className="btn-primary">
                    <Plus className="size-4" aria-hidden />
                    Nova vaga
                  </Link>
                )
              }
              className="border-0 bg-transparent py-8"
            />
          </div>
        ) : (
          <ul className="divide-y divide-border-subtle">
            {filtered.map((vaga) => (
              <li key={vaga.id}>
                <VagaRow
                  vaga={vaga}
                  detailed
                  deleting={deletingId === vaga.id}
                  onEdit={() => {
                    setVagaToEdit(vaga)
                    setModalOpen(true)
                  }}
                  onDelete={() => void handleDelete(vaga)}
                  onToggleActive={() => void handleToggleActive(vaga)}
                />
              </li>
            ))}
          </ul>
        )}
      </Card>

      {modalOpen && companyProfileId && (
        <VagaFormModal
          companyProfileId={companyProfileId}
          vagaToEdit={vagaToEdit}
          onSuccess={handleSuccess}
          onClose={closeModal}
        />
      )}
    </PageShell>
  )
}
