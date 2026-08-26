"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"

export default function AuthPage() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background px-6 py-12">

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-col items-center text-center"
      >
        <Image
          src="/images/logo_selecta.svg"
          alt="Logo Selecta"
          width={180}
          height={80}
          priority
          className="mb-8"
        />

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground text-center">
          Como você deseja acessar?
        </h1>
        <p className="mt-3 max-w-md text-center text-sm sm:text-base leading-relaxed text-muted-foreground">
          Escolha seu perfil para acessar o ambiente correto. Uma plataforma humana, transparente e acolhedora.
        </p>
      </motion.div>

      {/* Cards de Seleção com Stagger e Hover Animations */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
        className="mt-10 sm:mt-12 grid w-full max-w-2xl grid-cols-1 gap-5 sm:grid-cols-2"
      >
        {/* Sou candidato */}
        <motion.div whileHover={{ y: -5 }} whileTap={{ scale: 0.98 }}>
          <Link
            href="/auth/candidato"
            className="group flex h-full flex-col rounded-2xl border-2 border-dashed border-primary/40 bg-background p-6 sm:p-8 transition-all duration-300 hover:border-primary hover:shadow-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <Image
              src="/images/sou_candidato.svg"
              alt="Ícone candidato"
              width={72}
              height={72}
              className="mb-5 rounded-xl transition-transform duration-300 group-hover:scale-105"
            />
            <h2 className="text-lg sm:text-xl font-bold text-foreground group-hover:text-primary-subtle-foreground transition-colors">
              Sou candidato
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Quero criar meu perfil, acompanhar processos seletivos e encontrar oportunidades de estágio.
            </p>
          </Link>
        </motion.div>

        {/* Sou empresa */}
        <motion.div whileHover={{ y: -5 }} whileTap={{ scale: 0.98 }}>
          <Link
            href="/auth/recrutador"
            className="group flex h-full flex-col rounded-2xl border-2 border-dashed border-border bg-background p-6 sm:p-8 transition-all duration-300 hover:border-primary hover:shadow-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <Image
              src="/images/sou_empresa.svg"
              alt="Ícone empresa"
              width={72}
              height={72}
              className="mb-5 rounded-xl transition-transform duration-300 group-hover:scale-105"
            />
            <h2 className="text-lg sm:text-xl font-bold text-foreground group-hover:text-primary-subtle-foreground transition-colors">
              Sou empresa
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Quero gerenciar vagas, analisar currículos e conduzir processos seletivos humanizados.
            </p>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}
