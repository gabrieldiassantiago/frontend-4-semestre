import { notFound } from "next/navigation"
import { ApplicationPreview } from "./application-preview"
export default function ApplicationPreviewPage() {
  if (process.env.NODE_ENV === "production") notFound()
  return <ApplicationPreview />
}
