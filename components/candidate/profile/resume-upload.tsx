"use client"

import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { CheckCircle2, ExternalLink, FileText, LoaderCircle, Upload } from "lucide-react"
import { Alert } from "@/components/ui/states"
import { uploadCandidateResume } from "@/lib/services/candidate.service"
import { API_BASE_URL } from "@/lib/http/config"
import { getErrorMessage } from "@/lib/errors"
import { validateResume } from "@/lib/utils/resume"
import { cn } from "@/lib/utils"
import type { CandidateProfile } from "@/lib/types/candidate.types"

interface ResumeUploadProps {
  profile: CandidateProfile
  onProfileChange: (profile: CandidateProfile) => void
  onUploadingChange?: (uploading: boolean) => void
}

function resumeLink(value?: string) {
  if (!value) return null
  try {
    const url = new URL(value, `${API_BASE_URL}/`)
    return ["https:", "http:"].includes(url.protocol) ? url.href : null
  } catch {
    return null
  }
}

export function ResumeUpload({ profile, onProfileChange, onUploadingChange }: ResumeUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const uploadLock = useRef(false)
  const reduceMotion = useReducedMotion()
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!file) return
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  async function upload(selected: File) {
    if (uploadLock.current) return
    uploadLock.current = true
    setUploading(true)
    onUploadingChange?.(true)
    setError(null)
    try {
      const validationError = await validateResume(selected)
      if (validationError) {
        setError(validationError)
        return
      }
      setFile(selected)
      setSaved(false)
      const updated = await uploadCandidateResume(selected)
      onProfileChange(updated)
      setSaved(true)
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Não foi possível enviar o PDF. Tente novamente."))
    } finally {
      uploadLock.current = false
      setUploading(false)
      onUploadingChange?.(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  const source = previewUrl || resumeLink(profile.resumeUrl)

  return (
    <div className="min-w-0 space-y-5">
      <input ref={inputRef} type="file" accept=".pdf,application/pdf" className="sr-only" tabIndex={-1}
        aria-label="Selecionar currículo em PDF" disabled={uploading}
        onChange={(event) => { const selected = event.target.files?.[0]; if (selected) void upload(selected) }} />
      <motion.button type="button" disabled={uploading}
        whileHover={reduceMotion || uploading ? undefined : { y: -2 }}
        whileTap={reduceMotion || uploading ? undefined : { scale: 0.99 }}
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => { event.preventDefault(); if (!uploading) setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault()
          setDragging(false)
          const selected = event.dataTransfer.files[0]
          if (selected) void upload(selected)
        }}
        className={cn("flex w-full flex-col items-center gap-3 rounded-2xl border-2 border-dashed px-5 py-8 text-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary disabled:opacity-60", dragging ? "border-primary bg-primary-subtle" : "border-border-strong bg-muted/50 hover:border-primary hover:bg-primary-subtle/50")}>
        <span className="grid size-12 place-items-center rounded-2xl bg-primary-subtle text-primary">
          {uploading ? <LoaderCircle className="size-6 animate-spin" aria-hidden /> : <Upload className="size-6" aria-hidden />}
        </span>
        <span className="text-base font-semibold">{uploading ? "Enviando seu currículo…" : source ? "Quer atualizar seu currículo?" : "Seu próximo passo pode estar neste PDF"}</span>
        <span className="text-sm text-muted-foreground">{uploading ? "Aguarde a confirmação antes de continuar." : "Escolha um arquivo ou arraste ele para cá."}</span>
        <span className="text-xs text-muted-foreground">Somente PDF · até 10 MB</span>
      </motion.button>

      <div aria-live="polite" className="space-y-3">
        {error && <Alert tone="danger">{error}</Alert>}
        {error && file && !saved && <button type="button" disabled={uploading} onClick={() => void upload(file)} className="btn-secondary">Tentar enviar novamente</button>}
        {saved && <p className="flex items-center gap-2 text-sm text-success-foreground"><CheckCircle2 className="size-4" aria-hidden />Currículo salvo no seu perfil.</p>}
      </div>

      <AnimatePresence initial={false}>
        {source && <motion.section key="pdf-preview" initial={{ opacity: 0, y: reduceMotion ? 0 : 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduceMotion ? 0 : 0.25 }} className="overflow-hidden rounded-2xl border border-border bg-card" aria-label="Pré-visualização do currículo">
          <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
            <FileText className="size-5 shrink-0 text-primary" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{file?.name || "Seu currículo.pdf"}</p>
              <p className="mt-1 text-xs text-muted-foreground">{file ? `${(file.size / 1024 / 1024).toFixed(2)} MB · ` : ""}{uploading ? "Enviando" : file && !saved ? "Prévia local · ainda não enviado" : "PDF anexado"}</p>
            </div>
            <a href={source} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 text-xs font-semibold text-primary">Abrir PDF<ExternalLink className="size-3.5" aria-hidden /></a>
          </div>
          <object data={source} type="application/pdf" aria-label="Conteúdo do currículo em PDF" className="h-[420px] w-full bg-muted sm:h-[540px]">
            <div className="p-8 text-center text-sm text-muted-foreground">Seu navegador não oferece prévia de PDF aqui. Use “Abrir PDF” para visualizar o arquivo.</div>
          </object>
        </motion.section>}
      </AnimatePresence>
    </div>
  )
}
