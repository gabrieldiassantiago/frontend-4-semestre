"use client"

import { useSyncExternalStore } from "react"

function greetingFor(hour: number) {
  if (hour >= 5 && hour < 12) return "Bom dia"
  if (hour >= 12 && hour < 18) return "Boa tarde"
  return "Boa noite"
}

const subscribe = () => () => { }

export function OverviewGreeting({ firstName }: { firstName?: string }) {
  const greeting = useSyncExternalStore(
    subscribe,
    () => greetingFor(new Date().getHours()),
    () => "Olá",
  )

  return (
    <>
      {greeting}
      {firstName ? (
        <>
          , <span className="text-primary">{firstName}</span>
        </>
      ) : null}
    </>
  )
}

function todayLabel() {
  const label = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

/** Data de hoje por extenso; renderiza vazio no servidor para evitar mismatch. */
export function OverviewToday() {
  return <>{useSyncExternalStore(subscribe, todayLabel, () => "")}</>
}