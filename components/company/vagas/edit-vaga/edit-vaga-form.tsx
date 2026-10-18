"use client"

import type { Vaga } from "@/lib/types/vaga.types"
import { VagaFlow } from "../nova-vaga/nova-vaga-form"

/** A edição reaproveita o mesmo fluxo em etapas da criação, já com os dados da vaga. */
export function EditVagaForm({ vaga }: { vaga: Vaga }) {
  return <VagaFlow vaga={vaga} />
}
