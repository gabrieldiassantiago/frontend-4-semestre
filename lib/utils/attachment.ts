const UUID = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}"
const ATTACHMENT_PATH = new RegExp(
  `^/candidate-profile/(${UUID})/(certificates/${UUID}/file|languages/${UUID}/certificate)$`,
  "i",
)

/** Tipos que o navegador pode exibir inline; qualquer outro vira download. */
export const SAFE_ATTACHMENT_TYPES = ["application/pdf", "image/png", "image/jpeg"]

export const MAX_ATTACHMENT_SIZE = 5 * 1024 * 1024
export const ATTACHMENT_ACCEPT = ".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"

const ALLOWED_EXTENSIONS = [".pdf", ".png", ".jpg", ".jpeg"]
const ALLOWED_MIME = ["application/pdf", "image/png", "image/jpeg", "image/jpg"]

/** Validação rápida no cliente. O servidor confere o conteúdo real do arquivo. */
export function validateAttachment(file: File): string | null {
  if (file.size === 0) return "Selecione um arquivo."
  if (file.size > MAX_ATTACHMENT_SIZE) return "O arquivo deve ter no máximo 5 MB."
  const name = file.name.toLowerCase()
  const extensionOk = ALLOWED_EXTENSIONS.some((extension) => name.endsWith(extension))
  const mimeOk = !file.type || ALLOWED_MIME.includes(file.type)
  if (!extensionOk || !mimeOk) return "Formato inválido. Envie um arquivo PDF, PNG ou JPEG."
  return null
}

/** Converte `segments` da rota `/api/anexos/[...segments]` no caminho da API, ou `null` se inválido. */
export function attachmentApiPath(segments: string[]) {
  const path = "/candidate-profile/" + segments.join("/")
  return ATTACHMENT_PATH.test(path) ? path : null
}

/** Converte o `fileUrl`/`certificateUrl` da API em uma URL local autenticada pelo proxy. */
export function attachmentHref(apiPath?: string | null) {
  if (!apiPath || !ATTACHMENT_PATH.test(apiPath)) return null
  return "/api/anexos" + apiPath.slice("/candidate-profile".length)
}
