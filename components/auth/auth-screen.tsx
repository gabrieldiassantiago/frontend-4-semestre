"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowLeft, Briefcase, Loader2, UserCheck, X } from "lucide-react"

import { useLogin, useRegisterUser } from "@/lib/queries/use-auth"
import { API_BASE_URL } from "@/lib/http/config"
import { rememberRegistration, loginDestination } from "@/lib/auth-flow"
import type { UserRole } from "@/lib/types/auth.types"
import { getErrorMessage } from "@/lib/errors"
import { cn } from "@/lib/utils"
import { Field } from "@/components/ui/form-field"
import { PasswordInput } from "@/components/ui/password-input"
import { Alert } from "@/components/ui/states"
import { CompanyRegistrationForm } from "./company-registration-form"
import { GoogleIcon, LinkedInIcon } from "./social-icons"
import { TestimonialCarousel } from "./testimonial-carousel"
import { RegistrationOptions } from "./registration-options"
import { RegistrationProgress } from "./registration-progress"
import { RegistrationStep } from "./registration-step"
import { CityAutocomplete } from "@/components/candidate/profile/city-autocomplete"

export type Role = "candidato" | "recrutador"
type Mode = "register" | "login"

const SUBTITLES: Record<Role, string> = {
  candidato: "Seu próximo passo começa aqui. Crie sua conta e monte seu perfil.",
  recrutador: "Encontre os melhores talentos e monte o seu time com agilidade.",
}

const GOALS = ["Estágio", "Primeiro emprego", "Nova posição", "Transição de carreira"]

const OAUTH_ERRORS: Record<string, string> = {
  account_type: "Esta conta pertence a uma empresa e não pode entrar como candidato.",
  email_unavailable: "O provedor não disponibilizou um e-mail verificado para continuar.",
  oauth_failed: "Não foi possível concluir o login social. Tente novamente.",
}

interface AuthScreenProps {
  initialRole?: Role
  initialMode?: Mode
}

