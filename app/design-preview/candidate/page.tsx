import { Suspense } from "react"
import { notFound } from "next/navigation"
import { CandidatePreview } from "./candidate-preview"

export default function CandidatePreviewPage() {
  if (process.env.NODE_ENV === "production") notFound()
  return (
    <Suspense>
      <CandidatePreview />
    </Suspense>
  )
}
