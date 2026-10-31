import type { VagaCategoria } from "@/lib/types/vaga.types"
import { ROUTES } from "@/lib/config/routes"

export const NAV_LINKS = [
  { label: "Explorar vagas", href: "#vagas" },
  { label: "Sobre a gente", href: "#sobre" },
  { label: "Dicas", href: "#dicas" },
  { label: "Contato", href: "#contato" },
] as const

/** Perfis de acesso oferecidos no menu "Entrar" / "Criar uma conta" da landing. */
export const AUTH_PROFILES = [
  {
    id: "candidato",
    label: "Sou candidato",
    description: "Encontre vagas e acompanhe cada etapa",
    href: ROUTES.auth.candidate,
    icon: "/images/candidato_icon.png",
  },
  {
    id: "empresa",
    label: "Sou empresa",
    description: "Publique vagas e gerencie processos",
    href: ROUTES.auth.company,
    icon: "/images/empresa_icon.png",
  },
] as const

export const TRUSTED_COMPANIES = ["Pulse Tech", "Nexus Care", "Designlabz", "InnovateSoft", "Growthly", "Vendamais"] as const

/** Números ilustrativos — troque pelos reais quando houver métricas públicas. */
export const STATS = [
  { value: 200, prefix: "+", suffix: "", label: "Empresas já cadastradas em nossa plataforma e divulgando vagas", tag: "Conquista", featured: true },
  { value: 5, prefix: "", suffix: "K+", label: "Candidatos confiam na Selecta para encontrar a vaga certa.", tag: "Confiança", featured: false },
  { value: 20, prefix: "", suffix: "+", label: "Áreas de atuação, da tecnologia à saúde.", tag: "Diversidade", featured: false },
] as const

export const FEATURES = [
  { id: "vagas", title: "Vagas de todas as áreas", text: "Explore oportunidades em tecnologia, saúde, finanças, engenharia e muito mais." },
  { id: "status", title: "Acompanhe cada candidatura", text: "Receba atualizações em tempo real sobre cada etapa, sem ficar no escuro." },
  { id: "estrategias", title: "Estratégias de busca", text: "Técnicas comprovadas para destacar seu perfil e aumentar suas chances de ser chamado." },
  { id: "busca", title: "Encontre vagas na hora", text: "Busque entre milhares de oportunidades e dê o próximo passo na sua carreira." },
] as const

export type JobTabId = "TODAS" | "OUTRAS" | VagaCategoria

export const JOB_TABS: { id: JobTabId; label: string }[] = [
  { id: "TODAS", label: "Todas" },
  { id: "DESIGN_UX_UI", label: "Design UX/UI" },
  { id: "DESENVOLVIMENTO_SOFTWARE", label: "Desenvolvimento" },
  { id: "CIENCIA_DE_DADOS_IA", label: "Dados & IA" },
  { id: "VENDAS", label: "Vendas" },
  { id: "OUTRAS", label: "Outras" },
]

/** Categorias que possuem aba própria; o restante cai em "Outras". */
export const TABBED_CATEGORIES = JOB_TABS.map((t) => t.id).filter((id) => id !== "TODAS" && id !== "OUTRAS")

export interface LandingJob {
  id: string
  titulo: string
  empresa: string
  categoria: VagaCategoria
  local: string
  modalidade: string
  salario: string
  resumo: string
  quando: string
}

/** Fallback exibido quando a API pública não responde. */
export const SAMPLE_JOBS: LandingJob[] = [
  { id: "1", titulo: "Designer UX/UI", empresa: "Pulse Tech", categoria: "DESIGN_UX_UI", local: "São Paulo, SP", modalidade: "Híbrido", salario: "R$ 7.000 – R$ 9.000 / mês", resumo: "Crie interfaces claras e acessíveis para web e mobile, conduza pesquisas e valide soluções com o time de produto.", quando: "há 1 min" },
  { id: "2", titulo: "Pesquisador UX Sênior", empresa: "Designlabz", categoria: "DESIGN_UX_UI", local: "Campinas, SP", modalidade: "Remoto", salario: "R$ 9.500 – R$ 12.000 / mês", resumo: "Lidere pesquisas com usuários, testes de usabilidade e entrevistas para transformar dados em decisões de produto.", quando: "há 3 min" },
  { id: "3", titulo: "Desenvolvedor Front-end", empresa: "Nexus Care", categoria: "DESENVOLVIMENTO_SOFTWARE", local: "Belo Horizonte, MG", modalidade: "Remoto", salario: "R$ 8.000 – R$ 11.000 / mês", resumo: "Construa interfaces performáticas com React e colabore lado a lado com design e back-end.", quando: "há 5 min" },
  { id: "4", titulo: "Desenvolvedor Back-end", empresa: "InnovateSoft", categoria: "DESENVOLVIMENTO_SOFTWARE", local: "São Paulo, SP", modalidade: "Híbrido", salario: "R$ 10.000 – R$ 14.000 / mês", resumo: "Desenvolva APIs escaláveis e participe das decisões de arquitetura do produto.", quando: "há 10 min" },
  { id: "5", titulo: "Analista de Dados", empresa: "Growthly", categoria: "CIENCIA_DE_DADOS_IA", local: "Curitiba, PR", modalidade: "Remoto", salario: "R$ 6.500 – R$ 9.000 / mês", resumo: "Modele dashboards, analise métricas de aquisição e gere insights que orientam o crescimento.", quando: "ontem" },
  { id: "6", titulo: "Executivo de Contas", empresa: "Vendamais", categoria: "VENDAS", local: "Rio de Janeiro, RJ", modalidade: "Presencial", salario: "R$ 4.500 – R$ 8.000 / mês", resumo: "Conduza negociações consultivas e acompanhe clientes durante todo o ciclo de vendas.", quando: "ontem" },
]

