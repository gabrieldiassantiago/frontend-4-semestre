import type { CandidaturaHistorico, EtapaProcesso } from "@/lib/types/candidatura.types"

const DIA_MS = 24 * 60 * 60 * 1000

/** A partir de quantos dias sem movimentação o processo é considerado parado. */
export const DIAS_SEM_MOVIMENTACAO_ALERTA = 7

/**
 * Data em que a candidatura entrou na etapa atual, segundo o histórico.
 * Usa a última entrada cuja etapa nova é a etapa atual; se não houver,
 * a entrada mais recente do histórico.
 */
export function entradaNaEtapaAtual(historico: CandidaturaHistorico[], etapaAtual: EtapaProcesso): string | undefined {
  const ordenado = [...historico]
    .filter(item => item.createdAt)
    .sort((a, b) => Date.parse(b.createdAt!) - Date.parse(a.createdAt!))
  return (ordenado.find(item => item.etapaNova === etapaAtual) ?? ordenado[0])?.createdAt
}

/** Dias inteiros desde a data informada (0 = hoje). */
export function diasDesde(data: string | undefined, agora: number = Date.now()): number | undefined {
  if (!data) return undefined
  const instante = Date.parse(data)
  if (Number.isNaN(instante)) return undefined
  return Math.max(0, Math.floor((agora - instante) / DIA_MS))
}

/** "hoje", "há 1 dia", "há 12 dias". */
export function descreverDias(dias: number): string {
  if (dias === 0) return "hoje"
  return dias === 1 ? "há 1 dia" : `há ${dias} dias`
}
