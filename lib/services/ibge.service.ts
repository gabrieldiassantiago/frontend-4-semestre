export interface EstadoIBGE {
  sigla: string
  nome: string
}

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