export const TIPS = [
  { title: "Como montar um currículo que passa na triagem", text: "Estrutura, palavras-chave e o que recrutadores realmente leem nos primeiros segundos.", image: "/images/landing/dica-curriculo.png" },
  { title: "Entrevistas: prepare-se sem decorar respostas", text: "Aprenda a contar sua trajetória com clareza e a fazer boas perguntas para a empresa.", image: "/images/landing/dica-entrevista.png" },
  { title: "Acompanhe seu processo sem ansiedade", text: "Entenda cada etapa de uma seleção e o que esperar entre uma fase e outra.", image: "/images/landing/dica-processo.png" },
]

export const TESTIMONIALS = [
  { quote: "Essa plataforma tornou a busca por estágio mais humana, transparente e acolhedora.", author: "Mirella Viana", role: "Engenheira de Software", rating: "4.9", tone: "violet" },
  { quote: "Contratamos mais rápido e com muito mais qualidade desde que começamos a usar a Selecta.", author: "Rafael Costa", role: "Head de Talent Acquisition", rating: "4.8", tone: "none" },
  { quote: "Consegui acompanhar cada etapa do processo e finalmente entendi o que as empresas esperavam de mim.", author: "Ana Oliveira", role: "Desenvolvedora Front-end", rating: "5.0", tone: "pink" },
  { quote: "A Selecta deixou nosso processo seletivo mais organizado, transparente e próximo dos candidatos.", author: "Lucas Martins", role: "People & Culture", rating: "4.7", tone: "none" },
  { quote: "Receber retorno em cada etapa mudou completamente a minha experiência como candidata.", author: "Fernanda Lima", role: "Analista de Marketing", rating: "5.0", tone: "blue" },
  { quote: "Publicar vagas e conversar com candidatos no mesmo lugar economiza horas por semana.", author: "Bruno Almeida", role: "Recrutador", rating: "4.8", tone: "none" },
] as const

export const FAQ = [
  { q: "Como começo minha busca de vagas na Selecta?", a: "Crie uma conta gratuita de candidato, complete seu perfil e comece a explorar vagas filtrando por cargo, área, cidade ou modalidade." },
  { q: "A Selecta é gratuita para candidatos?", a: "Sim. Candidatos podem criar perfil, se candidatar e acompanhar processos sem nenhum custo." },
  { q: "Como acompanho minhas candidaturas?", a: "Na área Candidaturas você vê a etapa atual de cada processo e recebe notificações a cada avanço." },
  { q: "Posso conversar com as empresas?", a: "Sim. Quando a empresa abre o contato, você conversa direto pelo chat da candidatura." },
  { q: "Sou empresa. Como publico vagas?", a: "Crie uma conta de empresa, monte o perfil e publique vagas com etapas personalizadas e acompanhamento do funil." },
]

export const FOOTER_COLUMNS = [
  { title: "Selecta", links: [["Nossa missão", "#sobre"], ["Nossa visão", "#sobre"], ["Nossa história", "#sobre"]] },
  { title: "Candidatos", links: [["Buscar vagas", ROUTES.candidate.jobs], ["Dicas de carreira", "#dicas"], ["Criar conta", `${ROUTES.auth.candidate}?modo=cadastro`]] },
  { title: "Empresas", links: [["Publicar vagas", `${ROUTES.auth.company}?modo=cadastro`], ["Entrar como recrutador", ROUTES.auth.recruiter], ["Perguntas frequentes", "#faq"]] },
] as const
