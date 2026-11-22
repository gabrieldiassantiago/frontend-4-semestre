import { fetchPrivateFile } from "@/lib/server/api"
import { attachmentApiPath, SAFE_ATTACHMENT_TYPES } from "@/lib/utils/attachment"

export async function GET(_request: Request, context: { params: Promise<{ segments: string[] }> }) {
  const { segments } = await context.params
  const headers = new Headers({ "Cache-Control": "private, no-store" })
  const apiPath = attachmentApiPath(segments)
  if (!apiPath) return new Response(null, { status: 404, headers })

  try {
    const upstream = await fetchPrivateFile(apiPath)
    if (!upstream.ok) return new Response(null, { status: upstream.status, headers })

    const contentType = upstream.headers.get("Content-Type")?.split(";")[0].trim() ?? ""
    const safe = SAFE_ATTACHMENT_TYPES.includes(contentType)
    headers.set("Content-Type", safe ? contentType : "application/octet-stream")
    headers.set("Content-Disposition", safe ? "inline" : "attachment")
    const disposition = upstream.headers.get("Content-Disposition")
    if (disposition) headers.set("Content-Disposition", safe ? disposition : disposition.replace(/^inline/i, "attachment"))
    headers.set("X-Content-Type-Options", "nosniff")
    headers.set("Content-Security-Policy", "sandbox")
    return new Response(upstream.body, { headers })
  } catch {
    return new Response("Não foi possível carregar o anexo.", { status: 502, headers })
  }
}
