import { redirect } from "next/navigation"
import { ROUTES } from "@/lib/config/routes"

export default async function LegacyDashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(await searchParams)) {
    if (typeof value === "string") params.set(key, value)
  }
  const query = params.toString()

  redirect(query ? `${ROUTES.candidate.jobs}?${query}` : ROUTES.candidate.jobs)
}
