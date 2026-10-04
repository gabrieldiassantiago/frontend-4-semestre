"use client"

import { useState } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { CompleteProfileWizard } from "@/components/candidate/profile/complete-profile-wizard"
import { queryKeys } from "@/lib/queries/keys"
import type { CandidateProfile } from "@/lib/types/candidate.types"

const PREVIEW_PROFILE: CandidateProfile = {
  id: "preview",
  userId: "preview",
  userName: "Carlos",
  userEmail: "carlosneyzika@gmail.com",
  headline: "Desenvolvedor de software",
  summary: "Sou estudante de engenharia da computação",
  phone: "12981082276",
  city: "Lorena",
  state: "SP",
}

/** Cliente isolado com o perfil já em cache, para que a prévia nunca chame a API. */
function createPreviewClient() {
  const client = new QueryClient({
    defaultOptions: { queries: { staleTime: Infinity, retry: false, refetchOnWindowFocus: false, refetchOnMount: false } },
  })
  client.setQueryData(queryKeys.candidateProfile.me(), PREVIEW_PROFILE)
  return client
}

export default function DesignPreviewPage() {
  const [client] = useState(createPreviewClient)
  return (
    <QueryClientProvider client={client}>
      <CompleteProfileWizard previewMode />
    </QueryClientProvider>
  )
}
