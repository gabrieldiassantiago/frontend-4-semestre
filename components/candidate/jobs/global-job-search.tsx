"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { CornerDownLeft, Search, X } from "lucide-react"
import { ROUTES } from "@/lib/config/routes"

/** Id do campo de busca principal da tela de vagas (alvo do atalho Ctrl/Cmd+K). */
export const JOB_PAGE_SEARCH_ID = "job-page-search"

/** Busca da topbar: leva o termo para a tela de vagas via `?q=`. Atalho: "/" ou Ctrl/Cmd+K. */
export function GlobalJobSearch() {
  const router = useRouter()
  const pathname = usePathname()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState("")
  const [focused, setFocused] = useState(false)
  // Na tela de vagas já existe uma busca principal: evitamos duplicá-la na topbar.
  const hasPageSearch = pathname === ROUTES.candidate.jobs

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null
      const typing = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)
      const combo = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k"
      if (combo || (event.key === "/" && !typing)) {
        event.preventDefault()
        const pageInput = document.getElementById(JOB_PAGE_SEARCH_ID) as HTMLInputElement | null
        ;(pageInput ?? inputRef.current)?.focus()
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  if (hasPageSearch) return null

  return (
    <motion.form
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
      <motion.span
        aria-hidden
        animate={{ scale: focused ? 1.1 : 1, color: focused ? "var(--primary)" : "var(--subtle-foreground)" }}
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2"
      >
        <Search className="size-4" />
      </motion.span>
      <input
        ref={inputRef}
        id="global-job-search"
        type="text"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="Buscar vagas ou empresas"
        autoComplete="off"
        className="h-11 w-full rounded-full border border-transparent bg-surface pl-11 pr-20 text-sm text-foreground transition-colors placeholder:text-muted-foreground hover:border-border focus:border-primary focus:bg-card focus:outline-none focus:ring-[3px] focus:ring-primary/10"
      />
      <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1.5">
        <AnimatePresence mode="wait" initial={false}>
          {query ? (
            <motion.button
              key="clear"
              type="button"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => {
                setQuery("")
                inputRef.current?.focus()
              }}
              aria-label="Limpar busca"
              className="grid size-6 place-items-center rounded-full bg-border text-strong-foreground transition-colors hover:bg-border-strong"
            >
              <X className="size-3.5" aria-hidden />
            </motion.button>
          ) : focused ? (
            <motion.span
              key="enter"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-1 text-[11px] font-medium text-subtle-foreground"
            >
              Enter <CornerDownLeft className="size-3" aria-hidden />
            </motion.span>
          ) : (
            <motion.kbd
              key="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-full border border-border bg-card px-2 py-0.5 font-sans text-[11px] font-medium text-muted-foreground"
            >
              Ctrl K
            </motion.kbd>
          )}
        </AnimatePresence>
      </div>
    </motion.form>
  )
}
