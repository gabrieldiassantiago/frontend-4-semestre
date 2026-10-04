/** Converte o HTML do editor em texto estruturado, sem inserir HTML na página. */
export function normalizeVagaDescription(source: string) {
  if (!/<\/?[a-z][^>]*>/i.test(source)) return source
  const compact = (text: string) => text.replace(/\s+/g, " ").trim()
  return source
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, "")
    .replace(/<(strong|b)\b[^>]*>([\s\S]*?)<\/\1>/gi, "**$2**")
    .replace(/<h[1-6]\b[^>]*>([\s\S]*?)<\/h[1-6]>/gi, "\n\n### $1\n\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div)>/gi, "\n\n")
    .replace(/<ol\b[^>]*>([\s\S]*?)<\/ol>/gi, (_, content: string) => {
      let index = 0
      return "\n\n" + content.replace(/<li\b[^>]*>([\s\S]*?)<\/li>/gi, (_: string, item: string) => (++index) + ". " + compact(item.replace(/<[^>]*>/g, "")) + "\n") + "\n"
    })
    .replace(/<li\b[^>]*>([\s\S]*?)<\/li>/gi, (_, item: string) => "\n- " + compact(item.replace(/<[^>]*>/g, "")))
    .replace(/<\/?(ul|ol)\b[^>]*>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&#(x[0-9a-f]+|[0-9]+);/gi, (_, entity: string) => {
      const code = entity[0].toLowerCase() === "x" ? parseInt(entity.slice(1), 16) : Number(entity)
      return code >= 0 && code <= 0x10ffff ? String.fromCodePoint(code) : ""
    })
    .replace(/&nbsp;/gi, " ").replace(/&quot;/gi, '"').replace(/&apos;/gi, "'")
    .replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/&amp;/gi, "&")
    .trim()
}
