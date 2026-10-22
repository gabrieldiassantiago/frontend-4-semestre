"use client"

import { useEffect, useId, useState } from "react"
import { Bell, CheckCircle2 } from "lucide-react"
import { Modal } from "@/components/ui/modal"
import { cn } from "@/lib/utils"

interface JobAlertsModalProps {
  open: boolean
  onClose: () => void
}

const FREQUENCIES = [
  { value: "daily", label: "Diariamente", hint: "Um resumo por dia" },
  { value: "weekly", label: "Semanalmente", hint: "Toda segunda-feira" },
] as const

type Frequency = (typeof FREQUENCIES)[number]["value"]

export function JobAlertsModal({ open, onClose }: JobAlertsModalProps) {
  const emailId = useId()
  const formId = useId()
  const [email, setEmail] = useState("")
  const [frequency, setFrequency] = useState<Frequency>("daily")
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (open) return
    const reset = window.setTimeout(() => {
      setSubmitted(false)
      setEmail("")
    }, 250)
    return () => window.clearTimeout(reset)
  }, [open])

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!email.trim()) return
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <Modal
        open={open}
        onClose={onClose}
        title="Alertas ativados"
        size="sm"
        footer={
          <button type="button" onClick={onClose} className="btn-primary" data-autofocus>
            Entendi
          </button>
        }
      >
        <div className="flex flex-col items-center py-4 text-center">
          <span className="grid size-14 place-items-center rounded-full bg-success-subtle text-success-foreground">
            <CheckCircle2 className="size-7" aria-hidden />
          </span>
          <h3 className="mt-4 text-lg font-semibold text-foreground text-balance">Alertas ativados</h3>
          <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-muted-foreground text-pretty">
            Você vai receber novas vagas {frequency === "daily" ? "todos os dias" : "toda semana"} em{" "}
            <strong className="font-semibold text-foreground">{email}</strong>.
          </p>
        </div>
      </Modal>
    )
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Receba vagas por e-mail"
      description="Avisamos quando surgirem oportunidades compatíveis com o seu perfil."
      icon={Bell}
      size="sm"
      footer={
        <>
          <button type="button" onClick={onClose} className="btn-ghost">
            Cancelar
          </button>
          <button type="submit" form={formId} className="btn-primary">
            <Bell className="size-4" aria-hidden />
            Ativar alertas
          </button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label htmlFor={emailId} className="text-sm font-semibold text-strong-foreground">
            E-mail
          </label>
          <input
            id={emailId}
            type="email"
            required
            data-autofocus
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="voce@exemplo.com"
            className="field-input"
          />
        </div>

        <fieldset className="flex flex-col gap-1.5">
          <legend className="mb-1.5 text-sm font-semibold text-strong-foreground">Frequência</legend>
          <div className="grid grid-cols-2 gap-2">
            {FREQUENCIES.map((option) => {
              const selected = frequency === option.value
              return (
                <label
                  key={option.value}
                  className={cn(
                    "flex cursor-pointer flex-col gap-0.5 rounded-xl border p-3 transition-colors",
                    selected ? "border-primary bg-primary-subtle" : "border-border hover:border-border-strong hover:bg-surface",
                  )}
                >
                  <input
                    type="radio"
                    name="alert-frequency"
                    value={option.value}
                    checked={selected}
                    onChange={() => setFrequency(option.value)}
                    className="sr-only"
                  />
                  <span className="text-sm font-semibold text-foreground">{option.label}</span>
                  <span className="text-xs text-muted-foreground">{option.hint}</span>
                </label>
              )
            })}
          </div>
        </fieldset>
      </form>
    </Modal>
  )
}
