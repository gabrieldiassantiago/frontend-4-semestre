import {
  Bell,
  ChevronRight,
  Eye,
  KeyRound,
  Laptop,
  LogOut,
  ShieldCheck,
  Smartphone,
  Trash2,
  TriangleAlert,
  UserRound,
} from "lucide-react"
import { PageHeader, PageShell } from "@/components/ui/page"
import { Badge } from "@/components/ui/badge"
import { EntityAvatar } from "@/components/ui/entity-avatar"
import { cn } from "@/lib/utils"
import { SettingsField, SettingsPanel, SettingsRow, SettingsSwitch } from "./settings-primitives"

const SECTIONS = [
  { id: "conta", label: "Conta", icon: UserRound },
  { id: "notificacoes", label: "Notificações", icon: Bell },
  { id: "privacidade", label: "Privacidade", icon: Eye },
  { id: "seguranca", label: "Segurança", icon: ShieldCheck },
  { id: "zona-de-risco", label: "Zona de risco", icon: TriangleAlert },
] as const

const NOTIFICATIONS = [
  {
    title: "Atualizações de candidatura",
    description: "Quando uma empresa mudar a etapa do seu processo seletivo.",
    email: true,
    push: true,
  },
  {
    title: "Novas mensagens",
    description: "Quando um recrutador enviar uma mensagem para você.",
    email: true,
    push: true,
  },
  {
    title: "Vagas recomendadas",
    description: "Sugestões de vagas compatíveis com o seu perfil.",
    email: true,
    push: false,
  },
  {
    title: "Novidades da Selecta",
    description: "Dicas de carreira, novos recursos e conteúdos.",
    email: false,
    push: false,
  },
]

const VISIBILITY = [
  {
    value: "publico",
    title: "Público",
    description: "Qualquer empresa pode encontrar seu perfil nas buscas.",
  },
  {
    value: "recrutadores",
    title: "Somente recrutadores",
    description: "Apenas empresas verificadas veem seu perfil completo.",
  },
  {
    value: "privado",
    title: "Privado",
    description: "Seu perfil só aparece para vagas em que você se candidatou.",
  },
]

const SESSIONS = [
  { device: "Chrome no macOS", location: "São Paulo, SP", lastSeen: "Ativa agora", current: true, icon: Laptop },
  { device: "App Selecta no iPhone", location: "Lorena, SP", lastSeen: "Há 2 dias", current: false, icon: Smartphone },
]

