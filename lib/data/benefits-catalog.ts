import {
  Heart,
  Utensils,
  Laptop,
  GraduationCap,
  Smile,
  Coins,
  type LucideIcon,
} from "lucide-react"

export interface BenefitItem {
  id: string
  label: string
}

export interface BenefitCategory {
  title: string
  icon: LucideIcon
  items: BenefitItem[]
}

export const BENEFIT_CATALOG: BenefitCategory[] = [
  {
    title: "Saúde & Bem-Estar",
    icon: Heart,
    items: [
      { id: "plano_saude", label: "Plano de Saúde (Bradesco/Amil/Unimed)" },
      { id: "plano_odonto", label: "Plano Odontológico" },
      { id: "gympass", label: "Gympass / TotalPass" },
      { id: "seguro_vida", label: "Seguro de Vida em Grupo" },
      { id: "apoio_psico", label: "Apoio Psicológico / Zenklub / Vittude" },
      { id: "telemedicina", label: "Telemedicina 24h" },
      { id: "ergonomia", label: "Consultoria Ergonômica" },
      { id: "vacinas", label: "Programa de Vacinação" },
    ],
  },
  {
    title: "Alimentação & Refeição",
    icon: Utensils,
    items: [
      { id: "vr", label: "Vale Refeição (VR / Swile / Caju / Flash)" },
      { id: "va", label: "Vale Alimentação (VA / Supermercado)" },
      { id: "refeitorio", label: "Refeição no Local / Restaurante Interno" },
      { id: "snack_bar", label: "Snack Bar & Frutas Liberadas" },
      { id: "cafe_especial", label: "Café Especial & Bebidas à Vontade" },
      { id: "happy_hour", label: "Happy Hour Mensal Patrocinado" },
    ],
  },
  {
    title: "Mobilidade & Local de Trabalho",
    icon: Laptop,
    items: [
      { id: "vt", label: "Vale Transporte (VT)" },
      { id: "aux_combustivel", label: "Auxílio Combustível / Mobilidade Livre" },
      { id: "estacionamento", label: "Estacionamento Gratuito" },
      { id: "aux_home_office", label: "Auxílio Home Office (R$ Luz/Internet)" },
      { id: "equipamentos", label: "Kit Macbook / Notebook + Monitor" },
      { id: "cadeira_ergonomica", label: "Cadeira Ergonômica & Mesa enviada" },
      { id: "bicicletario", label: "Bicicletário & Vestiário" },
    ],
  },
  {
    title: "Educação & Desenvolvimento",
    icon: GraduationCap,
    items: [
      { id: "bolsa_estudos", label: "Bolsa Graduação / Pós-Graduação" },
      { id: "aux_idiomas", label: "Auxílio Idiomas / Inglês in-company" },
      { id: "cursos_certif", label: "Reembolso de Cursos e Certificações" },
      { id: "eventos_tech", label: "Ingressos para Eventos & Conferências" },
      { id: "biblioteca_interna", label: "Plataformas de Aprendizado (Udemy/Alura)" },
      { id: "mentoria", label: "Programa de Mentoria & Carreira" },
    ],
  },
  {
    title: "Flexibilidade & Qualidade de Vida",
    icon: Smile,
    items: [
      { id: "horario_flexivel", label: "Horário 100% Flexível" },
      { id: "short_friday", label: "Short Friday (Sexta-feira mais curta)" },
      { id: "day_off_niver", label: "Day Off de Aniversário" },
      { id: "licenca_estendida", label: "Licença Maternidade/Paternidade Estendida" },
      { id: "no_dress_code", label: "No Dress Code (Venha como você é)" },
      { id: "pet_friendly", label: "Escritório Pet Friendly" },
      { id: "dias_pontes", label: "Emenda de Feriados" },
    ],
  },
  {
    title: "Financeiro & Reconhecimento",
    icon: Coins,
    items: [
      { id: "plr_bonus", label: "PLR / Bônus por Metas e Desempenho" },
      { id: "stock_options", label: "Stock Options / Partnership" },
      { id: "previdencia", label: "Previdência Privada com Coparticipação" },
      { id: "credito_consignado", label: "Acesso a Crédito Consignado / Adiantamento" },
      { id: "desconto_produtos", label: "Descontos em Produtos & Parcerias Comerciais" },
      { id: "aux_creche", label: "Auxílio Creche / Babá" },
    ],
  },
]
