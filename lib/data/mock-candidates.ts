export interface MockCandidate {
  name: string
  role: string
  score: number
  initials: string
}

export const MOCK_CANDIDATES: MockCandidate[] = [
  { name: "Marina Alves", role: "Front-end Developer", score: 94, initials: "MA" },
  { name: "Lucas Ferreira", role: "Desenvolvedor Java", score: 89, initials: "LF" },
  { name: "Ana Beatriz", role: "Product Designer", score: 86, initials: "AB" },
  { name: "Rafael Santos", role: "Full Stack Developer", score: 82, initials: "RS" },
]
