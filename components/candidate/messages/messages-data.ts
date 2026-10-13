export type Conversation = {
  id: string
  company: string
  recruiter: string
  role: string
  lastMessage: string
  time: string
  unread: number
  online?: boolean
}

export type ChatMessage =
  | { id: string; kind: "date"; label: string }
  | { id: string; kind: "event"; text: string }
  | { id: string; kind: "text"; from: "me" | "them"; text: string; time: string; read?: boolean }
  | { id: string; kind: "file"; from: "me" | "them"; name: string; size: string; time: string; read?: boolean }

export const CONVERSATIONS: Conversation[] = [
  {
    id: "1",
    company: "Nubank",
    recruiter: "Mariana Costa",
    role: "Desenvolvedor Front-end Pleno",
    lastMessage: "Perfeito! Te envio o convite da entrevista ainda hoje.",
    time: "10:42",
    unread: 2,
    online: true,
  },
  {
    id: "2",
    company: "iFood",
    recruiter: "Rafael Mendes",
    role: "Engenheiro de Software",
    lastMessage: "Você: Obrigado pelo retorno, fico no aguardo!",
    time: "Ontem",
    unread: 0,
  },
  {
    id: "3",
    company: "Stone",
    recruiter: "Juliana Prado",
    role: "Desenvolvedor React",
    lastMessage: "Pode compartilhar seu portfólio atualizado?",
    time: "Seg",
    unread: 1,
    online: true,
  },
  {
    id: "4",
    company: "Totvs",
    recruiter: "Bruno Almeida",
    role: "Estágio em Desenvolvimento",
    lastMessage: "Agradecemos sua participação no processo.",
    time: "12 mai",
    unread: 0,
  },
  {
    id: "5",
    company: "Embraer",
    recruiter: "Patrícia Lima",
    role: "Analista de Sistemas Jr.",
    lastMessage: "Você: Combinado, até quinta!",
    time: "08 mai",
    unread: 0,
  },
]

export const ACTIVE_THREAD: ChatMessage[] = [
  { id: "d1", kind: "date", label: "Ontem" },
  { id: "e1", kind: "event", text: "Sua candidatura avançou para a etapa Entrevista técnica" },
  {
    id: "m1",
    kind: "text",
    from: "them",
    text: "Oi, Carlos! Tudo bem? Gostamos muito do seu perfil e do teste técnico. Queremos te chamar para a próxima etapa.",
    time: "16:20",
  },
  {
    id: "m2",
    kind: "text",
    from: "them",
    text: "A entrevista dura cerca de 1h, com duas pessoas do time de produto. Você teria disponibilidade nesta semana?",
    time: "16:21",
  },
  { id: "d2", kind: "date", label: "Hoje" },
  {
    id: "m3",
    kind: "text",
    from: "me",
    text: "Oi, Mariana! Tudo ótimo, que notícia boa. Tenho disponibilidade na quinta à tarde ou na sexta pela manhã.",
    time: "10:30",
    read: true,
  },
  {
    id: "m4",
    kind: "file",
    from: "me",
    name: "Curriculo_Carlos_Silva.pdf",
    size: "248 KB",
    time: "10:31",
    read: true,
  },
  {
    id: "m5",
    kind: "text",
    from: "them",
    text: "Perfeito! Quinta às 14h funciona para o time. Te envio o convite da entrevista ainda hoje.",
    time: "10:42",
  },
]
