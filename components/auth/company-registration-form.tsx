"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, Building2, Check, Loader2, MapPin, ShieldCheck } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { registerCompany } from "@/lib/services/auth.service"
import { getErrorMessage } from "@/lib/errors"
import { PasswordInput } from "@/components/ui/password-input"
import { cn } from "@/lib/utils"

type Step = 1 | 2 | 3

interface CompanyRegistrationFormProps {
  onBackToLogin: () => void
}

interface CompanyFormData {
  responsibleName: string
  email: string
  password: string
  confirmPassword: string
  companyName: string
  cnpj: string
  industry: string
  website: string
  city: string
  state: string
  description: string
}

const INITIAL_FORM: CompanyFormData = {
  responsibleName: "",
  email: "",
  password: "",
  confirmPassword: "",
  companyName: "",
  cnpj: "",
  industry: "",
  website: "",
  city: "",
  state: "",
  description: "",
}

const STEPS = [
  { number: 1 as const, label: "Responsável" },
  { number: 2 as const, label: "Empresa" },
  { number: 3 as const, label: "Perfil" },
]

const INDUSTRIES = [
  "Tecnologia e software",
  "Serviços financeiros",
  "Saúde",
  "Educação",
  "Varejo e comércio",
  "Indústria",
  "Consultoria",
  "Logística",
  "Outro",
]

