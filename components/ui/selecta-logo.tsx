import Image from "next/image"
import { cn } from "@/lib/utils"

export function SelectaLogo({ className }: { className?: string }) {
  return (
    <Image
      src="/images/logo_selecta.svg"
      alt="Selecta"
      width={128}
      height={40}
      priority
      className={cn("h-9 w-auto", className)}
    />
  )
}
