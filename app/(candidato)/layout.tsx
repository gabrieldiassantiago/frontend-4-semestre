import { CandidateAppShell } from "@/components/layout/candidate-app-shell"

export default function CandidatoLayout({ children }: { children: React.ReactNode }) {
  return <CandidateAppShell>{children}</CandidateAppShell>
}
