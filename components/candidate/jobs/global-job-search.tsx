"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { CornerDownLeft, Search, X } from "lucide-react"
import { ROUTES } from "@/lib/config/routes"

/** Busca da topbar: leva o termo para a tela de vagas via `?q=`. Atalho: "/" ou Ctrl/Cmd+K. */
export function GlobalJobSearch() {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState("")
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null
      const typing = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)
      const combo = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k"
      if (combo || (event.key === "/" && !typing)) {
        event.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  return (
    <motion.form
      role="search"
      className="relative hidden w-full max-w-sm md:block"
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
        className="h-10 w-full rounded-lg border border-border/60 bg-surface/70 pl-11 pr-20 text-xs text-foreground transition-colors placeholder:text-muted-foreground hover:border-border-strong focus:border-primary/40 focus:bg-card focus:outline-none focus:ring-2 focus:ring-primary/10"
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
              className="rounded-md border border-border bg-card px-1.5 py-0.5 font-sans text-[11px] font-medium text-subtle-foreground"
            >
              Ctrl K
            </motion.kbd>
          )}
        </AnimatePresence>
      </div>
    </motion.form>
  )
}
