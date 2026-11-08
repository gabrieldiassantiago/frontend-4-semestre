"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, Building2, Check, Loader2, ShieldCheck } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { rememberRegistration } from "@/lib/auth-flow"
import { useRegisterCompany } from "@/lib/queries/use-auth"
import { getErrorMessage } from "@/lib/errors"
import { PasswordInput } from "@/components/ui/password-input"
import { RegistrationOptions } from "./registration-options"
import { RegistrationStep } from "./registration-step"
import { AddressAutocomplete } from "@/components/company/vagas/address-autocomplete"
import { hasCompanyLocation } from "@/lib/utils/company-location"

type Step = 1 | 2 | 3

interface CompanyRegistrationFormProps {
  step: Step
  setStep: React.Dispatch<React.SetStateAction<Step>>
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
  latitude?: number
  longitude?: number
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

export function CompanyRegistrationForm({ onBackToLogin, step, setStep }: CompanyRegistrationFormProps) {
  const router = useRouter()
  const [form, setForm] = useState<CompanyFormData>(INITIAL_FORM)
  const registerCompany = useRegisterCompany()
  const loading = registerCompany.isPending
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
      if (!hasCompanyLocation(form)) {
        return "Selecione a localização da empresa nos resultados da busca."
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
    if (loading) return
    if (step < 3) { goForward(); return }
    const validationError = validateStep()
    if (validationError) {
      setError(validationError)
      return
    }

    if (form.latitude == null || form.longitude == null) {
      setError("Selecione a localização da empresa nos resultados da busca.")
      return
    }
    setError(null)
    try {
      await registerCompany.mutateAsync({
        responsibleName: form.responsibleName.trim(),
        email: form.email.trim(),
        password: form.password,
        companyName: form.companyName.trim(),
        cnpj: form.cnpj,
        industry: form.industry,
        website: form.website.trim() || undefined,
        latitude: form.latitude,
        longitude: form.longitude,
        city: form.city.trim(),
        state: form.state.trim().toUpperCase(),
        description: form.description.trim() || undefined,
      })
      rememberRegistration({ email: form.email.trim(), password: form.password, role: "COMPANY" })
      router.replace(`/auth/verify-email?email=${encodeURIComponent(form.email.trim())}&role=COMPANY`)
    } catch (requestError: unknown) {
      setError(getErrorMessage(requestError, "Não foi possível criar a conta empresarial."))
    }
  }

  return (
    <form
      onSubmit={submit}
      className="w-full"
    >
      <RegistrationStep step={step}>
      <div className="space-y-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">
              Etapa {step} de 3
            </p>
            <h2 data-step-heading tabIndex={-1} className="mt-1 text-xl font-bold tracking-tight text-foreground outline-none sm:text-2xl">
              {step === 1 && "Quem será responsável pela conta?"}
              {step === 2 && "Qual é a sua empresa?"}
              {step === 3 && "Onde fica a empresa?"}
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              {step === 1 && "Use o e-mail de quem vai administrar as vagas."}
              {step === 2 && "Informe o nome, o CNPJ e o setor de atuação."}
              {step === 3 && "Busque o endereço e selecione um dos resultados."}
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
              <div className="space-y-4">
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
                <fieldset>
                  <legend className="mb-2 text-sm font-medium">Qual é o setor de atuação?</legend>
                  <RegistrationOptions label="Setor de atuação" options={INDUSTRIES} value={form.industry}
                    onChange={value => updateField("industry", value)} />
                </fieldset>
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
              <div className="space-y-2">
                <label htmlFor="company-location" className="block text-sm font-semibold text-foreground">Localização da empresa</label>
                <AddressAutocomplete
                  inputId="company-location"
                  label="Buscar localização da empresa"
                  placeholder="Busque cidade ou endereço"
                  disabled={loading}
                  requireCityAndState
                  showCoordinates={false}
                  initialCity={form.city}
                  initialState={form.state}
                  initialCoords={form.latitude != null && form.longitude != null ? { latitude: form.latitude, longitude: form.longitude } : null}
                  onSelectLocation={(location) => {
                    setForm((current) => ({ ...current, city: location.cidade, state: location.estado, latitude: location.latitude, longitude: location.longitude }))
                    setError(null)
                  }}
                  onClear={() => {
                    setForm((current) => ({ ...current, city: "", state: "", latitude: undefined, longitude: undefined }))
                    setError(null)
                  }}
                />
                <p className="text-xs leading-5 text-muted-foreground">Selecione um resultado para confirmar a cidade e o estado da empresa.</p>
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
      </div>

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
      </RegistrationStep>
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