export function AuthScreen({
  initialRole = "candidato",
  initialMode = "login",
}: AuthScreenProps) {
  const router = useRouter()

  const [role] = useState<Role>(initialRole)
  const [mode, setMode] = useState<Mode>(initialMode)

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const [remember, setRemember] = useState(false)
  const [modalTerms, setModalTerms] = useState(false)

  const login = useLogin()
  const register = useRegisterUser()
  const loading = login.isPending || register.isPending

  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const apiRole: Exclude<UserRole, "ADMIN"> =
    role === "candidato" ? "CANDIDATE" : "COMPANY"

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [goal, setGoal] = useState("")
  const [area, setArea] = useState("")
  const [location, setLocation] = useState<{ city?: string; state?: string }>({})

  const update =
    (key: keyof typeof form) =>
      (event: React.ChangeEvent<HTMLInputElement>) =>
        setForm((current) => ({
          ...current,
          [key]: event.target.value,
        }))

  const switchMode = (next: Mode) => {
    setError(null)
    setSuccess(null)
    if (next !== mode) setStep(1)
    setMode(next)
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get("oauthError") ?? params.get("linkedinError")

    if (code) {
      setError(OAUTH_ERRORS[code] ?? OAUTH_ERRORS.oauth_failed)
    }
  }, [])

  // Fecha o modal ao pressionar ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModalTerms(false)
    }
    if (modalTerms) window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [modalTerms])

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setSuccess(null)

    if (!form.email || !form.password) {
      setError("Por favor, preencha todos os campos.")
      return
    }

    try {
      const response = await login.mutateAsync({
        email: form.email,
        password: form.password,
        role: apiRole,
      })

      router.replace(
        await loginDestination(
          response.role,
          new URLSearchParams(window.location.search).get("setup") === "1"
        )
      )
    } catch (err) {
      setError(getErrorMessage(err, "E-mail ou senha incorretos."))
    }
  }

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setSuccess(null)
    if (step < 3) {
      setStep(step === 1 ? 2 : 3)
      return
    }

    if (
      !form.name.trim() ||
      !form.email ||
      !form.password ||
      !form.confirmPassword
    ) {
      setError("Por favor, preencha todos os campos.")
      return
    }

    if (form.password !== form.confirmPassword) {
      setError("As senhas não coincidem.")
      return
    }

    const headline = [goal, area.trim()].filter(Boolean).join(" · ") || undefined
    try {
      await register.mutateAsync({
        name: form.name.trim(),
        profile: headline || location.city ? { headline, ...location } : undefined,
        email: form.email,
        password: form.password,
        role: apiRole,
      })

      rememberRegistration({
        email: form.email,
        password: form.password,
        role: apiRole,
      })

      router.replace(
        `/auth/verify-email?email=${encodeURIComponent(
          form.email
        )}&role=${apiRole}`
      )
    } catch (err) {
      setError(
        getErrorMessage(err, "Erro ao realizar cadastro. Tente novamente.")
      )
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background selection:bg-primary/15 selection:text-primary md:flex-row">
      {/* Lado Esquerdo: Área de Autenticação */}
      <section className="relative flex w-full flex-col justify-between px-5 py-8 sm:px-10 md:min-h-screen md:w-1/2 lg:px-14 xl:px-20">
        {/* Glow sutil de fundo */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 bg-gradient-to-b from-primary/5 via-transparent to-transparent"
        />

        {/* Top Bar: Navegação e Badge de Perfil */}
        <div className="flex w-full items-center justify-between">
          <Link
            href="/auth"
            className="group inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/80 px-3.5 py-1.5 text-xs font-medium text-muted-foreground shadow-2xs backdrop-blur-xs transition-all hover:border-border hover:bg-muted/60 hover:text-foreground"
          >
            <ArrowLeft
              className="size-3.5 transition-transform duration-200 group-hover:-translate-x-0.5"
              aria-hidden
            />
            Trocar perfil
          </Link>

          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            {role === "candidato" ? (
              <>
                <UserCheck className="size-3.5" aria-hidden />
                Área do Candidato
              </>
            ) : (
              <>
                <Briefcase className="size-3.5" aria-hidden />
                Área do Recrutador
              </>
            )}
          </span>
        </div>

        {/* Container Central do Formulário */}
        <div
          className="mx-auto flex w-full max-w-[460px] flex-1 flex-col items-center py-8"
        >
          <header className="mb-6 flex w-full flex-col items-center text-center">
            <Link href="/" className="mb-6 transition-opacity hover:opacity-90">
              <Image
                src="/images/logo_selecta.svg"
                alt="Selecta"
                width={200}
                height={100}
                priority
                className="h-auto w-[140px] sm:w-[164px]"
              />
            </Link>

            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {mode === "login" ? "Bem-vindo de volta" : "Crie sua conta"}
            </h1>

            <p className="mt-2 max-w-sm text-balance text-sm leading-relaxed text-muted-foreground">
              {mode === "login"
                ? `Acesse sua conta de ${role} para continuar na plataforma.`
                : SUBTITLES[role]}
            </p>
          </header>

          {/* Segmented Control (Entrar / Criar conta) */}
          <div className="mb-6 grid w-full grid-cols-2 rounded-xl border border-border/60 bg-muted/50 p-1">
            <button
              type="button"
              onClick={() => switchMode("login")}
              className={cn(
                "relative rounded-lg py-2 text-xs font-semibold transition-all duration-200 sm:text-sm",
                mode === "login"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => switchMode("register")}
              className={cn(
                "relative rounded-lg py-2 text-xs font-semibold transition-all duration-200 sm:text-sm",
                mode === "register"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Criar conta
            </button>
          </div>

          {/* Alertas de Erro / Sucesso Animados */}
          <AnimatePresence mode="wait">
            {(error || success) && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -6 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -6 }}
                className="mb-4 w-full overflow-hidden"
              >
                {error && <Alert tone="danger">{error}</Alert>}
                {success && <Alert tone="success">{success}</Alert>}
              </motion.div>
            )}
          </AnimatePresence>

          {mode === "register" && <RegistrationProgress step={step} company={role === "recrutador"} />}
          {mode === "login" ? (
              <form
                key="login"
                onSubmit={handleLogin}
                className="w-full space-y-4"
              >
                {role === "candidato" && (
                  <>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <a
                        href={`${API_BASE_URL}/oauth2/authorization/google`}
                        className="btn-secondary flex w-full items-center justify-center gap-2.5 py-2.5 text-xs font-medium transition-all hover:bg-muted/80 sm:text-sm"
                      >
                        <GoogleIcon />
                        <span>Google</span>
                      </a>

                      <a
                        href={`${API_BASE_URL}/oauth2/authorization/linkedin`}
                        className="btn-secondary flex w-full items-center justify-center gap-2.5 py-2.5 text-xs font-medium transition-all hover:bg-muted/80 sm:text-sm"
                      >
                        <LinkedInIcon />
                        <span>LinkedIn</span>
                      </a>
                    </div>

                    <div className="relative py-2 text-center">
                      <span className="absolute inset-x-0 top-1/2 h-px bg-border/80" />
                      <span className="relative bg-background px-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                        ou com seu e-mail
                      </span>
                    </div>
                  </>
                )}

                <Field label="Seu e-mail">
                  <input
                    type="email"
                    placeholder="voce@email.com"
                    className="field-input transition-shadow focus:ring-2 focus:ring-primary/20"
                    value={form.email}
                    onChange={update("email")}
                    autoComplete="email"
                    required
                  />
                </Field>

                <Field label="Sua senha">
                  <PasswordInput
                    value={form.password}
                    onChange={update("password")}
                    autoComplete="current-password"
                    required
                  />
                </Field>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5 text-xs sm:text-sm">
                  <label className="group flex cursor-pointer select-none items-center gap-2">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(event) => setRemember(event.target.checked)}
                      className="size-4 rounded border-border accent-primary transition-transform active:scale-95"
                    />
                    <span className="text-muted-foreground transition-colors group-hover:text-foreground">
                      Lembrar de mim
                    </span>
                  </label>

                  <Link
                    href="/auth/forgot-password"
                    className="font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
                  >
                    Esqueci a senha
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary mt-2 flex w-full items-center justify-center gap-2 py-2.5 font-semibold shadow-sm transition-all active:scale-[0.99] disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" aria-hidden />
                      <span>Entrando...</span>
                    </>
                  ) : (
                    "Entrar na conta"
                  )}
                </button>
              </form>
            ) : role === "recrutador" ? (
              <CompanyRegistrationForm step={step} setStep={setStep} onBackToLogin={() => switchMode("login")} />
            ) : (
              <form
                key="register"
                onSubmit={handleRegister}
                className="w-full"
              >
                <RegistrationStep step={step}>
                <p className="text-xs font-semibold text-primary">Etapa {step} de 3</p>
                <h2 data-step-heading tabIndex={-1} className="text-2xl font-semibold tracking-tight text-ink outline-none">
                  {step === 1 ? "Que oportunidade você procura?" : step === 2 ? "Em qual cidade você mora?" : "Vamos criar seu acesso?"}
                </h2>
                {step === 1 && <>
                  <p className="text-sm text-muted-foreground">O que faria sentido para você neste momento? Você pode mudar isso depois no seu perfil.</p>
                  <RegistrationOptions label="Objetivo profissional" options={GOALS} value={goal} onChange={option => setGoal(goal === option ? "" : option)} />
                  <Field label="Área de interesse (opcional)">
                    <input id="candidate-interest" className="field-input" maxLength={150} value={area} onChange={e => setArea(e.target.value)} placeholder="Ex.: Design de produto" />
                  </Field>
                </>}
                {step === 2 && <>
                  <p className="text-sm text-muted-foreground">A cidade e o estado aparecem no seu perfil. Você pode preencher depois.</p>
                  <CityAutocomplete {...location} onChange={setLocation} />
                </>}
                {step === 3 && <>
                <Field label="Nome completo">
                  <input
                    type="text"
                    placeholder="Como deseja ser chamado?"
                    className="field-input transition-shadow focus:ring-2 focus:ring-primary/20"
                    value={form.name}
                    onChange={update("name")}
                    autoComplete="name"
                    required
                  />
                </Field>

                <Field label="Seu e-mail">
                  <input
                    type="email"
                    placeholder="voce@email.com"
                    className="field-input transition-shadow focus:ring-2 focus:ring-primary/20"
                    value={form.email}
                    onChange={update("email")}
                    autoComplete="email"
                    required
                  />
                </Field>

                <div className="grid w-full gap-4 sm:grid-cols-2">
                  <Field label="Senha">
                    <PasswordInput
                      value={form.password}
                      onChange={update("password")}
                      minLength={8}
                      autoComplete="new-password"
                      required
                    />
                  </Field>

                  <Field label="Confirme a senha">
                    <PasswordInput
                      value={form.confirmPassword}
                      onChange={update("confirmPassword")}
                      minLength={8}
                      autoComplete="new-password"
                      required
                    />
                  </Field>
                </div>

                <div className="rounded-xl border border-border/60 bg-muted/30 p-3 text-xs leading-relaxed text-muted-foreground">
                  Ao criar uma conta, você declara que leu e concorda com os nossos{" "}
                  <button
                    type="button"
                    onClick={() => setModalTerms(true)}
                    className="font-semibold text-foreground underline underline-offset-2 transition-colors hover:text-primary"
                  >
                    Termos de Serviço
                  </button>
                  .
                </div>
                </>}
                <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
                  <button type="button" disabled={loading} className="btn-secondary" onClick={() => {
                    setError(null)
                    if (step === 1) switchMode("login")
                    else setStep(step === 3 ? 2 : 1)
                  }}>Voltar</button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                >
                  {loading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" aria-hidden />
                      <span>Cadastrando...</span>
                    </>
                  ) : (
                    step === 3 ? "Criar minha conta" : "Continuar"
                  )}
                </button>
                </div>
                </RegistrationStep>
              </form>
            )}
        </div>

        {/* Rodapé discreto para ancorar a coluna */}
        <footer className="text-center text-xs text-muted-foreground/70">
          © {new Date().getFullYear()} Selecta. Todos os direitos reservados.
        </footer>

        {/* Modal de Termos de Serviço Aprimorado */}
        <AnimatePresence>
          {modalTerms && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalTerms(false)}
            >
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-labelledby="terms-title"
                className="relative flex max-h-[85vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl"
                initial={{ opacity: 0, scale: 0.96, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 16 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                onClick={(event) => event.stopPropagation()}
              >
                {/* Header Fixo do Modal */}
                <div className="flex items-center justify-between border-b border-border px-6 py-4">
                  <h2
                    id="terms-title"
                    className="text-lg font-bold text-foreground sm:text-xl"
                  >
                    Termos de Serviço
                  </h2>
                  <button
                    type="button"
                    onClick={() => setModalTerms(false)}
                    className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    aria-label="Fechar termos de serviço"
                  >
                    <X className="size-5" />
                  </button>
                </div>

                {/* Corpo Rolável */}
                <div className="space-y-4 overflow-y-auto px-6 py-5 text-sm leading-relaxed text-muted-foreground">
                  <p>
                    Ao utilizar a plataforma <strong>Selecta</strong>, você
                    concorda com os presentes Termos de Serviço.
                  </p>

                  <div className="space-y-1.5">
                    <h3 className="text-sm font-semibold text-foreground">
                      1. Aceitação dos termos
                    </h3>
                    <p>
                      Ao criar uma conta, você declara que leu, compreendeu e
                      concorda com estes termos e condições em sua totalidade.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-sm font-semibold text-foreground">
                      2. Uso da plataforma
                    </h3>
                    <p>
                      A plataforma deve ser utilizada de maneira ética, adequada
                      e em total conformidade com a legislação vigente e a LGPD.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-sm font-semibold text-foreground">
                      3. Responsabilidades do usuário
                    </h3>
                    <p>
                      O usuário é inteiramente responsável pela veracidade das
                      informações fornecidas durante o cadastro e pela guarda e
                      segurança de suas credenciais de acesso.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-sm font-semibold text-foreground">
                      4. Atualizações e alterações
                    </h3>
                    <p>
                      Estes termos poderão ser atualizados periodicamente para
                      refletir melhorias na plataforma. Alterações relevantes
                      serão comunicadas aos usuários.
                    </p>
                  </div>
                </div>

                {/* Footer Fixo do Modal */}
                <div className="flex items-center justify-end gap-3 border-t border-border bg-muted/30 px-6 py-3.5">
                  <button
                    type="button"
                    onClick={() => setModalTerms(false)}
                    className="btn-primary px-5 py-2 text-sm font-semibold"
                  >
                    Entendi e concordo
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Lado Direito: Carrossel de Depoimentos */}
      <section className="w-full px-3 pb-3 md:sticky md:top-0 md:h-screen md:w-1/2 md:p-3">
        <div className="h-[420px] w-full overflow-hidden rounded-2xl shadow-lg ring-1 ring-border/50 sm:h-[500px] md:h-full">
          <TestimonialCarousel className="h-full w-full" />
        </div>
      </section>
    </div>
  )
}