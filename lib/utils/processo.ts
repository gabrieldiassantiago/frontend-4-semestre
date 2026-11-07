export function normalizarProcesso<T>(value: T): T {
  if (Array.isArray(value)) return value.map(normalizarProcesso) as T
  if (!value || typeof value !== "object") return value
  const item = Object.fromEntries(Object.entries(value).map(([key, child]) => [key, normalizarProcesso(child)]))
  if (typeof item.etapaId === "string") item.etapa = item.etapaId
  if (typeof item.IdEtapaAtual === "string" || typeof item.idEtapaAtual === "string") {
    item.etapaAtual = item.IdEtapaAtual ?? item.idEtapaAtual
  }
  for (const key of ["etapaAnterior", "etapaNova"]) {
    const etapa = item[key]
    if (etapa && typeof etapa === "object" && "id" in etapa) {
      item[`${key}Descricao`] = "nome" in etapa ? etapa.nome : undefined
      item[key] = etapa.id
    }
  }
  return item as T
}

export function payloadEtapa<T extends { etapa: string }>(dto: T) {
  const { etapa, ...rest } = dto
  return { ...rest, etapaId: etapa }
}
