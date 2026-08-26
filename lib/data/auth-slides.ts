export interface AuthSlide {
  image: string
  imageAlt: string
  quote: string
  author: string
  authorRole: string
  cta: string
}

export const AUTH_SLIDES: AuthSlide[] = [
  {
    image: "/images/candidato.png",
    imageAlt: "Engenheira de software trabalhando no computador",
    quote: "Essa plataforma tornou a busca por estágio mais humana, transparente e acolhedora.",
    author: "Mirella Viana",
    authorRole: "Engenheira de Software",
    cta: "Conheça a experiência",
  },
  {
    image: "/images/recrutador.png",
    imageAlt: "Recrutadora analisando currículos em um escritório moderno",
    quote:
      "Contratamos mais rápido e com muito mais qualidade desde que começamos a usar a Selecta.",
    author: "Rafael Costa",
    authorRole: "Head de Talent Acquisition",
    cta: "Conheça a experiência",
  },
  {
    image: "/images/candidato.png",
    imageAlt: "Profissional trabalhando em um ambiente moderno",
    quote:
      "Consegui acompanhar cada etapa do processo e finalmente entendi o que as empresas esperavam de mim.",
    author: "Ana Oliveira",
    authorRole: "Desenvolvedora Front-end",
    cta: "Conheça a experiência",
  },
  {
    image: "/images/recrutador.png",
    imageAlt: "Equipe de recrutamento trabalhando",
    quote:
      "A Selecta deixou nosso processo seletivo mais organizado, transparente e próximo dos candidatos.",
    author: "Lucas Martins",
    authorRole: "People & Culture",
    cta: "Conheça a experiência",
  },
]