export function SettingsScreen() {
  return (
    <PageShell className="max-w-6xl">
      <PageHeader
        eyebrow="Sua conta"
        title="Configurações"
        description="Gerencie seus dados de acesso, preferências de notificação e quem pode ver o seu perfil."
      />

      <div className="mt-8 grid gap-6 xl:grid-cols-[220px_minmax(0,1fr)] xl:gap-8">
        <nav aria-label="Seções das configurações" className="xl:sticky xl:top-24 xl:self-start">
          <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 no-scrollbar xl:mx-0 xl:flex-col xl:gap-0.5 xl:overflow-visible xl:rounded-card xl:border xl:border-border xl:bg-card xl:p-2">
            {SECTIONS.map((section, index) => {
              const current = index === 0
              const danger = section.id === "zona-de-risco"
              return (
                <li
                  key={section.id}
                  className={cn("shrink-0", danger && "xl:mt-1.5 xl:border-t xl:border-border-subtle xl:pt-1.5")}
                >
                  <a
                    href={`#${section.id}`}
                    aria-current={current ? "location" : undefined}
                    className={cn(
                      "flex min-h-11 items-center gap-2.5 whitespace-nowrap rounded-full border px-4 text-sm font-semibold transition-colors xl:w-full xl:rounded-lg xl:border-transparent xl:px-3",
                      current
                        ? "border-primary bg-primary-subtle text-primary-subtle-foreground xl:border-transparent"
                        : danger
                          ? "border-border bg-card text-danger-foreground hover:bg-danger-subtle xl:bg-transparent"
                          : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground xl:bg-transparent",
                    )}
                  >
                    <section.icon aria-hidden className="size-[18px] shrink-0" />
                    {section.label}
                  </a>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="flex min-w-0 flex-col gap-6">
          <AccountPanel />
          <NotificationsPanel />
          <PrivacyPanel />
          <SecurityPanel />
          <DangerPanel />
        </div>
      </div>
    </PageShell>
  )
}

function AccountPanel() {
  return (
    <SettingsPanel
      id="conta"
      icon={UserRound}
      title="Dados da conta"
      description="Informações usadas para acessar a Selecta e para que os recrutadores entrem em contato."
      footer={
        <>
          <button type="button" className="btn-ghost">
            Cancelar
          </button>
          <button type="button" className="btn-primary">
            Salvar alterações
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4 rounded-xl border border-border-subtle bg-muted p-4 sm:flex-row sm:items-center">
        <EntityAvatar name="Carlos Silva" size="lg" className="rounded-full" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">Foto de perfil</p>
          <p className="mt-0.5 text-sm text-muted-foreground">JPG ou PNG, até 5 MB. Aparece no seu perfil público.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" className="btn-secondary">
            Alterar foto
          </button>
          <button type="button" className="btn-ghost">
            Remover
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <SettingsField id="settings-name" label="Nome completo">
          <input id="settings-name" className="field-input" defaultValue="Carlos Silva" autoComplete="name" />
        </SettingsField>
        <SettingsField id="settings-email" label="E-mail" hint="Usado para login e avisos importantes.">
          <input
            id="settings-email"
            type="email"
            className="field-input"
            defaultValue="carlos.silva@email.com"
            autoComplete="email"
          />
        </SettingsField>
        <SettingsField id="settings-phone" label="Telefone">
          <input id="settings-phone" type="tel" className="field-input" defaultValue="(12) 98108-2276" autoComplete="tel" />
        </SettingsField>
        <SettingsField id="settings-language" label="Idioma">
          <select id="settings-language" className="field-input" defaultValue="pt-BR">
            <option value="pt-BR">Português (Brasil)</option>
            <option value="en">English</option>
            <option value="es">Español</option>
          </select>
        </SettingsField>
      </div>
    </SettingsPanel>
  )
}

function NotificationsPanel() {
  return (
    <SettingsPanel
      id="notificacoes"
      icon={Bell}
      title="Notificações"
      description="Escolha como e quando você quer ser avisado sobre o que acontece nos seus processos."
    >
      <div className="hidden items-center justify-end gap-6 pb-3 pr-0.5 text-xs font-semibold uppercase tracking-wider text-subtle-foreground sm:flex">
        <span className="w-11 text-center">E-mail</span>
        <span className="w-11 text-center">Push</span>
      </div>
      <ul className="flex flex-col">
        {NOTIFICATIONS.map((item) => (
          <li
            key={item.title}
            className="flex flex-col gap-3 border-t border-border-subtle py-4 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
          >
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">{item.title}</p>
              <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground text-pretty">{item.description}</p>
            </div>
            <div className="flex shrink-0 items-center gap-6">
              <span className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground sm:hidden">E-mail</span>
                <SettingsSwitch checked={item.email} label={`${item.title} por e-mail`} />
              </span>
              <span className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground sm:hidden">Push</span>
                <SettingsSwitch checked={item.push} label={`${item.title} por push`} />
              </span>
            </div>
          </li>
        ))}
      </ul>
    </SettingsPanel>
  )
}

function PrivacyPanel() {
  return (
    <SettingsPanel
      id="privacidade"
      icon={Eye}
      title="Privacidade"
      description="Controle a visibilidade do seu perfil e dos seus dados para as empresas."
    >
      <fieldset>
        <legend className="text-sm font-semibold text-strong-foreground">Visibilidade do perfil</legend>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {VISIBILITY.map((option, index) => {
            const selected = index === 1
            return (
              <label
                key={option.value}
                className={cn(
                  "flex cursor-pointer flex-col gap-2 rounded-xl border p-4 transition-colors",
                  selected
                    ? "border-primary bg-primary-subtle/60 ring-3 ring-primary/10"
                    : "border-border hover:border-border-strong hover:bg-muted",
                )}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-foreground">{option.title}</span>
                  <input
                    type="radio"
                    name="visibility"
                    value={option.value}
                    defaultChecked={selected}
                    className="size-4 accent-primary"
                  />
                </span>
                <span className="text-sm leading-relaxed text-muted-foreground text-pretty">{option.description}</span>
              </label>
            )
          })}
        </div>
      </fieldset>

      <div className="mt-6 border-t border-border-subtle pt-5">
        <SettingsRow
          title="Mostrar pretensão salarial"
          description="Exibe sua faixa salarial desejada para os recrutadores."
          control={<SettingsSwitch checked={false} label="Mostrar pretensão salarial" />}
        />
        <SettingsRow
          title="Aberto a novas oportunidades"
          description="Adiciona um selo ao seu perfil indicando que você está em busca de vagas."
          control={<SettingsSwitch checked label="Aberto a novas oportunidades" />}
        />
        <SettingsRow
          title="Permitir contato direto"
          description="Recrutadores podem iniciar conversas mesmo sem candidatura."
          control={<SettingsSwitch checked label="Permitir contato direto" />}
        />
      </div>
    </SettingsPanel>
  )
}

function SecurityPanel() {
  return (
    <SettingsPanel
      id="seguranca"
      icon={ShieldCheck}
      title="Segurança"
      description="Proteja o acesso à sua conta e acompanhe onde ela está conectada."
    >
      <SettingsRow
        title="Senha"
        description="Última alteração há 3 meses."
        control={
          <button type="button" className="btn-secondary">
            <KeyRound aria-hidden className="size-4" />
            Alterar senha
          </button>
        }
      />
      <SettingsRow
        title="Verificação em duas etapas"
        description="Peça um código extra ao entrar em um novo dispositivo."
        control={
          <span className="flex items-center gap-3">
            <Badge variant="success" size="sm" className="hidden sm:inline-flex">
              Recomendado
            </Badge>
            <SettingsSwitch checked={false} label="Verificação em duas etapas" />
          </span>
        }
      />

      <div className="mt-6 border-t border-border-subtle pt-5">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-sm font-semibold text-strong-foreground">Sessões ativas</h3>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-danger-foreground transition-colors hover:text-danger"
          >
            <LogOut aria-hidden className="size-4" />
            Encerrar outras
          </button>
        </div>
        <ul className="mt-3 flex flex-col gap-2">
          {SESSIONS.map((session) => (
            <li
              key={session.device}
              className="flex items-center gap-3 rounded-xl border border-border-subtle bg-muted px-4 py-3"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-card text-strong-foreground shadow-card">
                <session.icon aria-hidden className="size-[18px]" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-foreground">
                  {session.device}
                  {session.current && (
                    <Badge variant="primary" size="sm">
                      Este dispositivo
                    </Badge>
                  )}
                </p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {session.location} · {session.lastSeen}
                </p>
              </div>
              {!session.current && (
                <button type="button" aria-label={`Encerrar sessão: ${session.device}`} className="btn-ghost min-h-9 px-3">
                  Encerrar
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </SettingsPanel>
  )
}

function DangerPanel() {
  return (
    <SettingsPanel
      id="zona-de-risco"
      icon={TriangleAlert}
      tone="danger"
      title="Zona de risco"
      description="Ações permanentes que afetam sua conta e suas candidaturas."
    >
      <SettingsRow
        title="Exportar meus dados"
        description="Receba por e-mail uma cópia do seu perfil e histórico de candidaturas."
        control={
          <button type="button" className="btn-secondary">
            Solicitar
            <ChevronRight aria-hidden className="size-4" />
          </button>
        }
      />
      <SettingsRow
        title="Excluir conta"
        description="Remove seu perfil, currículos e candidaturas. Esta ação não pode ser desfeita."
        control={
          <button
            type="button"
            className="btn-base border border-danger-border bg-danger-subtle text-danger-foreground hover:bg-danger hover:text-strong-contrast"
          >
            <Trash2 aria-hidden className="size-4" />
            Excluir
          </button>
        }
      />
    </SettingsPanel>
  )
}
