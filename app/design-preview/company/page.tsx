import { Suspense } from "react"
import { notFound } from "next/navigation"
import { CompanyPreview } from "./company-preview"

export default function CompanyPreviewPage() {
  if (process.env.NODE_ENV === "production") notFound()
  return <Suspense><CompanyPreview /></Suspense>
}
