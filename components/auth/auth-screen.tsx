"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowLeft, Loader2 } from "lucide-react"

import { getLinkedInAuthorizationUrl, loginUser, registerUser } from "@/lib/services/auth.service"
import type { UserRole } from "@/lib/types/auth.types"
import { getErrorMessage } from "@/lib/errors"
import { cn } from "@/lib/utils"
import { Field } from "@/components/ui/form-field"
import { PasswordInput } from "@/components/ui/password-input"
import { Alert } from "@/components/ui/states"
import { CompanyRegistrationForm } from "./company-registration-form"
import { GoogleIcon, LinkedInIcon } from "./social-icons"
import { TestimonialCarousel } from "./testimonial-carousel"

export type Role = "candidato" | "recrutador"
type Mode = "register" | "login"

const SUBTITLES: Record<Role, string> = {
  candidato: "Procure vagas do mundo todo usando a plataforma",
  recrutador: "Encontre os melhores talentos e monte o seu time",
}

const LINKEDIN_ERRORS: Record<string, string> = {
  account_type: "Esta conta pertence a uma empresa e não pode entrar como candidato.",
  email_unavailable: "O LinkedIn não disponibilizou um e-mail verificado para continuar.",
  oauth_failed: "Não foi possível concluir o login com o LinkedIn. Tente novamente.",
}

interface AuthScreenProps {
  initialRole?: Role
  initialMode?: Mode
}

