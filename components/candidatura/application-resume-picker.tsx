"use client"

import { useRef, useState } from "react"
import { FileText, Upload, X } from "lucide-react"
import { Alert } from "@/components/ui/states"
import { validateResume } from "@/lib/utils/resume"
import { cn } from "@/lib/utils"

export type ResumeSelection = { source: "profile"; url: string } | { source: "file"; file: File } | null

export function ApplicationResumePicker({ existingUrl, value, onChange, onBusyChange }: { existingUrl?: string; value: ResumeSelection; onChange: (value: ResumeSelection) => void; onBusyChange: (busy: boolean) => void }) {
  const [error, setError] = useState<string | null>(null)
  const [checking, setChecking] = useState(false)
  const validationLock = useRef(false)
  async function selectFile(file: File) {
    if (validationLock.current) return
    validationLock.current = true
    setChecking(true)
    onBusyChange(true)
    setError(null)
    try {
      const message = await validateResume(file)
      if (message) { setError(message); return }
      onChange({ source: "file", file })
    } catch { setError("Não foi possível ler o arquivo. Selecione o PDF novamente.") }
    finally { validationLock.current = false; setChecking(false); onBusyChange(false) }
  }
  return <fieldset className="min-w-0 space-y-3" disabled={checking}>
    <legend className="text-sm font-semibold">Currículo <span className="font-normal text-muted-foreground">(opcional)</span></legend>
    <p className="text-sm text-muted-foreground">Anexe um PDF ou selecione o currículo salvo no seu perfil.</p>
    {existingUrl && <label className={cn("flex cursor-pointer items-center gap-3 rounded-xl border p-4", value?.source === "profile" ? "border-primary bg-primary-subtle" : "border-border")}>
      <input type="radio" name="application-resume" checked={value?.source === "profile"} onChange={() => { onChange({ source: "profile", url: existingUrl }); setError(null) }} className="size-4 accent-primary" />
      <FileText className="size-5 shrink-0 text-primary" aria-hidden /><span><span className="block text-sm font-semibold">Usar currículo do perfil</span><span className="text-xs text-muted-foreground">PDF já salvo na sua conta</span></span>
    </label>}
    <div className={cn("rounded-xl border border-dashed p-4", value?.source === "file" ? "border-primary bg-primary-subtle" : "border-border-strong")}>
      <label htmlFor="application-resume-file" className="mb-3 flex items-center gap-2 text-sm font-semibold"><Upload className="size-4 text-primary" aria-hidden />Anexar um novo currículo</label>
      <input id="application-resume-file" type="file" accept=".pdf,application/pdf" aria-describedby="application-resume-hint" aria-invalid={Boolean(error)} onChange={event => { const file = event.target.files?.[0]; event.target.value = ""; if (file) void selectFile(file) }} className="block w-full min-w-0 text-xs text-muted-foreground file:mr-3 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2.5 file:font-semibold file:text-primary-foreground" />
      <p id="application-resume-hint" className="mt-3 text-xs leading-relaxed text-muted-foreground">PDF de até 10 MB. Ao enviar a candidatura, o arquivo também será salvo como seu currículo no perfil.</p>
    </div>
    <div aria-live="polite">{checking && <p className="text-sm text-muted-foreground">Verificando PDF…</p>}{value?.source === "file" && <p className="break-all text-sm font-medium text-primary">Selecionado: {value.file.name} · {(value.file.size / 1024 / 1024).toFixed(2)} MB</p>}{error && <Alert tone="danger">{error} A seleção anterior foi mantida.</Alert>}</div>
    {value && <button type="button" onClick={() => { onChange(null); setError(null) }} className="inline-flex min-h-10 items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground"><X className="size-3.5" aria-hidden />Remover seleção</button>}
  </fieldset>
}
