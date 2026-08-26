import { Suspense } from "react"
import { OnboardingWizardScreen } from "@/components/auth/onboarding-wizard-screen"

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <OnboardingWizardScreen />
    </Suspense>
  )
}
