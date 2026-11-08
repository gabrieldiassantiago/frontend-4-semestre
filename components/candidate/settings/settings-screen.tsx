"use client"

import { Bell, Eye, BriefcaseBusiness } from "lucide-react"
import { usePreferences } from "@/lib/queries/use-preferences"
import { PageHeader, PageShell } from "@/components/ui/page"
import { RouteSkeleton } from "@/components/ui/route-skeleton"
import { ErrorState } from "@/components/ui/states"
import { SettingsPanel, SettingsRow, SettingsSwitch } from "./settings-primitives"
import { SettingsNav } from "./settings-nav"

const sections = [
  {
    id: "privacidade", label: "Privacidade", icon: Eye,
    title: "Dados visíveis para empresas",
    description: "Estas escolhas valem para todas as empresas às quais você se candidatou, inclusive em candidaturas anteriores.",
    fields: [
      ["showEmail", "Endereço de e-mail"], ["showPhone", "Telefone"],
      ["showPhoto", "Foto de perfil"], ["showResume", "Currículo em PDF"],
    ],
  },
  {
    id: "notificacoes", label: "E-mails", icon: Bell,
    title: "Atualizações por e-mail",
    description: "Escolha os avisos que deseja receber por e-mail. Você também pode acompanhar o processo pela plataforma.",
    fields: [
      ["emailStageChanges", "Mudanças de etapa"], ["emailDecisions", "Resultado da candidatura"],
      ["emailFeedback", "Feedback da empresa"], ["emailAppointments", "Convites, alterações e cancelamentos de entrevistas"],
    ],
  },
  {
    id: "recomendacoes", label: "Vagas", icon: BriefcaseBusiness,
    title: "Recomendações de vagas",
    description: "Permita que a Selecta use suas experiências, formação e habilidades para ordenar as vagas por afinidade.",
    fields: [["personalizedJobs", "Usar meu perfil para recomendar vagas"]],
  },
] as const

export function SettingsScreen() {
  const { preferences, loading, error, refetch, pending, update } = usePreferences()
  if (loading) return <RouteSkeleton variant="settings" />

  return (
    <PageShell className="max-w-6xl">
      <PageHeader title="Configurações" description="As alterações nas suas preferências são salvas automaticamente." />
      {preferences ? (
        <div className="mt-6 grid gap-4 sm:mt-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-8">
          <SettingsNav sections={sections} />
          <div className="grid min-w-0 gap-4 sm:gap-6">
            {sections.map(section => (
              <SettingsPanel key={section.id} {...section}>
                {section.fields.map(([key, label]) => (
                  <SettingsRow key={key} title={label} control={
                    <div className="flex items-center gap-2">
                      {pending.some(change => change.key === key) && (
                        <span role="status" className="text-xs text-muted-foreground">Salvando…</span>
                      )}
                      <SettingsSwitch checked={preferences[key]} label={label}
                        onChange={checked => update({ key, checked, label })} />
                    </div>
                  } />
                ))}
              </SettingsPanel>
            ))}
          </div>
        </div>
      ) : (
        <ErrorState description={error} action={
          <button type="button" className="btn-secondary" onClick={() => void refetch()}>Tentar novamente</button>
        } />
      )}
    </PageShell>
  )
}
