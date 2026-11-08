import { fetchPrivateResume } from "@/lib/server/api"
import { resumeHref } from "@/lib/utils/resume"

export async function GET(_request: Request, context: { params: Promise<{ userId: string; file: string }> }) {
  const { userId, file } = await context.params
  const headers = new Headers({ "Cache-Control": "private, no-store" })
  if (!resumeHref(`/candidate-profile/${userId}/resume/${file}`)) {
    return new Response(null, { status: 404, headers })
  }
  try {
    const upstream = await fetchPrivateResume(userId, file)
    if (!upstream.ok) return new Response("Currículo indisponível.", { status: upstream.status, headers })
    headers.set("Content-Type", "application/pdf")
    headers.set("Content-Disposition", 'inline; filename="curriculo.pdf"')
    headers.set("X-Content-Type-Options", "nosniff")
    headers.set("Content-Security-Policy", "sandbox")
    return new Response(upstream.body, { headers })
  } catch {
    return new Response("Não foi possível carregar o currículo.", { status: 502, headers })
  }
}