export function AuthScreen({ initialRole = "candidato", initialMode = "login" }: AuthScreenProps) {
  const router = useRouter()

  const [role] = useState<Role>(initialRole)
  const [mode, setMode] = useState<Mode>(initialMode)

  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" })
  const [remember, setRemember] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)



  const apiRole: Exclude<UserRole, "ADMIN"> = role === "candidato" ? "CANDIDATE" : "COMPANY"
  const isWideForm = role === "recrutador" && mode === "register"

  const update = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) =>
    setForm((current) => ({ ...current, [key]: event.target.value }))

  const switchMode = (next: Mode) => {
    setError(null)
    setSuccess(null)
    setMode(next)
  }

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("linkedinError")
    if (code) setError(LINKEDIN_ERRORS[code] ?? LINKEDIN_ERRORS.oauth_failed)
  }, [])

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setSuccess(null)

    if (!form.email || !form.password) {
      setError("Por favor, preencha todos os campos.")
      return
    }

    setLoading(true)
    try {
      const response = await loginUser({
        email: form.email,
        password: form.password,
        role: apiRole,
      })

      if (response.token) {
        setSuccess("Login realizado com sucesso!")
        setTimeout(() => {
          router.push(response.role === "COMPANY" ? "/empresa/dashboard" : "/dashboard")
        }, 800)
      }
    } catch (err) {
      setError(getErrorMessage(err, "E-mail ou senha incorretos."))
    } finally {
      setLoading(false)
    }
  }

  //toast de erro
  const toastError = (message: string) => {
    setError(message)
    setTimeout(() => {
      setError(null)
    }, 5000)

    return (
      <div className="fixed bottom-4 left-1/2 z-50 w-full max-w-sm -translate-x-1/2 rounded-lg bg-danger px-4 py-3 text-sm text-white shadow-lg">
        {message}
      </div>
    )
  }

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setSuccess(null)

    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      setError("Por favor, preencha todos os campos.")
      return
    }

    if (form.password !== form.confirmPassword) {
      setError("As senhas não coincidem.")
      return
    }

    setLoading(true)
    try {
      await registerUser({
        name: form.name,
        email: form.email,
        password: form.password,
        role: apiRole,
      })

      setSuccess("Conta criada com sucesso! Redirecionando para a verificação de e-mail...")
      setTimeout(() => {
        router.push(
          `/auth/verify-email?email=${encodeURIComponent(form.email)}&role=${apiRole}`,
        )
      }, 1200)
    } catch (err) {
      setError(getErrorMessage(err, "Erro ao realizar cadastro. Tente novamente."))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background md:flex-row">
      <section className="relative flex w-full flex-col justify-center px-5 pb-12 pt-24 sm:px-10 md:min-h-screen md:w-1/2 md:py-16 lg:px-14 xl:px-20">
        <Link
          href="/auth"
          className="absolute left-5 top-6 inline-flex items-center gap-2 rounded-full border border-border bg-background px-3.5 py-2 text-xs font-semibold text-muted-foreground shadow-xs transition-colors hover:bg-muted hover:text-foreground sm:left-10"
        >
          <ArrowLeft className="size-3.5" aria-hidden />
          Trocar perfil
        </Link>

        <div className={cn("mx-auto w-full", isWideForm ? "max-w-xl" : "max-w-md")}>
          <header className="mb-8 flex flex-col items-center text-center">
            <Image
              src="/images/logo_selecta.svg"
              alt="Selecta"
              width={200}
              height={100}
              priority
              className="mb-6 h-auto w-[150px] sm:w-[176px]"
            />
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {mode === "login" ? "Bem-vindo de volta" : "Crie sua conta"}
            </h1>
            <p className="mt-2 max-w-sm text-pretty text-sm leading-relaxed text-muted-foreground">
              {mode === "login"
                ? `Entre com seus dados de ${role} para continuar`
                : SUBTITLES[role]}
            </p>
          </header>

          <div className="space-y-4">
            {error && <Alert tone="danger">{error}</Alert>}
            {success && <Alert tone="success">{success}</Alert>}
          </div>

          <AnimatePresence mode="wait">
            {mode === "login" ? (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.25 }}
                onSubmit={handleLogin}
                className="mt-5 space-y-5"
              >
                <Field label="Seu e-mail">
                  <input
                    type="email"
                    placeholder="voce@email.com"
                    className="field-input"
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

                <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                  <label className="flex cursor-pointer select-none items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(event) => setRemember(event.target.checked)}
                      className="size-4 rounded border-border accent-primary"
                    />
                    <span className="text-muted-foreground">Lembrar de mim</span>
                  </label>

                  <a
                    href="#"
                    className="font-semibold text-strong-foreground underline underline-offset-4"
                  >
                    Esqueci a senha
                  </a>
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" aria-hidden />
                      <span>Entrando...</span>
                    </>
                  ) : (
                    "Entrar"
                  )}
                </button>

                <div className="relative py-1 text-center">
                  <span className="absolute inset-x-0 top-1/2 h-px bg-border" />
                  <span className="relative bg-background px-3 text-xs font-medium uppercase tracking-wide text-subtle-foreground">
                    ou
                  </span>
                </div>

                <div className="space-y-3">
                  <button type="button" className="btn-secondary w-full">
                    <GoogleIcon />
                    Continuar com o Google
                  </button>

                  {role === "candidato" && (
                    <a href={getLinkedInAuthorizationUrl()} className="btn-secondary w-full">
                      <LinkedInIcon />
                      Continuar com o LinkedIn
                    </a>
                  )}
                </div>

                <p className="text-center text-sm text-muted-foreground">
                  Ainda não tem uma conta?{" "}
                  <button
                    type="button"
                    onClick={() => switchMode("register")}
                    className="font-semibold text-primary hover:underline"
                  >
                    Crie uma agora
                  </button>
                </p>
              </motion.form>
            ) : role === "recrutador" ? (
              <motion.div
                key="company-register"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.25 }}
                className="mt-5"
              >
                <CompanyRegistrationForm onBackToLogin={() => switchMode("login")} />
              </motion.div>
            ) : (
              <motion.form
                key="register"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.25 }}
                onSubmit={handleRegister}
                className="mt-5 space-y-5"
              >
                <Field label="Nome completo">
                  <input
                    type="text"
                    placeholder="Como deseja ser chamado?"
                    className="field-input"
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
                    className="field-input"
                    value={form.email}
                    onChange={update("email")}
                    autoComplete="email"
                    required
                  />
                </Field>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Senha">
                    <PasswordInput
                      value={form.password}
                      onChange={update("password")}
                      autoComplete="new-password"
                      required
                    />
                  </Field>

                  <Field label="Confirme a senha">
                    <PasswordInput
                      value={form.confirmPassword}
                      onChange={update("confirmPassword")}
                      autoComplete="new-password"
                      required
                    />
                  </Field>
                </div>

                <p className="text-xs leading-relaxed text-muted-foreground">
                  Ao criar uma conta, você concorda com nossos{" "}
                  <a href="#" className="font-medium text-strong-foreground underline underline-offset-2">
                    Termos de Serviço
                  </a>{" "}
                  e{" "}
                  <a href="#" className="font-medium text-strong-foreground underline underline-offset-2">
                    Política de Privacidade
                  </a>
                  .
                </p>

                <button type="submit" disabled={loading} className="btn-primary w-full">
                  {loading ? "Cadastrando..." : "Criar conta"}
                </button>

                <p className="text-center text-sm text-muted-foreground">
                  Já tem uma conta?{" "}
                  <button
                    type="button"
                    onClick={() => switchMode("login")}
                    className="font-semibold text-primary hover:underline"
                  >
                    Faça login agora
                  </button>
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </section>

      <section className="w-full px-3 pb-3 md:sticky md:top-0 md:h-screen md:w-1/2 md:p-3">
        <TestimonialCarousel className="h-[420px] sm:h-[500px] md:h-full" />
      </section>
    </div>
  )
}
