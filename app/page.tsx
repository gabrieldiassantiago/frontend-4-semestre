import { getLatestVagasPublic } from "@/lib/services/vagas.public"
import { SAMPLE_JOBS } from "@/lib/data/landing"

import { LandingMotion } from "@/components/landing/landing-motion"
import { LandingHeader } from "@/components/landing/landing-header"
import { HeroSection } from "@/components/landing/hero-section"
import { AboutSection, FeaturesSection, HowItWorksSection, TipsSection, TestimonialsSection } from "@/components/landing/content-sections"
import { JobsSection } from "@/components/landing/jobs-section"
import { FaqSection } from "@/components/landing/faq-section"
import { CtaSection, LandingFooter } from "@/components/landing/cta-footer"

export const metadata = {
  title: "Encontre oportunidades que fazem sentido para você",
  description: "A Selecta conecta candidatos a empresas que olham de verdade para você, com transparência em cada etapa do processo seletivo.",
}

export default async function Home() {
  const live = await getLatestVagasPublic()
  const jobs = live.length >= 3 ? live : SAMPLE_JOBS

  return (
    <LandingMotion>
      <LandingHeader />
      <main>
        <HeroSection />
        <AboutSection />
        <FeaturesSection />
        <HowItWorksSection />
        <JobsSection jobs={jobs} />
        <TipsSection />
        <TestimonialsSection />
        <FaqSection />
        <CtaSection />
      </main>
      <LandingFooter />
    </LandingMotion>
  )
}