export function CompanyRegistrationForm({ onBackToLogin }: CompanyRegistrationFormProps) {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [form, setForm] = useState<CompanyFormData>(INITIAL_FORM)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateField = <K extends keyof CompanyFormData>(field: K, value: CompanyFormData[K]) => {
    setForm((current) => ({ ...current, [field]: value }))
    setError(null)
  }

  const validateStep = () => {
    if (step === 1) {
      if (!form.responsibleName.trim() || !form.email.trim() || !form.password || !form.confirmPassword) {
        return "Preencha todos os dados do responsável."
      }
      if (!/^\S+@\S+\.\S+$/.test(form.email)) return "Informe um e-mail corporativo válido."
      if (form.password.length < 8) return "A senha deve ter pelo menos 8 caracteres."
      if (form.password !== form.confirmPassword) return "As senhas não coincidem."
    }

    if (step === 2) {
      if (!form.companyName.trim() || !form.cnpj.trim() || !form.industry) {
        return "Preencha os dados obrigatórios da empresa."
      }
      if (form.cnpj.replace(/\D/g, "").length !== 14) return "Informe um CNPJ com 14 dígitos."
      if (form.website && !/^https?:\/\/.+/.test(form.website)) {
        return "O site deve começar com http:// ou https://."
      }
    }

    if (step === 3) {
      if (!form.city.trim() || form.state.trim().length !== 2) {
        return "Informe a cidade e a UF da empresa."
      }
    }

    return null
  }

  const goForward = () => {
    const validationError = validateStep()
    if (validationError) {
      setError(validationError)
      return
    }
    setStep((current) => Math.min(3, current + 1) as Step)
  }

  const goBack = () => {
    setError(null)
    if (step === 1) onBackToLogin()
    else setStep((current) => (current - 1) as Step)
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    const validationError = validateStep()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    setError(null)
    try {
      await registerCompany({
        responsibleName: form.responsibleName.trim(),
        email: form.email.trim(),
        password: form.password,
        companyName: form.companyName.trim(),
        cnpj: form.cnpj,
        industry: form.industry,
        website: form.website.trim() || undefined,
        city: form.city.trim(),
        state: form.state.trim().toUpperCase(),
        description: form.description.trim() || undefined,
      })
      router.push(`/auth/verify-email?email=${encodeURIComponent(form.email.trim())}&role=COMPANY`)
    } catch (requestError: unknown) {
      setError(getErrorMessage(requestError, "Não foi possível criar a conta empresarial."))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={submit}
      className="mx-auto w-full max-w-lg space-y-6 rounded-2xl bg-background p-4 sm:max-w-xl sm:space-y-7 sm:p-6 md:p-8"
    >
      <ol className="grid grid-cols-3 gap-2 sm:gap-3" aria-label="Etapas do cadastro">
        {STEPS.map((item) => {
          const completed = item.number < step
          const active = item.number === step
          return (
            <li key={item.number} className="space-y-2">
              <div
                className={cn(
                  "h-1.5 rounded-full transition-colors duration-300",
                  item.number <= step ? "bg-primary" : "bg-border",
                )}
              />
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold transition-colors sm:h-7 sm:w-7",
                    active && "border-primary bg-primary-subtle text-primary-subtle-foreground",
                    completed && "border-success bg-success text-white",
                    !active && !completed && "border-border text-subtle-foreground",
                  )}
                >
                  {completed ? <Check className="h-3.5 w-3.5" /> : item.number}
                </span>
                <span
                  className={cn(
                    "truncate text-[11px] font-semibold sm:text-xs",
                    active ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {item.label}
                </span>
              </div>
            </li>
          )
        })}
      </ol>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="space-y-5"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">
              Etapa {step} de 3
            </p>
            <h2 className="mt-1 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              {step === 1 && "Quem será responsável pela conta?"}
              {step === 2 && "Conte sobre a sua empresa"}
              {step === 3 && "Complete o perfil empresarial"}
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              {step === 1 && "Esses dados serão usados para acessar e administrar a conta."}
              {step === 2 && "As informações legais ajudam a manter a plataforma confiável."}
              {step === 3 && "Você poderá editar essas informações depois no perfil da empresa."}
            </p>
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <Field label="Nome completo do responsável" htmlFor="company-responsible">
                <input
                  id="company-responsible"
                  className="auth-input"
                  placeholder="Ex.: Gabriela Andrade"
                  value={form.responsibleName}
                  onChange={(e) => updateField("responsibleName", e.target.value)}
                  autoComplete="name"
                />
              </Field>
              <Field label="E-mail corporativo" htmlFor="company-email">
                <input
                  id="company-email"
                  type="email"
                  className="auth-input"
                  placeholder="voce@suaempresa.com.br"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  autoComplete="email"
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Senha" htmlFor="company-password">
                  <PasswordInput
                    id="company-password"
                    placeholder="Mínimo 8 caracteres"
                    autoComplete="new-password"
                    value={form.password}
                    onChange={(e) => updateField("password", e.target.value)}
                  />
                </Field>
                <Field label="Confirmar senha" htmlFor="company-confirm-password">
                  <PasswordInput
                    id="company-confirm-password"
                    placeholder="Repita a senha"
                    autoComplete="new-password"
                    value={form.confirmPassword}
                    onChange={(e) => updateField("confirmPassword", e.target.value)}
                  />
                </Field>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <Field label="Nome da empresa" htmlFor="company-name">
                <div className="relative flex items-center">
                  <Building2 className="pointer-events-none absolute left-3.5 h-4 w-4 text-subtle-foreground" />
                  <input
                    id="company-name"
                    className="auth-input pl-11"
                    placeholder="Nome fantasia ou razão social"
                    value={form.companyName}
                    onChange={(e) => updateField("companyName", e.target.value)}
                  />
                </div>
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="CNPJ" htmlFor="company-cnpj">
                  <input
                    id="company-cnpj"
                    inputMode="numeric"
                    className="auth-input"
                    placeholder="00.000.000/0000-00"
                    value={form.cnpj}
                    onChange={(e) => updateField("cnpj", formatCnpj(e.target.value))}
                  />
                </Field>
                <Field label="Segmento" htmlFor="company-industry">
                  <select
                    id="company-industry"
                    className="auth-input"
                    value={form.industry}
                    onChange={(e) => updateField("industry", e.target.value)}
                  >
                    <option value="">Selecione</option>
                    {INDUSTRIES.map((industry) => (
                      <option key={industry} value={industry}>
                        {industry}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              <Field label="Site da empresa (opcional)" htmlFor="company-website">
                <input
                  id="company-website"
                  type="url"
                  className="auth-input"
                  placeholder="https://suaempresa.com.br"
                  value={form.website}
                  onChange={(e) => updateField("website", e.target.value)}
                />
              </Field>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-[1fr_88px] gap-3 sm:grid-cols-[1fr_100px] sm:gap-4">
                <Field label="Cidade" htmlFor="company-city">
                  <div className="relative flex items-center">
                    <MapPin className="pointer-events-none absolute left-3.5 h-4 w-4 text-subtle-foreground" />
                    <input
                      id="company-city"
                      className="auth-input pl-11"
                      placeholder="Campinas"
                      value={form.city}
                      onChange={(e) => updateField("city", e.target.value)}
                    />
                  </div>
                </Field>
                <Field label="UF" htmlFor="company-state">
                  <input
                    id="company-state"
                    maxLength={2}
                    className="auth-input text-center uppercase"
                    placeholder="SP"
                    value={form.state}
                    onChange={(e) =>
                      updateField("state", e.target.value.replace(/[^a-zA-Z]/g, "").slice(0, 2).toUpperCase())
                    }
                  />
                </Field>
              </div>
              <Field label="Sobre a empresa (opcional)" htmlFor="company-description">
                <textarea
                  id="company-description"
                  rows={4}
                  maxLength={1500}
                  className="auth-input min-h-28 resize-none py-3"
                  placeholder="Conte brevemente sobre o negócio, a cultura e o tipo de talento que procuram."
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                />
                <p className="mt-1 text-right text-xs text-subtle-foreground">{form.description.length}/1500</p>
              </Field>
              <div className="flex items-start gap-2.5 rounded-xl border border-success-border bg-success-subtle p-3.5 text-xs leading-relaxed text-success-foreground sm:text-sm">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success-foreground" />
                <span>
                  Ao finalizar, criaremos o perfil da empresa e enviaremos o código de verificação para{" "}
                  <strong className="break-all font-semibold">{form.email}</strong>.
                </span>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            role="alert"
            className="overflow-hidden rounded-xl border border-danger-border bg-danger-subtle p-3 text-sm leading-relaxed text-danger-foreground"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      <div className="flex flex-col-reverse gap-3 border-t border-border-subtle pt-4 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={goBack}
          disabled={loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-3 text-sm font-semibold text-strong-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:flex-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </button>
        {step < 3 ? (
          <button
            type="button"
            onClick={goForward}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-hover hover:shadow-md active:scale-[0.99] sm:w-auto sm:flex-[1.4]"
          >
            Continuar
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-hover hover:shadow-md active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:flex-[1.4]"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            {loading ? "Criando empresa..." : "Criar conta empresarial"}
          </button>
        )}
      </div>
    </form>
  )
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-semibold text-foreground">
        {label}
      </label>
      {children}
    </div>
  )
}

function formatCnpj(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 14)
  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2")
}
