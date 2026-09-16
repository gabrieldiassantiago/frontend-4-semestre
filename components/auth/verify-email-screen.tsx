"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, CheckCircle2, Mail, RefreshCw } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { verifyEmail, resendCode } from "@/lib/services/auth.service"
import { finishRegistration, profileDestination } from "@/lib/auth-flow"
import { getErrorMessage } from "@/lib/errors"

export function VerifyEmailScreen() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const emailParam = searchParams.get("email") || ""
  const roleParam = searchParams.get("role") === "COMPANY" ? "COMPANY" : "CANDIDATE"

  const email = emailParam
  const [code, setCode] = useState(["", "", "", "", ""])
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(60)

  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleDigitChange = (index: number, value: string) => {
    if (value.length > 1) {

      const pastedCode = value.slice(0, 5).split("")
      const newCode = [...code]
      pastedCode.forEach((char, i) => {
        newCode[i] = char
      })
      setCode(newCode)
      const nextIndex = Math.min(pastedCode.length, 4)
      inputRefs.current[nextIndex]?.focus()
      return
    }

    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)

    if (value && index < 4) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)

    const fullCode = code.join("")
    if (fullCode.length < 5) {
      setErrorMessage("Por favor, digite o código de 5 dígitos completo.")
      return
    }

    if (!email) {
      setErrorMessage("E-mail não informado.")
      return
    }

    setLoading(true)
    try {
      await verifyEmail({ email, code: fullCode })
      const authenticated = await finishRegistration(email, roleParam)
      router.replace(authenticated ? profileDestination(roleParam) : `${roleParam === "COMPANY" ? "/auth/empresa" : "/auth/candidato"}?setup=1`)
    } catch (err: unknown) {
      setErrorMessage(getErrorMessage(err, "Código inválido ou expirado."))
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (countdown > 0 || resending || !email) return
    setErrorMessage(null)
    setSuccessMessage(null)
    setResending(true)

    try {
      await resendCode({ email })
      setSuccessMessage("Um novo código foi enviado para o seu e-mail.")
      setCountdown(60)
    } catch (err: unknown) {
      setErrorMessage(getErrorMessage(err, "Erro ao reenviar o código."))
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background px-6 py-12">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="absolute left-6 top-6 z-20"
      >
        <Link
          href="/auth"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3.5 py-1.5 text-xs font-semibold text-strong-foreground shadow-sm transition-all hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Voltar
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md rounded-3xl border border-border bg-card p-6 text-center shadow-raised sm:p-10"
      >
        <Image
          src="/images/logo_selecta.svg"
          alt="Logo Selecta"
          width={180}
          height={80}
          priority
          className="mx-auto mb-8"
        />
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-subtle text-primary shadow-sm border border-primary/20">
          <Mail className="h-8 w-8" />
        </div>

        <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-primary">Conta criada · próximo passo</p>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Verifique seu e-mail
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Enviamos um código de verificação de 5 dígitos para o e-mail:
        </p>
        <p className="mt-1 font-semibold text-foreground">{email || "seu@email.com"}</p>
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 rounded-xl border border-danger-border bg-danger-subtle p-3.5 text-sm text-danger-foreground"
            >
              {errorMessage}
            </motion.div>
          )}

          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-success-border bg-success-subtle p-3.5 text-sm text-success-foreground font-medium"
            >
              <CheckCircle2 className="h-4 w-4" />
              {successMessage}
            </motion.div>
          )}
        </AnimatePresence>
        <p className="mt-4 text-sm text-muted-foreground">Confirme seu e-mail para continuar com o preenchimento do perfil.</p>
        <form onSubmit={handleVerify} className="mt-8 space-y-6">
          <div className="flex justify-center gap-2.5 sm:gap-3.5">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el }}
                type="text"
                maxLength={5}
                aria-label={`Dígito ${index + 1} do código`}
                autoComplete={index === 0 ? "one-time-code" : "off"}
                value={digit}
                onChange={(e) => handleDigitChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="h-12 min-w-0 w-full sm:h-14 sm:w-14 rounded-xl border border-border-strong bg-background text-center text-2xl font-bold text-foreground shadow-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-white shadow-lg shadow-none transition-all hover:bg-primary-hover disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            {loading ? "Verificando..." : "Verificar código"}
          </motion.button>
        </form>
        <div className="mt-6 flex flex-col items-center gap-2 text-sm text-muted-foreground">
          <p>Não recebeu o código?</p>
          <button
            type="button"
            onClick={handleResend}
            disabled={countdown > 0 || resending}
            className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline disabled:opacity-50 disabled:no-underline"
          >
            {resending && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
            {countdown > 0 ? `Reenviar código em ${countdown}s` : "Reenviar código"}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
