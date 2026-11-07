export interface TipoEtapa {
  id_etapa: string
  nome: string
  descricao: string
  company_id: string | null
  isSystem: boolean
  em_uso: boolean
  disponibilidade: boolean
}

export interface CreateEtapaDto {
  nomeEtapa: string
  descricao: string
}
