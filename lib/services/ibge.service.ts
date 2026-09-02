export interface EstadoIBGE {
  sigla: string
  nome: string
}

export interface LocalidadeOption {
  cidade: string
  estado: string
  label: string
}

export const POPULAR_LOCATIONS: LocalidadeOption[] = [
  { cidade: "São Paulo", estado: "SP", label: "São Paulo, SP" },
  { cidade: "Rio de Janeiro", estado: "RJ", label: "Rio de Janeiro, RJ" },
  { cidade: "Belo Horizonte", estado: "MG", label: "Belo Horizonte, MG" },
  { cidade: "Curitiba", estado: "PR", label: "Curitiba, PR" },
  { cidade: "Porto Alegre", estado: "RS", label: "Porto Alegre, RS" },
  { cidade: "Brasília", estado: "DF", label: "Brasília, DF" },
  { cidade: "Campinas", estado: "SP", label: "Campinas, SP" },
  { cidade: "Florianópolis", estado: "SC", label: "Florianópolis, SC" },
  { cidade: "Salvador", estado: "BA", label: "Salvador, BA" },
  { cidade: "Recife", estado: "PE", label: "Recife, PE" },
  { cidade: "Fortaleza", estado: "CE", label: "Fortaleza, CE" },
  { cidade: "Goiânia", estado: "GO", label: "Goiânia, GO" },
]

let cachedMunicipios: LocalidadeOption[] | null = null
let fetchMunicipiosPromise: Promise<LocalidadeOption[]> | null = null

/**
 * Busca a lista oficial de todos os Estados brasileiros do IBGE.
 */
export async function getEstadosIBGE(): Promise<EstadoIBGE[]> {
  try {
    const res = await fetch(
      "https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome",
      { cache: "force-cache" }
    )
    if (!res.ok) throw new Error("Erro ao consultar IBGE")
    const data = await res.json()
    return data.map((e: { sigla: string; nome: string }) => ({
      sigla: e.sigla,
      nome: e.nome,
    }))
  } catch (err) {
    console.error("Fallback estados IBGE", err)
    return [
      { sigla: "SP", nome: "São Paulo" },
      { sigla: "RJ", nome: "Rio de Janeiro" },
      { sigla: "MG", nome: "Minas Gerais" },
      { sigla: "RS", nome: "Rio Grande do Sul" },
      { sigla: "PR", nome: "Paraná" },
      { sigla: "SC", nome: "Santa Catarina" },
      { sigla: "BA", nome: "Bahia" },
      { sigla: "DF", nome: "Distrito Federal" },
      { sigla: "GO", nome: "Goiás" },
      { sigla: "PE", nome: "Pernambuco" },
      { sigla: "CE", nome: "Ceará" },
      { sigla: "ES", nome: "Espírito Santo" },
    ]
  }
}

/**
 * Busca todos os municípios de uma UF no IBGE.
 */
export async function getMunicipiosPorEstadoIBGE(uf: string): Promise<string[]> {
  if (!uf) return []
  try {
    const res = await fetch(
      `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`,
      { cache: "force-cache" }
    )
    if (!res.ok) throw new Error("Erro ao consultar municípios")
    const data = await res.json()
    return data.map((c: { nome: string }) => c.nome)
  } catch (err) {
    console.error(`Erro ao buscar municípios para ${uf}:`, err)
    return []
  }
}

/**
 * Busca unificada de Cidade + Estado (ex: "São Paulo, SP" ou "Campinas")
 * com fallback e autocomplete inteligente.
 */
export async function searchLocalidades(termo: string): Promise<LocalidadeOption[]> {
  const query = termo.trim().toLowerCase()
  if (!query) return POPULAR_LOCATIONS

  // Se já temos em cache ou podemos buscar municípios
  if (!cachedMunicipios && !fetchMunicipiosPromise) {
    fetchMunicipiosPromise = fetch(
      "https://servicodados.ibge.gov.br/api/v1/localidades/municipios",
      { cache: "force-cache" }
    )
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const list: LocalidadeOption[] = data.map((m: any) => ({
          cidade: m.nome,
          estado: m.microrregiao?.mesorregiao?.UF?.sigla ?? "",
          label: `${m.nome}, ${m.microrregiao?.mesorregiao?.UF?.sigla ?? ""}`,
        }))
        cachedMunicipios = list
        return list
      })
      .catch(() => {
        cachedMunicipios = POPULAR_LOCATIONS
        return POPULAR_LOCATIONS
      })
  }

  const all = cachedMunicipios || (await fetchMunicipiosPromise) || POPULAR_LOCATIONS

  return all
    .filter(
      (item) =>
        item.cidade.toLowerCase().includes(query) ||
        item.estado.toLowerCase() === query ||
        item.label.toLowerCase().includes(query)
    )
    .slice(0, 15)
}

