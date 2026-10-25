"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, RefreshCw, CheckCircle2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useResendCode, useVerifyEmail } from "@/lib/queries/use-auth"
import { finishRegistration, profileDestination } from "@/lib/auth-flow"
import { getErrorMessage } from "@/lib/errors"

export function VerifyEmailScreen() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const verifyEmail = useVerifyEmail()
  const resendCode = useResendCode()
  const emailParam = searchParams.get("email") || ""
  const roleParam = searchParams.get("role") === "COMPANY" ? "COMPANY" : "CANDIDATE"

  const email = emailParam

  // Redireciona para /auth se o email não veio via query string (acesso direto)
  useEffect(() => {
    if (!emailParam) {
      router.replace("/auth")
    }
  }, [emailParam, router])

  const [code, setCode] = useState(["", "", "", "", ""])
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(60)
  const [success, setSuccess] = useState(false)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  // Auto-submit when all 5 digits are filled
  useEffect(() => {
    if (code.every((d) => d !== "") && !loading && !success) {
      handleVerify()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code])

  const handleDigitChange = (index: number, value: string) => {
    if (value.length > 1) {
      const pastedCode = value.replace(/\D/g, "").slice(0, 5).split("")
      const newCode = ["", "", "", "", ""]
      pastedCode.forEach((char, i) => { newCode[i] = char })
      setCode(newCode)
      const nextIndex = Math.min(pastedCode.length, 4)
      inputRefs.current[nextIndex]?.focus()
      return
    }

    const sanitized = value.replace(/\D/g, "")
    const newCode = [...code]
    newCode[index] = sanitized
    setCode(newCode)

    if (sanitized && index < 4) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    if (e.key === "ArrowLeft" && index > 0) inputRefs.current[index - 1]?.focus()
    if (e.key === "ArrowRight" && index < 4) inputRefs.current[index + 1]?.focus()
  }

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setErrorMessage(null)

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
      await verifyEmail.mutateAsync({ email, code: fullCode })
      setSuccess(true)
      await new Promise((r) => setTimeout(r, 900))
      const authenticated = await finishRegistration(email, roleParam)
      router.replace(
        authenticated
          ? profileDestination(roleParam)
          : `${roleParam === "COMPANY" ? "/auth/empresa" : "/auth/candidato"}?setup=1`
      )
    } catch (err: unknown) {
      setErrorMessage(getErrorMessage(err, "Código inválido ou expirado."))
      setCode(["", "", "", "", ""])
      setTimeout(() => inputRefs.current[0]?.focus(), 50)
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (countdown > 0 || resending || !email) return
    setErrorMessage(null)
    setResending(true)
    try {
      await resendCode.mutateAsync({ email })
      setCountdown(60)
      setCode(["", "", "", "", ""])
      setTimeout(() => inputRefs.current[0]?.focus(), 50)
    } catch (err: unknown) {
      setErrorMessage(getErrorMessage(err, "Erro ao reenviar o código."))
    } finally {
      setResending(false)
    }
  }

  // Não renderiza nada enquanto redireciona
  if (!email) return null

  return (
    <>
      <style>{`
        .ve-root {
          min-height: 100svh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--surface, #f7f7f5);
          padding: 24px 16px;
          position: relative;
          font-family: inherit;
        }

        .ve-back {
          position: absolute;
          top: 24px;
          left: 24px;
          z-index: 30;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 600;
          color: var(--strong-foreground, #3f3f46);
          background: var(--background, #fff);
          border: 1px solid var(--border, #e4e4e7);
          border-radius: 999px;
          padding: 8px 16px;
          text-decoration: none;
          transition: all 0.2s ease;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        }
        .ve-back:hover {
          background: var(--muted, #fafafa);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .ve-card {
          position: relative;
          width: 100%;
          max-width: 440px;
          background: var(--background, #ffffff);
          border-radius: 20px;
          border: 1px solid var(--border, #e4e4e7);
          padding: 48px 40px 44px;
          box-shadow:
            0 1px 2px rgba(9, 9, 11, 0.03),
            0 4px 16px -4px rgba(9, 9, 11, 0.06),
            0 16px 45px rgba(9, 9, 11, 0.06);
        }

        .ve-card-inner {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        /* Logo */
        .ve-logo-wrap {
          margin-bottom: 28px;
        }

        /* Title */
        .ve-title {
          font-size: 24px;
          font-weight: 800;
          color: var(--foreground, #09090b);
          margin: 0 0 8px;
          letter-spacing: -0.4px;
          line-height: 1.25;
        }

        .ve-subtitle {
          font-size: 14px;
          color: var(--muted-foreground, #71717a);
          margin: 0 0 4px;
          line-height: 1.5;
        }

        .ve-email-highlight {
          font-size: 14px;
          font-weight: 650;
          color: var(--foreground, #09090b);
          margin: 0 0 28px;
        }

        /* Error */
        .ve-error {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: var(--danger-foreground, #be123c);
          background: var(--danger-subtle, #fff1f2);
          border: 1px solid var(--danger-border, #fecdd3);
          border-radius: 10px;
          padding: 10px 14px;
          margin-bottom: 16px;
          overflow: hidden;
          text-align: left;
        }
        .ve-error-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--danger, #e11d48);
          flex-shrink: 0;
        }

        /* OTP Row */
        .ve-otp-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 24px;
          width: 100%;
          justify-content: center;
        }

        .ve-otp-input {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          border: 1.5px solid var(--border-strong, #d4d4d8);
          background: var(--background, #ffffff);
          color: var(--foreground, #09090b);
          font-size: 22px;
          font-weight: 800;
          text-align: center;
          outline: none;
          transition: all 0.2s ease;
          caret-color: transparent;
          -webkit-appearance: none;
          font-family: inherit;
        }
        .ve-otp-input::placeholder {
          color: var(--border-strong, #d4d4d8);
        }
        .ve-otp-input:focus {
          border-color: var(--primary, #7c3aed);
          box-shadow: 0 0 0 3px var(--primary-ring, rgba(124, 58, 237, 0.1));
          background: var(--primary-subtle, #f5f3ff);
        }
        .ve-otp-input.filled:not(:focus) {
          border-color: var(--primary, #7c3aed);
          background: var(--primary-subtle, #f5f3ff);
          color: var(--primary, #7c3aed);
        }
        .ve-otp-input.err {
          border-color: var(--danger, #e11d48) !important;
          background: var(--danger-subtle, #fff1f2) !important;
          color: var(--danger-foreground, #be123c) !important;
          box-shadow: 0 0 0 3px rgba(225, 29, 72, 0.08) !important;
        }

        /* Submit button */
        .ve-submit {
          width: 100%;
          padding: 14px 20px;
          border-radius: 12px;
          border: none;
          background: linear-gradient(135deg, var(--primary, #7c3aed), var(--primary-hover, #6d28d9));
          color: var(--primary-foreground, #ffffff);
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 16px rgba(124, 58, 237, 0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-family: inherit;
          letter-spacing: -0.1px;
        }
        .ve-submit:hover:not(:disabled) {
          box-shadow: 0 6px 24px rgba(124, 58, 237, 0.35);
        }
        .ve-submit:disabled {
          opacity: 0.45;
          cursor: not-allowed;
          box-shadow: none;
        }

        /* Resend */
        .ve-resend {
          margin-top: 24px;
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 14px;
        }
        .ve-resend-label {
          color: var(--muted-foreground, #71717a);
        }
        .ve-resend-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 14px;
          font-weight: 700;
          color: var(--foreground, #09090b);
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          transition: all 0.15s ease;
          font-family: inherit;
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        .ve-resend-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          text-decoration: none;
        }
        .ve-resend-btn:not(:disabled):hover {
          color: var(--primary, #7c3aed);
        }
        .ve-countdown-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 28px;
          height: 20px;
          background: var(--primary-subtle, #f5f3ff);
          color: var(--primary, #7c3aed);
          border-radius: 5px;
          font-size: 11px;
          font-weight: 700;
          padding: 0 5px;
          margin-right: 4px;
        }

        /* Success */
        .ve-success {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 24px 0;
          gap: 14px;
          text-align: center;
        }
        .ve-success-icon {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: var(--success-subtle, #ecfdf5);
          border: 1.5px solid var(--success-border, #a7f3d0);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--success, #059669);
        }
        .ve-success-title {
          font-size: 20px;
          font-weight: 800;
          color: var(--foreground, #09090b);
          margin: 0;
          letter-spacing: -0.3px;
        }
        .ve-success-sub {
          font-size: 13px;
          color: var(--muted-foreground, #71717a);
          margin: 0;
        }

        /* Spinner */
        .ve-spin { animation: ve-spin 0.8s linear infinite; }
        @keyframes ve-spin { to { transform: rotate(360deg); } }

        /* Responsive */
        @media (max-width: 480px) {
          .ve-card {
            padding: 36px 24px 32px;
            border-radius: 16px;
          }
          .ve-otp-input {
            width: 48px;
            height: 48px;
            font-size: 18px;
            border-radius: 10px;
          }
          .ve-otp-row {
            gap: 8px;
          }
          .ve-title {
            font-size: 20px;
          }
        }
      `}</style>

      <div className="ve-root">
        {/* Back */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <Link href="/auth" className="ve-back">
            <ArrowLeft size={14} />
            Voltar
          </Link>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="ve-card"
        >
          <div className="ve-card-inner">
            {/* Logo */}
            <div className="ve-logo-wrap">
              <Image
                src="/images/logo_selecta.svg"
                alt="Selecta"
                width={142}
                height={40}
                priority
              />
            </div>

            <AnimatePresence mode="wait">
              {success ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="ve-success"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
                    className="ve-success-icon"
                  >
                    <CheckCircle2 size={36} />
                  </motion.div>
                  <p className="ve-success-title">E-mail verificado!</p>
                  <p className="ve-success-sub">Redirecionando…</p>
                </motion.div>
              ) : (
                <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h1 className="ve-title">Verifique seu e-mail</h1>
                  <p className="ve-subtitle">Enviamos um código para</p>
                  <p className="ve-email-highlight">{email || "seu@email.com"}</p>

                  {/* Error */}
                  <AnimatePresence>
                    {errorMessage && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="ve-error"
                      >
                        <span className="ve-error-dot" />
                        {errorMessage}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <form onSubmit={handleVerify}>
                    {/* OTP inputs */}
                    <div className="ve-otp-row">
                      {code.map((digit, index) => (
                        <input
                          key={index}
                          ref={(el) => { inputRefs.current[index] = el }}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={5}
                          aria-label={`Dígito ${index + 1} do código`}
                          autoComplete={index === 0 ? "one-time-code" : "off"}
                          value={digit}
                          disabled={loading || success}
                          onChange={(e) => handleDigitChange(index, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(index, e)}
                          onFocus={() => setActiveIndex(index)}
                          onBlur={() => setActiveIndex(null)}
                          className={[
                            "ve-otp-input",
                            digit ? "filled" : "",
                            errorMessage ? "err" : "",
                          ].filter(Boolean).join(" ")}
                        />
                      ))}
                    </div>

                    <motion.button
                      type="submit"
                      disabled={loading || success || code.some((d) => d === "")}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      className="ve-submit"
                    >
                      {loading ? (
                        <>
                          <RefreshCw size={16} className="ve-spin" />
                          Verificando…
                        </>
                      ) : (
                        "Verificar"
                      )}
                    </motion.button>
                  </form>

                  {/* Resend */}
                  <div className="ve-resend">
                    <span className="ve-resend-label">Não recebeu?</span>
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={countdown > 0 || resending}
                      className="ve-resend-btn"
                    >
                      {resending ? (
                        <><RefreshCw size={13} className="ve-spin" /> Enviando…</>
                      ) : countdown > 0 ? (
                        <><span className="ve-countdown-badge">{countdown}s</span> Reenviar</>
                      ) : (
                        "Reenviar"
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </>
  )
}
