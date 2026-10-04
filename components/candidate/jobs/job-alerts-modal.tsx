"use client"

import React, { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Bell, Check, Sparkles, X } from "lucide-react"

interface JobAlertsModalProps {
  open: boolean
  onClose: () => void
}

export function JobAlertsModal({ open, onClose }: JobAlertsModalProps) {
  const [email, setEmail] = useState("")
  const [frequency, setFrequency] = useState<"daily" | "weekly">("daily")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setEmail("")
      onClose()
    }, 1800)
  }

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-strong/40 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", duration: 0.3, bounce: 0.15 }}
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-2xl z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 grid size-8 place-items-center rounded-full text-subtle-foreground hover:bg-muted hover:text-strong-foreground"
            >
              <X className="size-4" />
            </button>

            {submitted ? (
              <div className="flex flex-col items-center py-6 text-center">
                <div className="grid size-14 place-items-center rounded-full bg-emerald-100 text-emerald-600">
                  <Check className="size-7" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-foreground">
                  Alertas ativados com sucesso!
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Você receberá as melhores vagas diretamente no e-mail informado.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="grid size-11 place-items-center rounded-2xl bg-primary-subtle text-primary">
                    <Sparkles className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">
                      Receba vagas no seu e-mail
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Fique à frente e receba novas oportunidades personalizadas.
                    </p>
                  </div>
                </div>

                <div className="mt-2 space-y-1.5">
                  <label className="text-xs font-semibold text-strong-foreground">
                    Seu melhor e-mail
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="gabriel@exemplo.com"
                    className="h-11 w-full rounded-xl border border-border px-3.5 text-xs text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-strong-foreground">
                    Frequência de envio
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFrequency("daily")}
                      className={`h-10 rounded-xl border text-xs font-semibold transition-all ${
                        frequency === "daily"
                          ? "border-primary bg-primary-subtle text-primary"
                          : "border-border bg-card text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      Diariamente
                    </button>
                    <button
                      type="button"
                      onClick={() => setFrequency("weekly")}
                      className={`h-10 rounded-xl border text-xs font-semibold transition-all ${
                        frequency === "weekly"
                          ? "border-primary bg-primary-subtle text-primary"
                          : "border-border bg-card text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      Semanalmente
                    </button>
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={onClose}
                    className="h-10 rounded-xl px-4 text-xs font-semibold text-muted-foreground hover:bg-muted"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-primary px-5 text-xs font-bold text-white shadow-sm transition-all hover:bg-primary-hover active:scale-95"
                  >
                    <Bell className="size-3.5" />
                    Ativar alertas
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
