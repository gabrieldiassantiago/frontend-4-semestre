"use client"

import { useRef, useState } from "react"
import { FileText, LoaderCircle, Upload, X } from "lucide-react"
import { Field } from "@/components/ui/form-field"
import { Alert } from "@/components/ui/states"
import { uploadCandidateResume, uploadCandidateAvatar } from "@/lib/services/candidate.service"
import type { CandidateProfile } from "@/lib/types/candidate.types"

interface ResumeUploadProps {
  profile: CandidateProfile
  onProfileChange: (profile: CandidateProfile) => void
}

export function ResumeUpload({ profile, onProfileChange }: ResumeUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0]
    if (!file) return

    // Validar se é PDF
    if (file.type !== "application/pdf") {
      setError("Apenas arquivos PDF são permitidos.")
      return
    }

    // Validar tamanho (máximo 10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      setError("O arquivo deve ter no máximo 10 MB.")
      return
    }

    setError(null)
    setSuccess(false)
    setUploading(true)

    console.log("estou fazendo upload do arquivo", file)

    try {
      const updatedProfile = await uploadCandidateResume(file)
      onProfileChange(updatedProfile)
      setSuccess(true)
      // Limpar o input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      // Remover mensagem de sucesso após 3 segundos
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {

    
      
      const errorMessage = err instanceof Error ? err.message : "Falha ao fazer upload do currículo."
      setError(errorMessage)
    } finally {
      setUploading(false)
    }
  }

  const hasResume = !!(profile as any).resumeUrl

  return (
    <div className="max-w-3xl space-y-6">
      <Field
        label="Seu currículo"
        hint="Carregue um arquivo PDF com seu currículo. Máximo 10 MB."
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-lg border-2 border-dashed border-border bg-muted p-4">
            <FileText className="size-5 text-muted-foreground" aria-hidden />
            <div className="flex-1 min-w-0">
              {hasResume ? (
                <>
                  <p className="text-sm font-semibold text-foreground">Currículo enviado ✓</p>
                  <p className="text-xs text-muted-foreground">Clique para substituir</p>
                </>
              ) : (
                <>
                  <p className="text-sm font-semibold text-foreground">Nenhum currículo enviado</p>
                  <p className="text-xs text-muted-foreground">Clique para enviar um arquivo PDF</p>
                </>
              )}
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
            aria-label="Selecionar arquivo de currículo"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="btn-secondary w-full"
          >
            {uploading && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
            {uploading ? "Enviando..." : "Selecionar arquivo PDF"}
          </button>

          {error && (
            <div className="mt-4">
              <Alert tone="danger">{error}</Alert>
            </div>
          )}

          {success && (
            <div className="mt-4">
              <Alert tone="success">Currículo enviado com sucesso!</Alert>
            </div>
          )}

          {hasResume && (
            <div className="text-xs text-muted-foreground">
              💡 Dica: Manter seu currículo atualizado aumenta suas chances de ser encontrado pelas empresas.
            </div>
          )}
        </div>
      </Field>
    </div>
  )
}
