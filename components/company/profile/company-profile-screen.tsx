"use client"

import { RouteSkeleton } from "@/components/ui/route-skeleton"

import { useEffect, useRef, useState } from "react"
import { Globe2, LoaderCircle, MapPin, Upload } from "lucide-react"
import { useCompanyProfile, useUpdateCompanyProfile, useUploadCompanyLogo, useDeleteCompanyLogo } from "@/lib/queries/use-company-profile"
import type { CompanyProfile, UpdateCompanyProfileDto } from "@/lib/types/company.types"
import { CompanyLogo } from "@/components/shared/company-logo"
import { Field, InputWithIcon } from "@/components/ui/form-field"
import { getErrorMessage } from "@/lib/errors"
import { AddressAutocomplete } from "@/components/company/vagas/address-autocomplete"
import { hasCompanyLocation } from "@/lib/utils/company-location"

export function CompanyProfileScreen() {
  const { profile, isLoading: loading, error: loadError, refetch } = useCompanyProfile()
  const updateProfile = useUpdateCompanyProfile()
  const uploadLogo = useUploadCompanyLogo()
  const deleteLogo = useDeleteCompanyLogo()
  const logoBusy = uploadLogo.isPending || deleteLogo.isPending
  const saving = updateProfile.isPending
  const fileInput = useRef<HTMLInputElement>(null)
  const syncedForm = useRef<string | null>(null)
  const [logoError, setLogoError] = useState<string | null>(null)
  const [form, setForm] = useState<UpdateCompanyProfileDto>({})
  const [formError, setFormError] = useState<string | null>(null)
  const error = formError ?? loadError

  // Atualizações apenas da logo preservam as edições dos demais campos.
  useEffect(() => {
    if (!profile) return
    const nextForm = toForm(profile)
    const signature = JSON.stringify(nextForm)
    if (signature !== syncedForm.current) {
      syncedForm.current = signature
      setForm(nextForm)
    }
  }, [profile])

  const load = () => void refetch()

  const changeLogo = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return
    setLogoError(null)
    if (file.size === 0) { setLogoError("Selecione uma imagem não vazia."); return }
    if (file.size > 2 * 1024 * 1024) { setLogoError("A imagem deve ter no máximo 2 MB."); return }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setLogoError("Envie uma imagem JPEG, PNG ou WebP.")
      return
    }
    try { await uploadLogo.mutateAsync(file) }
    catch (err) { setLogoError(getErrorMessage(err, "Não foi possível enviar o logotipo.")) }
  }

  const removeLogo = async () => {
    setLogoError(null)
    try { await deleteLogo.mutateAsync() }
    catch (err) { setLogoError(getErrorMessage(err, "Não foi possível remover o logotipo.")) }
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (saving || logoBusy) return
    const locationChanged = (form.city ?? "") !== (profile?.city ?? "") || (form.state ?? "") !== (profile?.state ?? "")
    if (locationChanged && !hasCompanyLocation(form)) {
      setFormError("Selecione a localização da empresa nos resultados da busca.")
      return
    }
    setFormError(null)
    try {
      await updateProfile.mutateAsync(form)
    } catch (requestError) {
      setFormError(getErrorMessage(requestError, "Não foi possível salvar o perfil empresarial."))
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

  const dirty = JSON.stringify(form) !== JSON.stringify(toForm(profile))

  return (
    <main className="company-profile mx-auto w-full max-w-[1380px] px-4 py-7 sm:px-8 lg:px-10 lg:py-10">
      <header className="mb-8 border-b border-border pb-7">
        <p className="text-xs font-medium text-muted-foreground">Configurações</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Perfil da empresa</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">Gerencie as informações que os candidatos veem nas suas vagas.</p>
      </header>
      <form onSubmit={submit} className="grid items-start gap-7 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0 space-y-6">
          <section className="company-panel" aria-labelledby="company-brand-title">
            <div className="company-panel-heading"><h2 id="company-brand-title">Identidade da empresa</h2><p>Seu nome e logotipo identificam a empresa na plataforma.</p></div>
            <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center" aria-busy={logoBusy}>
              <CompanyLogo url={profile.logoUrl} name={profile.companyName} size="xl" />
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold">Logotipo</h3>
                <p className="mt-1 text-xs leading-6 text-muted-foreground">JPEG, PNG ou WebP, até 2 MB. A imagem é salva ao enviar.</p>
                <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" aria-label="Selecionar logotipo da empresa" className="sr-only" disabled={logoBusy || saving} onChange={changeLogo} />
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" className="btn-secondary" disabled={logoBusy || saving} onClick={() => fileInput.current?.click()}>
                    {uploadLogo.isPending ? <LoaderCircle className="size-4 animate-spin" /> : <Upload className="size-4" />}
                    {uploadLogo.isPending ? "Enviando…" : profile.logoUrl ? "Trocar logotipo" : "Enviar logotipo"}
                  </button>
                  {profile.logoUrl && <button type="button" className="btn-ghost" disabled={logoBusy || saving} onClick={removeLogo}>{deleteLogo.isPending ? "Removendo…" : "Remover"}</button>}
                </div>
                {logoError && <p role="alert" className="mt-3 text-sm text-danger-foreground">{logoError}</p>}
              </div>
            </div>
          </section>
          <section className="company-panel" aria-labelledby="company-details-title">
            <div className="company-panel-heading"><h2 id="company-details-title">Dados institucionais</h2><p>Informações básicas sobre sua organização.</p></div>
            <fieldset disabled={saving} className="grid min-w-0 gap-6 p-6 sm:grid-cols-2">
              <Field label="Nome da empresa *" wide><input value={form.companyName || ""} onChange={e => setForm({ ...form, companyName: e.target.value })} className="field-input" required placeholder="Nome apresentado aos candidatos" /></Field>
              <Field label="CNPJ"><input value={form.cnpj || ""} onChange={e => setForm({ ...form, cnpj: e.target.value })} className="field-input" placeholder="00.000.000/0001-00" /></Field>
              <Field label="Setor de atuação"><input value={form.industry || ""} onChange={e => setForm({ ...form, industry: e.target.value })} className="field-input" placeholder="Ex.: Tecnologia ou educação" /></Field>
              <Field label="Site da empresa" wide hint="Inclua o endereço completo, começando com https://."><InputWithIcon icon={Globe2} type="url" value={form.website || ""} onChange={e => setForm({ ...form, website: e.target.value })} placeholder="https://suaempresa.com.br" /></Field>
            </fieldset>
          </section>
          <section className="company-panel" aria-labelledby="company-about-title">
            <div className="company-panel-heading"><h2 id="company-about-title">Apresentação</h2><p>Conte aos candidatos sobre a empresa e o ambiente de trabalho.</p></div>
            <div className="p-6"><Field label="Sobre a empresa" hint="Apresente a atuação, a cultura e o que faz parte do dia a dia da equipe."><textarea rows={6} value={form.description || ""} disabled={saving} onChange={e => setForm({ ...form, description: e.target.value })} className="field-input resize-y" placeholder="Descreva a empresa e o que os candidatos podem esperar ao trabalhar com vocês." /></Field></div>
          </section>
          <section className="company-panel" aria-labelledby="company-location-title">
            <div className="company-panel-heading"><h2 id="company-location-title">Localização</h2><p>Ajude os candidatos a encontrar oportunidades na sua região.</p></div>
            <div className="space-y-3 p-6">
              <label htmlFor="company-profile-location" className="block text-sm font-semibold">Cidade ou endereço</label>
              <AddressAutocomplete inputId="company-profile-location" label="Buscar localização da empresa" placeholder="Buscar cidade ou endereço" disabled={saving} requireCityAndState showCoordinates={false}
                initialCity={form.city} initialState={form.state}
                initialCoords={form.latitude != null && form.longitude != null ? { latitude: form.latitude, longitude: form.longitude } : null}
                onSelectLocation={location => setForm(current => ({ ...current, city: location.cidade, state: location.estado, latitude: location.latitude, longitude: location.longitude }))}
                onClear={() => setForm(current => ({ ...current, city: "", state: "", latitude: undefined, longitude: undefined }))} />
              {form.city && !hasCompanyLocation(form) && <p className="text-xs text-muted-foreground">Localização atual: {form.city}, {form.state}. Selecione um resultado para confirmar.</p>}
            </div>
          </section>
          {error && <p role="alert" className="rounded-lg border border-danger/20 bg-danger-subtle px-4 py-3 text-sm text-danger-foreground">{error}</p>}
          <footer className="company-savebar flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 sm:px-6">
            <p aria-live="polite" className="text-xs text-muted-foreground">{dirty ? "Você tem alterações não salvas." : "Seu perfil está atualizado."}</p>
            <div className="flex gap-2"><button type="button" disabled={saving || !dirty} onClick={() => { setForm(toForm(profile)); setFormError(null) }} className="btn-secondary">Descartar</button>
              <button type="submit" disabled={saving || logoBusy || !dirty} className="btn-primary">{saving && <LoaderCircle className="size-4 animate-spin" />}{saving ? "Salvando…" : "Salvar alterações"}</button></div>
          </footer>
        </div>
        <aside className="space-y-5 xl:sticky xl:top-6" aria-label="Prévia do perfil público">
          <div className="company-panel">
            <div className="company-panel-heading"><h2>Como os candidatos veem</h2><p>Prévia das informações públicas.</p></div>
            <div className="p-6"><CompanyLogo url={profile.logoUrl} name={form.companyName} size="xl" />
              <h3 className="mt-5 break-words text-lg font-semibold tracking-tight">{form.companyName || "Nome da empresa"}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{form.industry || "Setor de atuação"}</p>
              {form.city && <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground"><MapPin className="size-3.5 shrink-0" />{form.city}{form.state ? ", " + form.state : ""}</p>}
              {form.website && <p className="mt-3 flex items-start gap-2 break-all text-xs text-muted-foreground"><Globe2 className="mt-0.5 size-3.5 shrink-0" />{form.website}</p>}
              <p className="mt-5 border-t border-border pt-5 text-sm leading-7 text-muted-foreground whitespace-pre-line break-words">{form.description || "A apresentação da empresa aparecerá aqui."}</p>
            </div>
          </div>
          <p className="px-1 text-xs leading-6 text-muted-foreground">Mantenha essas informações atualizadas para ajudar os candidatos a conhecer sua empresa antes de se candidatar.</p>
        </aside>
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
    latitude: profile.latitude,
    longitude: profile.longitude,
  }
}
