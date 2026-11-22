"use client"

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

export interface SelectOption {
  value: string
  label: string
  /** Texto de apoio exibido abaixo do rótulo na lista. */
  hint?: string
  disabled?: boolean
}

interface SelectProps {
  id?: string
  value: string
  onValueChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  disabled?: boolean
  /** Marca o campo com a cor de erro. */
  invalid?: boolean
  /** `field` acompanha os campos de formulário; `pill` é para filtros e ações compactas. */
  variant?: "field" | "pill"
  className?: string
  "aria-label"?: string
  "aria-labelledby"?: string
}

interface MenuPosition {
  left: number
  width: number
  top?: number
  bottom?: number
  maxHeight: number
  flipped: boolean
}

const MENU_GAP = 6
const MENU_MAX_HEIGHT = 288

function firstEnabled(options: SelectOption[], from = 0, step = 1) {
  for (let i = from; i >= 0 && i < options.length; i += step) {
    if (!options[i].disabled) return i
  }
  return -1
}

/**
 * Seletor próprio da Selecta. Substitui o `<select>` nativo para manter o
 * visual da marca. Teclado: setas, Home/End, Enter/Espaço e Esc.
 * A lista é renderizada em um portal, então não é cortada por modais.
 */
export function Select({
  id,
  value,
  onValueChange,
  options,
  placeholder = "Selecione",
  disabled,
  invalid,
  variant = "field",
  className,
  ...aria
}: SelectProps) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const [position, setPosition] = useState<MenuPosition | null>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const listboxId = useId()
  const reduceMotion = useReducedMotion()

  const selectedIndex = options.findIndex((option) => option.value === value)
  const selected = selectedIndex >= 0 ? options[selectedIndex] : undefined

  function measure() {
    const rect = triggerRef.current?.getBoundingClientRect()
    if (!rect) return
    const spaceBelow = window.innerHeight - rect.bottom - MENU_GAP
    const spaceAbove = rect.top - MENU_GAP
    const flipped = spaceBelow < 200 && spaceAbove > spaceBelow
    const space = flipped ? spaceAbove : spaceBelow
    setPosition({
      left: rect.left,
      width: rect.width,
      top: flipped ? undefined : rect.bottom + MENU_GAP,
      bottom: flipped ? window.innerHeight - rect.top + MENU_GAP : undefined,
      maxHeight: Math.min(MENU_MAX_HEIGHT, Math.max(120, space)),
      flipped,
    })
  }

  function openMenu() {
    if (disabled) return
    measure()
    setActive(selectedIndex >= 0 && !options[selectedIndex].disabled ? selectedIndex : firstEnabled(options))
    setOpen(true)
  }

  function closeMenu(restoreFocus: boolean) {
    setOpen(false)
    if (restoreFocus) triggerRef.current?.focus()
  }

  function choose(index: number) {
    const option = options[index]
    if (!option || option.disabled) return
    onValueChange(option.value)
    closeMenu(true)
  }

  // Foco na lista ao abrir, fecha ao clicar fora e acompanha a rolagem.
  useEffect(() => {
    if (!open) return
    listRef.current?.focus({ preventScroll: true })

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node
      if (triggerRef.current?.contains(target) || listRef.current?.contains(target)) return
      closeMenu(false)
    }
    const onReposition = () => measure()

    document.addEventListener("pointerdown", onPointerDown)
    window.addEventListener("resize", onReposition)
    window.addEventListener("scroll", onReposition, true)
    return () => {
      document.removeEventListener("pointerdown", onPointerDown)
      window.removeEventListener("resize", onReposition)
      window.removeEventListener("scroll", onReposition, true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // Mantém a opção destacada visível na lista rolável.
  useEffect(() => {
    if (!open || active < 0) return
    listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" })
  }, [active, open])

  function onTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
      event.preventDefault()
      if (!open) openMenu()
    }
  }

  function onListKeyDown(event: KeyboardEvent<HTMLUListElement>) {
    // Impede que Esc e as setas cheguem ao modal que contém o campo.
    event.stopPropagation()
    switch (event.key) {
      case "ArrowDown": {
        event.preventDefault()
        const next = firstEnabled(options, active + 1, 1)
        if (next !== -1) setActive(next)
        break
      }
      case "ArrowUp": {
        event.preventDefault()
        const previous = firstEnabled(options, active - 1, -1)
        if (previous !== -1) setActive(previous)
        break
      }
      case "Home":
        event.preventDefault()
        setActive(firstEnabled(options, 0, 1))
        break
      case "End":
        event.preventDefault()
        setActive(firstEnabled(options, options.length - 1, -1))
        break
      case "Enter":
      case " ":
        event.preventDefault()
        if (active >= 0) choose(active)
        break
      case "Escape":
        event.preventDefault()
        closeMenu(true)
        break
      case "Tab":
        closeMenu(false)
        break
    }
  }

  return (
    <>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        disabled={disabled}
        onClick={() => (open ? closeMenu(false) : openMenu())}
        onKeyDown={onTriggerKeyDown}
        {...aria}
        className={cn(
          "group flex w-full min-w-0 items-center justify-between gap-2 border text-left outline-none transition-[border-color,box-shadow,background-color] duration-150 disabled:cursor-not-allowed disabled:opacity-60",
          variant === "field"
            ? "min-h-12 rounded-xl bg-background px-3.5 py-2.5 text-sm text-foreground"
            : "h-10 rounded-full bg-card px-4 text-xs font-semibold text-strong-foreground sm:w-auto",
          invalid ? "border-danger" : open ? "border-primary" : "border-border hover:border-border-strong",
          "focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-primary/15",
          open && "ring-[3px] ring-primary/15",
          className,
        )}
      >
        <span className={cn("truncate", !selected && "text-subtle-foreground")}>{selected?.label ?? placeholder}</span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
            open && "rotate-180 text-primary",
          )}
          aria-hidden
        />
      </button>

      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {open && position && (
              <motion.ul
                key="menu"
                ref={listRef}
                id={listboxId}
                role="listbox"
                tabIndex={-1}
                aria-labelledby={id}
                aria-activedescendant={active >= 0 ? `${listboxId}-${active}` : undefined}
                onKeyDown={onListKeyDown}
                onPointerDown={(event) => event.stopPropagation()}
                onClick={(event) => event.stopPropagation()}
                initial={reduceMotion ? false : { opacity: 0, y: position.flipped ? 6 : -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  position: "fixed",
                  left: position.left,
                  width: position.width,
                  top: position.top,
                  bottom: position.bottom,
                  maxHeight: position.maxHeight,
                  transformOrigin: position.flipped ? "bottom" : "top",
                }}
                className="z-[70] overflow-y-auto overscroll-contain rounded-2xl border border-border bg-card p-1.5 shadow-overlay outline-none"
              >
                {options.map((option, index) => {
                  const isSelected = index === selectedIndex
                  const isActive = index === active
                  return (
                    <li
                      key={option.value}
                      id={`${listboxId}-${index}`}
                      data-index={index}
                      role="option"
                      aria-selected={isSelected}
                      aria-disabled={option.disabled || undefined}
                      onMouseEnter={() => !option.disabled && setActive(index)}
                      onPointerDown={(event) => event.preventDefault()}
                      onClick={() => choose(index)}
                      className={cn(
                        "flex min-h-10 cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm transition-colors",
                        option.disabled && "cursor-not-allowed opacity-40",
                        isActive && !option.disabled && "bg-primary-subtle/70",
                        isSelected ? "font-semibold text-primary-subtle-foreground" : "text-strong-foreground",
                      )}
                    >
                      <span className="min-w-0">
                        <span className="block truncate">{option.label}</span>
                        {option.hint && <span className="mt-0.5 block text-xs font-normal text-muted-foreground">{option.hint}</span>}
                      </span>
                      {isSelected && <Check className="size-4 shrink-0 text-primary" aria-hidden />}
                    </li>
                  )
                })}
              </motion.ul>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  )
}
