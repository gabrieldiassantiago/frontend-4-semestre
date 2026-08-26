"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowRight, ArrowLeft, Plus, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { updateCandidateProfileMe } from "@/lib/services/candidate.service"
import { updateCompanyProfileMe } from "@/lib/services/company.service"
import type { UpdateCandidateProfileDto } from "@/lib/types/candidate.types"
import type { UpdateCompanyProfileDto } from "@/lib/types/company.types"

export function OnboardingWizardScreen() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const roleParam = searchParams.get("role") || "candidato"

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  // Candidate Onboarding Form State
  const [candidateForm, setCandidateForm] = useState<UpdateCandidateProfileDto>({
    headline: "",
    summary: "",
    phone: "",
    city: "",
    state: "",
    institution: "",
    course: "",
    currentSemester: 1,
    expectedGraduationYear: 2027,
    skills: [],
  })

  // Skill Input
  const [skillInput, setSkillInput] = useState("")

  // Company Onboarding Form State
  const [companyForm, setCompanyForm] = useState<UpdateCompanyProfileDto>({
    companyName: "",
    cnpj: "",
    description: "",
    industry: "",
    website: "",
    city: "",
    state: "",
    logoUrl: "",
  })

  const isCandidato = roleParam === "candidato"

  const handleAddSkill = () => {
    if (!skillInput.trim()) return
    if (!candidateForm.skills?.includes(skillInput.trim())) {
      setCandidateForm((prev) => ({
        ...prev,
        skills: [...(prev.skills || []), skillInput.trim()],
      }))
    }
    setSkillInput("")
  }

  const handleRemoveSkill = (skillToRemove: string) => {
    setCandidateForm((prev) => ({
      ...prev,
      skills: (prev.skills || []).filter((s) => s !== skillToRemove),
    }))
  }

  const handleFinish = async () => {
    setLoading(true)
    try {
      if (isCandidato) {
        await updateCandidateProfileMe(candidateForm)
      } else {
        await updateCompanyProfileMe(companyForm)
      }
      router.push("/")
    } catch {
      router.push("/")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-surface px-4 py-10 font-sans text-foreground">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-xl rounded-3xl border border-border/80 bg-background p-6 sm:p-10 shadow-xl"
      >
        <div className="flex flex-col items-center text-center">
          <Image
            src="/images/logo_selecta.svg"
            alt="Logo Selecta"
            width={160}
            height={60}
            priority
            className="mb-6"
          />

          <div className="w-full max-w-xs space-y-2">
            <div className="flex justify-between text-xs font-semibold text-subtle-foreground">
              <span>Passo {step} de 3</span>
              <span>{step === 1 ? "33%" : step === 2 ? "66%" : "100%"}</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: "33%" }}
                animate={{
                  width: step === 1 ? "33%" : step === 2 ? "66%" : "100%",
                }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>
        </div>

        <div className="mt-8">
          <AnimatePresence mode="wait">
            {isCandidato && step === 1 && (
              <motion.div
                key="cand-step-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="text-center sm:text-left mb-6">
                  <h2 className="text-xl font-bold text-foreground">Vamos começar pelo básico</h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Preencha como deseja ser visto pelos recrutadores da plataforma.
                  </p>
                </div>

                <Field label="Seu Cargo ou Objetivo Principal">
                  <input
                    type="text"
                    placeholder="Ex: Engenheira de Software | Desenvolvedor Full Stack"
                    value={candidateForm.headline || ""}
                    onChange={(e) =>
                      setCandidateForm({ ...candidateForm, headline: e.target.value })
                    }
                    className="auth-input"
                  />
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Telefone / WhatsApp">
                    <input
                      type="text"
                      placeholder="(11) 99999-9999"
                      value={candidateForm.phone || ""}
                      onChange={(e) => setCandidateForm({ ...candidateForm, phone: e.target.value })}
                      className="auth-input"
                    />
                  </Field>
                  <div className="grid grid-cols-2 gap-2">
                    <Field label="Cidade">
                      <input
                        type="text"
                        placeholder="São Paulo"
                        value={candidateForm.city || ""}
                        onChange={(e) =>
                          setCandidateForm({ ...candidateForm, city: e.target.value })
                        }
                        className="auth-input"
                      />
                    </Field>
                    <Field label="Estado">
                      <input
                        type="text"
                        placeholder="SP"
                        value={candidateForm.state || ""}
                        onChange={(e) =>
                          setCandidateForm({ ...candidateForm, state: e.target.value })
                        }
                        className="auth-input"
                      />
                    </Field>
                  </div>
                </div>

                <div className="mt-6 flex justify-end pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setStep(2)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-xs font-semibold text-white shadow-md shadow-none hover:bg-primary-hover"
                  >
                    Próximo passo <ArrowRight className="h-4 w-4" />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {isCandidato && step === 2 && (
              <motion.div
                key="cand-step-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="text-center sm:text-left mb-6">
                  <h2 className="text-xl font-bold text-foreground">Sua Formação Acadêmica</h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Empresas valorizam estudantes e recém-formados em constante evolução.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Instituição de Ensino">
                    <input
                      type="text"
                      placeholder="Nome da Universidade"
                      value={candidateForm.institution || ""}
                      onChange={(e) =>
                        setCandidateForm({ ...candidateForm, institution: e.target.value })
                      }
                      className="auth-input"
                    />
                  </Field>
                  <Field label="Curso">
                    <input
                      type="text"
                      placeholder="Ciência da Computação"
                      value={candidateForm.course || ""}
                      onChange={(e) =>
                        setCandidateForm({ ...candidateForm, course: e.target.value })
                      }
                      className="auth-input"
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Semestre Atual">
                    <input
                      type="number"
                      value={candidateForm.currentSemester || 1}
                      onChange={(e) =>
                        setCandidateForm({
                          ...candidateForm,
                          currentSemester: Number(e.target.value),
                        })
                      }
                      className="auth-input"
                    />
                  </Field>
                  <Field label="Ano Previsto de Formatura">
                    <input
                      type="number"
                      value={candidateForm.expectedGraduationYear || 2027}
                      onChange={(e) =>
                        setCandidateForm({
                          ...candidateForm,
                          expectedGraduationYear: Number(e.target.value),
                        })
                      }
                      className="auth-input"
                    />
                  </Field>
                </div>

                <div className="mt-6 flex items-center justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
                  >
                    <ArrowLeft className="h-4 w-4" /> Voltar
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setStep(3)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-xs font-semibold text-white shadow-md shadow-none hover:bg-primary-hover"
                  >
                    Próximo passo <ArrowRight className="h-4 w-4" />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {isCandidato && step === 3 && (
              <motion.div
                key="cand-step-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="text-center sm:text-left mb-6">
                  <h2 className="text-xl font-bold text-foreground">Resumo & Habilidades</h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Adicione uma breve apresentação e suas principais tecnologias.
                  </p>
                </div>

                <Field label="Resumo Profissional / Sobre Você">
                  <textarea
                    rows={3}
                    placeholder="Conte um pouco sobre suas aspirações, paixões e experiências de projetos..."
                    value={candidateForm.summary || ""}
                    onChange={(e) =>
                      setCandidateForm({ ...candidateForm, summary: e.target.value })
                    }
                    className="auth-input py-2.5"
                  />
                </Field>

                <Field label="Adicionar Habilidades (ex: React, Java, Figma)">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Digite uma skill e pressione Enter"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          handleAddSkill()
                        }
                      }}
                      className="auth-input"
                    />
                    <button
                      type="button"
                      onClick={handleAddSkill}
                      className="rounded-xl bg-strong px-4 py-2 text-xs font-semibold text-white hover:bg-black"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </Field>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(candidateForm.skills || []).map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 rounded-full bg-primary-subtle px-3 py-1 text-xs font-bold text-primary-subtle-foreground border border-primary/20"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="rounded-full p-0.5 hover:bg-primary-subtle"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>

                <div className="mt-6 flex items-center justify-between pt-4 border-t border-border-subtle">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
                  >
                    <ArrowLeft className="h-4 w-4" /> Voltar
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={handleFinish}
                    disabled={loading}
                    className="inline-flex items-center gap-2 rounded-2xl bg-primary px-7 py-3 text-xs font-semibold text-white shadow-lg shadow-none hover:bg-primary-hover disabled:opacity-50"
                  >
                    {loading ? "Finalizando..." : "Concluir Perfil e Ver Vagas"}
                  </motion.button>
                </div>
              </motion.div>
            )}

            {!isCandidato && (
              <motion.div
                key="company-step"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="text-center sm:text-left mb-6">
                  <h2 className="text-xl font-bold text-foreground">Perfil da Sua Empresa</h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Preencha os dados da sua empresa para publicar vagas e atrair talentos.
                  </p>
                </div>

                <Field label="Nome da Empresa">
                  <input
                    type="text"
                    placeholder="Nome Fantasia / Razão Social"
                    value={companyForm.companyName || ""}
                    onChange={(e) =>
                      setCompanyForm({ ...companyForm, companyName: e.target.value })
                    }
                    className="auth-input"
                  />
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="CNPJ">
                    <input
                      type="text"
                      placeholder="00.000.000/0001-00"
                      value={companyForm.cnpj || ""}
                      onChange={(e) => setCompanyForm({ ...companyForm, cnpj: e.target.value })}
                      className="auth-input font-mono"
                    />
                  </Field>
                  <Field label="Setor / Indústria">
                    <input
                      type="text"
                      placeholder="Tecnologia & Software"
                      value={companyForm.industry || ""}
                      onChange={(e) => setCompanyForm({ ...companyForm, industry: e.target.value })}
                      className="auth-input"
                    />
                  </Field>
                </div>

                <Field label="Descrição da Empresa">
                  <textarea
                    rows={3}
                    placeholder="Conte sobre a missão da empresa e o que torna o seu ambiente incrível..."
                    value={companyForm.description || ""}
                    onChange={(e) =>
                      setCompanyForm({ ...companyForm, description: e.target.value })
                    }
                    className="auth-input py-2.5"
                  />
                </Field>

                <div className="mt-6 flex justify-end pt-4 border-t border-border-subtle">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={handleFinish}
                    disabled={loading}
                    className="inline-flex items-center gap-2 rounded-2xl bg-primary px-7 py-3 text-xs font-semibold text-white shadow-lg shadow-none hover:bg-primary-hover disabled:opacity-50"
                  >
                    {loading ? "Salvando..." : "Concluir Cadastro da Empresa"}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="block text-[11px] font-bold uppercase tracking-wider text-subtle-foreground">
        {label}
      </label>
      {children}
    </div>
  )
}
