import { notFound } from "next/navigation"
import { ProfilePreview } from "./profile-preview"
export default function Page() { if(process.env.NODE_ENV === "production") notFound(); return <ProfilePreview /> }
