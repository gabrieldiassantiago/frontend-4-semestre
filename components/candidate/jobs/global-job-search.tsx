"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { ROUTES } from "@/lib/config/routes"

/** Busca da topbar: leva o termo para a tela de vagas via `?q=`. */
export function GlobalJobSearch() {
  const router = useRouter()
  const [query, setQuery] = useState("")

  return (
    <form
      role="search"
      className="relative hidden w-full max-w-md md:block"
      onSubmit={(event) => {
        event.preventDefault()
        const term = query.trim()
        router.push(term ? ROUTES.candidate.jobSearch(term) : ROUTES.candidate.jobs)
      }}
    >
      <label htmlFor="global-job-search" className="sr-only">
        Buscar vagas
      </label>
      <Search aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-subtle-foreground" />
      <input
        id="global-job-search"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Buscar vagas, empresas ou palavras-chave"
        className="h-10 w-full rounded-lg border border-border bg-surface pl-10 pr-3 text-sm text-foreground transition-colors placeholder:text-subtle-foreground hover:border-border-strong focus:border-primary focus:bg-card focus:outline-none focus:ring-3 focus:ring-primary/10"
      />
    </form>
  )
}
