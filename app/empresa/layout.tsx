import { CompanyAppShell } from "@/components/layout/company-app-shell"

export default function CompanyLayout({ children }: { children: React.ReactNode }) {
  return <CompanyAppShell>{children}</CompanyAppShell>
}
