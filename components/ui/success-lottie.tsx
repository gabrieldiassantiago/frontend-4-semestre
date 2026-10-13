"use client"

import { Lottie } from "lottie-react";
import sucessoPerfil from "../../public/animations/sucesso.json"

export function SuccessLottie() {
  return (
    <div
      className="mx-auto h-36 w-36"
      role="img"
      aria-label="Animação de sucesso"
    >
     <Lottie
                   src={sucessoPerfil}
                   loop
                   autoplay
     
                   aria-label="Candidatura enviada com sucesso"
                   className="size-20"
                 />
    </div>
  )
}