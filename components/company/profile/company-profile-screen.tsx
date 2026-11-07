"use client"
import { RouteSkeleton } from "@/components/ui/route-skeleton"
import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { ROUTES } from "@/lib/config/routes"

import {
  AlignLeft,
  ArrowDown,
  ArrowUpRight,
  Building2,
  Check,
  Eye,
  Globe2,
  ImagePlus,
  Info,
  LoaderCircle,
  MapPin,
  Trash2,
  type LucideIcon,
} from "lucide-react"

import { useCompanyProfile, useUpdateCompanyProfile, useUploadCompanyLogo, useDeleteCompanyLogo } from "@/lib/queries/use-company-profile"
import type { CompanyProfile, UpdateCompanyProfileDto } from "@/lib/types/company.types"
import { CompanyLogo } from "@/components/shared/company-logo"
import { Field, InputWithIcon } from "@/components/ui/form-field"
import { getErrorMessage } from "@/lib/errors"
import { AddressAutocomplete } from "@/components/company/vagas/address-autocomplete"
import { hasCompanyLocation } from "@/lib/utils/company-location"

export function CompanyProfileScreen() {
  const {
    profile,
    isLoading: loading,
    error: loadError,
    refetch,
  } = useCompanyProfile()

  const updateProfile = useUpdateCompanyProfile()
  const uploadLogo = useUploadCompanyLogo()
  const deleteLogo = useDeleteCompanyLogo()
  const logoBusy = uploadLogo.isPending || deleteLogo.isPending
  const saving = updateProfile.isPending
  const fileInput = useRef<HTMLInputElement>(null)
  const syncedForm = useRef<string | null>(null)
  const [logoError, setLogoError] = useState<string | null>(null)
  const [form, setForm] = useState<UpdateCompanyProfileDto>(() => profile ? toForm(profile) : {})
  const [formError, setFormError] = useState<string | null>(null)
  const error = formError ?? loadError

  // Atualizações apenas da logo preservam as edições dos demais campos.
  useEffect(() => {
    if (!profile)
      return

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

    if (!file)
      return

    setLogoError(null)

    if (file.size === 0) {
      setLogoError("Selecione uma imagem não vazia.")
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      setLogoError("A imagem deve ter no máximo 2 MB.")
      return
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setLogoError("Envie uma imagem JPEG, PNG ou WebP.")
      return
    }

    try {
      await uploadLogo.mutateAsync(file)
    } catch (err) {
      setLogoError(getErrorMessage(err, "Não foi possível enviar o logotipo."))
    }
  }

  const removeLogo = async () => {
    setLogoError(null)

    try {
      await deleteLogo.mutateAsync()
    } catch (err) {
      setLogoError(getErrorMessage(err, "Não foi possível remover o logotipo."))
    }
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (saving || logoBusy)
      return

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

  if (loading)
    return <RouteSkeleton variant="profile" />

  if (!profile && !loadError) {
    return (
      <main className="mx-auto max-w-lg px-4 py-20 text-center">
        <div className="rounded-2xl border border-border bg-background p-8">
          <h1 className="text-lg font-bold">Perfil gerenciado pelo proprietário</h1>
          <p className="mt-2 text-sm text-muted-foreground">Você acessa a empresa como membro da equipe. Apenas o proprietário da conta pode editar os dados e o logotipo da empresa.
                      </p>
          <Link href={ROUTES.company.dashboard} className="btn-primary mt-6">Voltar ao painel
                      </Link>
        </div>
      </main>
    )
  }

  if (!profile) {
    return (
      <main className="mx-auto max-w-lg px-4 py-20 text-center">
        <div className="rounded-2xl border border-border bg-background p-8">
          <h1 className="text-lg font-bold">Perfil empresarial indisponível</h1>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          <button onClick={load} className="btn-primary mt-6">Tentar novamente
                      </button>
        </div>
      </main>
    )
  }

  const dirty = JSON.stringify(form) !== JSON.stringify(toForm(profile))
  const location = [form.city, form.state].filter(Boolean).join(", ")

  return (
    <main className="company-profile mx-auto w-full max-w-[1320px] px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
      <header className="mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs text-muted-foreground">Configurações da organização</p>
          <h1 className="mt-2 text-[28px] font-semibold leading-tight tracking-[-0.04em] sm:text-[32px]">Perfil da empresa</h1>
          <p className="mt-2.5 max-w-xl text-sm leading-6 text-muted-foreground">As informações que apresentam sua empresa aos candidatos.</p>
        </div>
        <a
          href="#company-public-preview"
          className="inline-flex min-h-10 items-center justify-center gap-2 self-start rounded-xl border border-border bg-card px-4 text-xs font-medium text-strong-foreground transition-colors hover:bg-muted sm:self-auto"><Eye aria-hidden className="size-4" />Ver prévia<ArrowDown aria-hidden className="size-3.5 text-muted-foreground" /></a>
      </header>

      <form id="company-profile-form" onSubmit={submit} className="space-y-7">
        <section
          aria-label="Identidade visual da empresa"
          className="overflow-hidden rounded-3xl border border-border/80 bg-card shadow-[0_2px_8px_-4px_rgba(32,29,29,0.08)]">
          <div className="flex h-24 items-start justify-end bg-[#eeecf6] px-6 pt-5 sm:h-28 sm:px-8">
            <span
              className="inline-flex items-center gap-1.5 rounded-full border border-white/70 bg-white/60 px-2.5 py-1 text-[10px] text-primary-deep"><Building2 aria-hidden className="size-3" />Perfil institucional</span>
          </div>
          <div className="px-5 pb-6 sm:px-8 sm:pb-7" aria-busy={logoBusy}>
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div className="min-w-0">
                <div className="-mt-10 mb-4 inline-flex rounded-[24px] bg-card p-1.5 ring-1 ring-black/[0.03]">
                  <CompanyLogo
                    url={profile.logoUrl}
                    name={form.companyName || profile.companyName}
                    size="xl"
                    className="size-[88px] rounded-[19px] text-2xl sm:size-24" />
                </div>
                <h2 className="break-words text-xl font-semibold leading-8 tracking-[-0.035em] sm:text-2xl">{form.companyName || "Sua empresa"}</h2>
                <div
                  className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs leading-5 text-muted-foreground">
                  <span>{form.industry || "Setor não informado"}</span>
                  {location && <><span aria-hidden className="size-1 rounded-full bg-border-strong" /><span className="inline-flex items-center gap-1"><MapPin aria-hidden className="size-3" />{location}</span></>}
                </div>
              </div>
              <div className="shrink-0">
                <input
                  ref={fileInput}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  aria-label="Selecionar logotipo da empresa"
                  className="sr-only"
                  disabled={logoBusy || saving}
                  onChange={changeLogo} />
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={logoBusy || saving}
                    onClick={() => fileInput.current?.click()}
                    className="btn-secondary min-h-10 rounded-xl px-4 text-xs">
                    {uploadLogo.isPending ? <LoaderCircle aria-hidden className="size-4 animate-spin" /> : <ImagePlus aria-hidden className="size-4" />}
                    {uploadLogo.isPending ? "Enviando…" : profile.logoUrl ? "Trocar logotipo" : "Adicionar logotipo"}
                  </button>
                  {profile.logoUrl && <button
                    type="button"
                    disabled={logoBusy || saving}
                    onClick={removeLogo}
                    aria-label="Remover logotipo da empresa"
                    className="grid size-10 place-items-center rounded-xl border border-border text-muted-foreground transition-colors hover:border-danger/20 hover:bg-danger-subtle hover:text-danger-foreground disabled:opacity-40">{deleteLogo.isPending ? <LoaderCircle aria-hidden className="size-4 animate-spin" /> : <Trash2 aria-hidden className="size-4" />}</button>}
                </div>
                <p className="mt-2 text-[10px] leading-5 text-muted-foreground">PNG, JPG ou WebP · Até 2 MB · Salvo ao enviar</p>
              </div>
            </div>
            {logoError && <p
              role="alert"
              className="mt-4 rounded-xl bg-danger-subtle px-4 py-3 text-xs leading-5 text-danger-foreground">{logoError}</p>}
          </div>
        </section>

        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0 space-y-6">
            <ProfileSection
              id="company-details"
              icon={Building2}
              title="Informações da empresa"
              description="Os dados básicos da sua organização.">
              <fieldset disabled={saving} className="grid min-w-0 gap-x-5 gap-y-6 sm:grid-cols-2">
                <legend className="sr-only">Dados institucionais</legend>
                <Field label="Nome da empresa" wide>
                  <input
                    value={form.companyName || ""}
                    onChange={event => setForm({
                      ...form,
                      companyName: event.target.value,
                    })}
                    className="field-input"
                    required
                    placeholder="Como sua empresa é conhecida" />
                </Field>
                <Field label="CNPJ">
                  <input
                    value={form.cnpj || ""}
                    onChange={event => setForm({
                      ...form,
                      cnpj: event.target.value,
                    })}
                    className="field-input"
                    placeholder="00.000.000/0001-00" />
                </Field>
                <Field label="Setor de atuação">
                  <input
                    value={form.industry || ""}
                    onChange={event => setForm({
                      ...form,
                      industry: event.target.value,
                    })}
                    className="field-input"
                    placeholder="Ex.: Tecnologia da informação" />
                </Field>
                <Field label="Site da empresa" wide hint="Informe o endereço completo, incluindo https://.">
                  <InputWithIcon
                    icon={Globe2}
                    type="url"
                    value={form.website || ""}
                    onChange={event => setForm({
                      ...form,
                      website: event.target.value,
                    })}
                    placeholder="https://suaempresa.com.br" />
                </Field>
              </fieldset>
            </ProfileSection>

            <ProfileSection
              id="company-about"
              icon={AlignLeft}
              title="Sobre a empresa"
              description="Apresente quem vocês são e como é fazer parte da equipe.">
              <Field label="Apresentação" hint="Conte sobre a atuação da empresa, a cultura e o dia a dia da equipe.">
                <textarea
                  rows={7}
                  value={form.description || ""}
                  disabled={saving}
                  onChange={event => setForm({
                    ...form,
                    description: event.target.value,
                  })}
                  className="field-input min-h-44 resize-y leading-7"
                  placeholder="O que sua empresa faz? O que vocês valorizam no trabalho?" />
              </Field>
              <p className="mt-2 text-right text-[10px] tabular-nums text-muted-foreground">{(form.description || "").length.toLocaleString("pt-BR")}caracteres</p>
            </ProfileSection>

            <ProfileSection
              id="company-location"
              icon={MapPin}
              title="Localização"
              description="Indique onde sua empresa está localizada.">
              <div className="space-y-3">
                <label htmlFor="company-profile-location" className="block text-sm font-medium text-strong-foreground">Cidade ou endereço</label>
                <AddressAutocomplete
                  inputId="company-profile-location"
                  label="Buscar localização da empresa"
                  placeholder="Buscar cidade ou endereço"
                  disabled={saving}
                  requireCityAndState
                  showCoordinates={false}
                  initialCity={form.city}
                  initialState={form.state}
                  initialCoords={form.latitude != null && form.longitude != null ? {
                    latitude: form.latitude,
                    longitude: form.longitude,
                  } : null}
                  onSelectLocation={selected => setForm(current => ({
                    ...current,
                    city: selected.cidade,
                    state: selected.estado,
                    latitude: selected.latitude,
                    longitude: selected.longitude,
                  }))}
                  onClear={() => setForm(current => ({
                    ...current,
                    city: "",
                    state: "",
                    latitude: undefined,
                    longitude: undefined,
                  }))} />
                {location && <div className="flex items-start gap-3 rounded-2xl border border-border-subtle bg-surface p-4"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-card text-muted-foreground"><MapPin aria-hidden className="size-4" /></span><div><p className="text-xs font-medium leading-5 text-foreground">{location}</p><p className="mt-0.5 text-[11px] leading-5 text-muted-foreground">{hasCompanyLocation(form) ? "Localização da empresa" : "Selecione um resultado da busca para confirmar a localização."}</p></div></div>}
              </div>
            </ProfileSection>
          </div>

          <aside
            id="company-public-preview"
            className="scroll-mt-24 space-y-4 xl:sticky xl:top-24"
            aria-label="Prévia do perfil público">
            <div className="flex items-center gap-2 px-1 text-xs text-muted-foreground"><Eye aria-hidden className="size-3.5" /><h2 className="font-medium">Prévia do perfil</h2></div>
            <div
              className="overflow-hidden rounded-3xl border border-border/80 bg-card shadow-[0_4px_20px_-12px_rgba(32,29,29,0.15)]">
              <div className="h-16 bg-[#eeecf6]" />
              <div className="px-6 pb-6">
                <div className="-mt-7 inline-flex rounded-[18px] bg-card p-1"><CompanyLogo url={profile.logoUrl} name={form.companyName} size="lg" className="rounded-2xl" /></div>
                <h3 className="mt-4 break-words text-lg font-semibold leading-7 tracking-[-0.03em]">{form.companyName || "Nome da empresa"}</h3>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">{form.industry || "Setor de atuação"}</p>
                {(location || form.website) && <div className="mt-5 space-y-3 border-t border-border-subtle pt-5">
                  {location && <p className="flex items-start gap-2 text-xs leading-5 text-muted-foreground"><MapPin aria-hidden className="mt-0.5 size-3.5 shrink-0" /><span>{location}</span></p>}
                  {form.website && <p className="flex items-start gap-2 text-xs leading-5 text-muted-foreground"><Globe2 aria-hidden className="mt-0.5 size-3.5 shrink-0" /><span className="break-all">{form.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}</span></p>}
                </div>}
                <div className="mt-5 border-t border-border-subtle pt-5"><h4 className="text-xs font-medium text-foreground">Sobre a empresa</h4><p
                    className="mt-2 line-clamp-6 whitespace-pre-line break-words text-xs leading-6 text-muted-foreground">{form.description || "A apresentação da sua empresa aparecerá aqui."}</p></div>
              </div>
            </div>
            <div className="flex items-start gap-2.5 px-1 text-[11px] leading-5 text-muted-foreground"><Info aria-hidden className="mt-0.5 size-3.5 shrink-0" /><p>A prévia acompanha suas edições. Salve as alterações para atualizar o perfil na plataforma.</p></div>
            <Link
              href={ROUTES.company.jobs}
              className="group flex items-center justify-between rounded-2xl border border-border/70 bg-card px-4 py-3.5 text-xs font-medium text-strong-foreground transition-colors hover:bg-muted">Gerenciar vagas da empresa<ArrowUpRight aria-hidden className="size-4 text-muted-foreground group-hover:text-primary" /></Link>
          </aside>
        </div>

        {error && <p
          role="alert"
          className="rounded-2xl border border-danger/20 bg-danger-subtle px-5 py-4 text-sm text-danger-foreground">{error}</p>}
        <footer
          className="company-savebar sticky bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card/95 px-5 py-4 shadow-[0_6px_24px_-12px_rgba(32,29,29,0.2)] backdrop-blur-lg sm:px-6 lg:bottom-4">
          <p aria-live="polite" className="flex items-center gap-2 text-xs text-muted-foreground">{dirty ? <><span aria-hidden className="size-1.5 rounded-full bg-warning" />Alterações não salvas</> : <><Check aria-hidden className="size-3.5 text-success" />Todas as alterações salvas</>}</p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={saving || logoBusy || !dirty}
              onClick={() => {
                setForm(toForm(profile))
                setFormError(null)
              }}
              className="btn-secondary min-h-10 rounded-xl px-4 text-xs">Descartar</button>
            <button
              type="submit"
              disabled={saving || logoBusy || !dirty}
              className="btn-primary min-h-10 rounded-xl px-5 text-xs">{saving ? <LoaderCircle aria-hidden className="size-4 animate-spin" /> : <Check aria-hidden className="size-4" />}{saving ? "Salvando…" : "Salvar alterações"}</button>
          </div>
        </footer>
      </form>
    </main>
  )
}

function ProfileSection(
  {
    id,
    icon: Icon,
    title,
    description,
    children,
  }: {
    id: string
    icon: LucideIcon
    title: string
    description: string
    children: React.ReactNode
  },
) {
  return (
    <section
      aria-labelledby={`${id}-title`}
      className="min-w-0 rounded-3xl border border-border/80 bg-card shadow-[0_2px_8px_-4px_rgba(32,29,29,0.08)]">
      <div className="flex items-start gap-3.5 px-5 pb-5 pt-6 sm:px-7">
        <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-surface text-muted-foreground"><Icon aria-hidden className="size-[18px]" strokeWidth={1.6} /></span>
        <div><h2 id={`${id}-title`} className="text-sm font-semibold leading-6 tracking-tight">{title}</h2><p className="mt-0.5 text-xs leading-5 text-muted-foreground">{description}</p></div>
      </div>
      <div className="px-5 pb-6 sm:px-7 sm:pb-7">{children}</div>
    </section>
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
