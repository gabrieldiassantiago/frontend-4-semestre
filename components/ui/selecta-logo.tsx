import Image from "next/image"
import { cn } from "@/lib/utils"

export function SelectaLogo({ className, solo = false }: { className?: string; solo?: boolean }) {
  return (
    <Image
      src={solo ? "/images/selecta_solo.svg" : "/images/logo_selecta.svg"}
      alt="Selecta"
      width={solo ? 42 : 142}
      height={40}
      priority
      className={cn("h-9 w-auto", className)}
    />
  )
}
