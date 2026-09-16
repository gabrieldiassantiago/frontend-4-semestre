"use client"

import { SWRConfig } from "swr"
import { CompleteProfileWizard } from "@/components/candidate/profile/complete-profile-wizard"

export default function DesignPreviewPage() {
  return (
    <SWRConfig
      value={{
        fallback: {
          "candidate-profile/me": {
            id: "preview",
            userId: "preview",
            userName: "Carlos",
            userEmail: "carlosneyzika@gmail.com",
            headline: "Desenvolvedor de software",
            summary: "Sou estudante de engenharia da computação",
            phone: "12981082276",
            city: "Lorena",
            state: "SP",
          },
        },
        revalidateOnFocus: false,
        revalidateOnMount: false,
        revalidateOnReconnect: false,
      }}
    >
      <CompleteProfileWizard />
    </SWRConfig>
  )
}
