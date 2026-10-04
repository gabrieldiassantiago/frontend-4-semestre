"use client"

import { useSyncExternalStore } from "react"

function greetingFor(hour: number) {
  if (hour >= 5 && hour < 12) return "Bom dia"
  if (hour >= 12 && hour < 18) return "Boa tarde"
  return "Boa noite"
}

const subscribe = () => () => {}

/** Saudação pelo horário local; no servidor usa um texto neutro para evitar mismatch. */
export function OverviewGreeting({ firstName }: { firstName?: string }) {
  const greeting = useSyncExternalStore(subscribe, () => greetingFor(new Date().getHours()), () => "Olá")
  return (
    <>
      {greeting}
      {firstName ? `, ${firstName}` : ""}
    </>
  )
}
