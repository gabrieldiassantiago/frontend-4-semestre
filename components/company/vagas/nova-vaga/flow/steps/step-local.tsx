"use client"

import { AnimatePresence, motion } from "framer-motion"
import { Globe2, MapPin } from "lucide-react"
import { AddressAutocomplete } from "@/components/company/vagas/address-autocomplete"
import { QuestionHeader } from "../primitives"
import type { StepProps } from "../types"

export function StepLocal({ draft, update, errors }: StepProps) {
  const hasLocation = Boolean(draft.cidade)

  return (
    <div>
      <QuestionHeader stepId="local" />

      <div className="rounded-panel border border-border bg-card p-5 sm:p-6">
        <AddressAutocomplete
          label="Endereço ou ponto de referência"
          initialCity={draft.cidade}
          initialState={draft.estado}
          initialCoords={{ latitude: draft.latitude, longitude: draft.longitude }}
          onSelectLocation={(location) =>
            update({
              cidade: location.cidade,
              estado: location.estado,
              latitude: location.latitude,
              longitude: location.longitude,
            })
          }
          error={errors.cidade}
          showCoordinates={false}
        />

        <AnimatePresence initial={false}>
          {hasLocation && (
            <motion.div
              key={`${draft.cidade}-${draft.estado}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-5 flex items-center gap-3 rounded-2xl bg-primary-subtle p-4"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
                <MapPin className="size-5" aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="block text-xs font-medium text-primary-subtle-foreground">
                  Vaga localizada em
                </span>
                <span className="block truncate text-base font-semibold text-foreground">
                  {draft.cidade}
                  {draft.estado ? `, ${draft.estado}` : ""}
                </span>
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {draft.modalidade === "REMOTO" && (
        <aside className="mt-5 flex items-start gap-3 rounded-2xl border border-success-border bg-success-subtle p-4 text-sm leading-relaxed text-success-foreground">
          <Globe2 className="mt-0.5 size-4 shrink-0" aria-hidden />
          <p>
            <strong className="font-semibold">Vaga remota:</strong> a cidade serve só como base
            fiscal e referência de fuso horário.
          </p>
        </aside>
      )}
    </div>
  )
}
