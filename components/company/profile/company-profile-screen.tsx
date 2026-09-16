"use client"

import { RouteSkeleton } from "@/components/ui/route-skeleton"

import { useEffect, useState } from "react"
import { Building2, Check, Globe2, LoaderCircle, MapPin, ShieldCheck } from "lucide-react"
import { getCompanyProfileMe, updateCompanyProfileMe } from "@/lib/services/company.service"
import type { CompanyProfile, UpdateCompanyProfileDto } from "@/lib/types/company.types"
import { Field, InputWithIcon } from "@/components/ui/form-field"
import { getErrorMessage } from "@/lib/errors"

export function CompanyProfileScreen() {
  const [profile, setProfile] = useState<CompanyProfile | null>(null)
  const [form, setForm] = useState<UpdateCompanyProfileDto>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getCompanyProfileMe()
      setProfile(data)
      setForm(toForm(data))
    } catch (requestError) {
      setProfile(null)
      setError(getErrorMessage(requestError, "Não foi possível carregar o perfil empresarial."))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const updated = await updateCompanyProfileMe(form)
      setProfile(updated)
      setForm(toForm(updated))
      setSaved(true)
      window.setTimeout(() => setSaved(false), 2500)
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Não foi possível salvar o perfil empresarial."))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <RouteSkeleton variant="profile" />

  if (!profile) {
    return (
      <main className="mx-auto max-w-lg px-4 py-20 text-center">
        <div className="rounded-2xl border border-border bg-background p-8">
          <h1 className="text-lg font-bold">Perfil empresarial indisponível</h1>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          <button onClick={load} className="btn-primary mt-6">
            Tentar novamente
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-[1100px] px-4 py-8 sm:px-8 sm:py-12">
      <div>
        <p className="text-sm font-semibold text-success-foreground">Configurações</p>
        <h1 className="mt-2 text-3xl font-bold tracking-[-0.03em] sm:text-4xl">
          Perfil da empresa
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          As informações abaixo aparecem nas vagas e para os candidatos.
        </p>
      </div>

      <form
        onSubmit={submit}
        className="mt-8 overflow-hidden rounded-[24px] border border-border bg-background"
      >
        <div className="grid lg:grid-cols-[260px_1fr]">
          <aside className="border-b border-border bg-surface p-6 lg:border-b-0 lg:border-r">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-success-subtle text-success-foreground">
              <Building2 className="h-7 w-7" />
            </div>
            <h2 className="mt-5 font-bold">{profile.companyName}</h2>
            <p className="mt-1 text-xs text-muted-foreground">Conta empresarial</p>
            <div className="mt-6 rounded-xl border border-success-border bg-success-subtle p-3 text-xs font-semibold text-success-foreground">
              <ShieldCheck className="mr-2 inline h-4 w-4" />
              Perfil verificado
            </div>
          </aside>

          <section>
            <div className="flex min-h-20 items-center justify-between border-b border-border px-6 sm:px-8">
              <div>
                <h2 className="font-bold">Informações públicas</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Dados institucionais e de contato.
                </p>
              </div>
              {saved && (
                <span className="flex items-center gap-2 text-xs font-bold text-success-foreground">
                  <Check className="h-4 w-4" /> Salvo
                </span>
              )}
            </div>

            <div className="grid gap-5 px-6 py-8 sm:grid-cols-2 sm:px-8">
              <Field label="Nome da empresa">
                <input
                  value={form.companyName || ""}
                  onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                  className="field-input"
                  required
                />
              </Field>
              <Field label="CNPJ">
                <input
                  value={form.cnpj || ""}
                  onChange={(e) => setForm({ ...form, cnpj: e.target.value })}
                  className="field-input"
                  placeholder="00.000.000/0001-00"
                />
              </Field>
              <Field label="Setor">
                <input
                  value={form.industry || ""}
                  onChange={(e) => setForm({ ...form, industry: e.target.value })}
                  className="field-input"
                  placeholder="Tecnologia, saúde, educação..."
                />
              </Field>
              <Field label="Website">
                <InputWithIcon
                  icon={Globe2}
                  type="url"
                  value={form.website || ""}
                  onChange={(e) => setForm({ ...form, website: e.target.value })}
                  placeholder="https://"
                />
              </Field>
              <Field label="Cidade">
                <InputWithIcon
                  icon={MapPin}
                  value={form.city || ""}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                />
              </Field>
              <Field label="Estado">
                <input
                  value={form.state || ""}
                  onChange={(e) =>
                    setForm({ ...form, state: e.target.value.toUpperCase().slice(0, 2) })
                  }
                  className="field-input uppercase"
                  placeholder="SP"
                />
              </Field>
              <Field label="Descrição da empresa" wide>
                <textarea
                  rows={6}
                  value={form.description || ""}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="field-input resize-none"
                  placeholder="Conte sobre a empresa, cultura e propósito."
                />
              </Field>
              <Field label="URL do logotipo" wide>
                <input
                  type="url"
                  value={form.logoUrl || ""}
                  onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
                  className="field-input"
                  placeholder="https://"
                />
              </Field>
              {error && (
                <p className="rounded-xl bg-danger-subtle px-4 py-3 text-sm text-danger-foreground sm:col-span-2">
                  {error}
                </p>
              )}
            </div>
            <div className="flex justify-end gap-3 border-t border-border px-6 py-4 sm:px-8">
              <button type="button" onClick={() => setForm(toForm(profile))} className="btn-ghost">
                Cancelar
              </button>
              <button type="submit" disabled={saving} className="btn-primary">
                {saving && <LoaderCircle className="h-4 w-4 animate-spin" />}
                {saving ? "Salvando" : "Salvar alterações"}
              </button>
            </div>
          </section>
        </div>
      </form>
    </main>
  )
}

function toForm(profile: CompanyProfile): UpdateCompanyProfileDto {
  return {
    companyName: profile.companyName || "",
    cnpj: profile.cnpj || "",
    description: profile.description || "",
    industry: profile.industry || "",
    website: profile.website || "",
    city: profile.city || "",
    state: profile.state || "",
    logoUrl: profile.logoUrl || "",
  }
}
