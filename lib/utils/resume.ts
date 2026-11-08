const uuid = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}"
const privateResumePath = new RegExp(`^/candidate-profile/(${uuid})/resume/(${uuid}\\.pdf)$`, "i")

export function resumeHref(value?: string | null) {
  if (!value) return null
  const match = privateResumePath.exec(value)
  if (match) return `/api/curriculos/${match[1]}/${match[2]}`
  try {
    const url = new URL(value)
    return ["https:", "http:"].includes(url.protocol) ? url.href : null
  } catch {
    return null
  }
}

export const MAX_RESUME_SIZE = 10 * 1024 * 1024

export async function validateResume(file: File): Promise<string | null> {
  if (!file.name.toLowerCase().endsWith(".pdf") || (file.type && file.type !== "application/pdf")) {
    return "Selecione um arquivo PDF."
  }
  if (file.size > MAX_RESUME_SIZE) return "O PDF deve ter no máximo 10 MB."
  if (await file.slice(0, 5).text() !== "%PDF-") return "Este arquivo não é um PDF válido."
  return null
}
