export const MAX_RESUME_SIZE = 10 * 1024 * 1024

export async function validateResume(file: File): Promise<string | null> {
  if (!file.name.toLowerCase().endsWith(".pdf") || (file.type && file.type !== "application/pdf")) {
    return "Selecione um arquivo PDF."
  }
  if (file.size > MAX_RESUME_SIZE) return "O PDF deve ter no máximo 10 MB."
  if (await file.slice(0, 5).text() !== "%PDF-") return "Este arquivo não é um PDF válido."
  return null
}
