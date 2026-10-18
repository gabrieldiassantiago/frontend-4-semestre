"use client"

import { createContext, useContext } from "react"
import { FLOW_STEPS, type FlowStep } from "./steps"

export type FlowMode = "create" | "edit"

const FlowContext = createContext<{ steps: FlowStep[]; mode: FlowMode }>({ steps: FLOW_STEPS, mode: "create" })

export const FlowProvider = FlowContext.Provider

/** Etapas ativas e modo do fluxo (criação ou edição de vaga). */
export function useFlow() {
  return useContext(FlowContext)
}
