import { ImageResponse } from "next/og"
import { getVagaPublic } from "@/lib/services/vagas.public"
import { CATEGORIA_LABELS, MODALIDADE_LABELS, NIVEL_LABELS } from "@/lib/types/vaga.types"

export const size = { width: 1200, height: 630 }
export const contentType = "image/png"
export const alt = "Vaga publicada na Selecta"

/**
 * Imagem de preview usada quando o link da vaga é compartilhado
 * (WhatsApp, LinkedIn, Slack...). Estilos inline: o ImageResponse
 * não processa Tailwind.
 */
export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const vaga = await getVagaPublic(id)

  const company = vaga?.companyName ?? "Empresa confidencial"
  const titulo = vaga?.titulo ?? "Vaga não encontrada"

  const tags = vaga
    ? [
        NIVEL_LABELS[vaga.nivelExperiencia],
        MODALIDADE_LABELS[vaga.modalidade],
        CATEGORIA_LABELS[vaga.categoria],
      ]
    : []

  const salario = vaga
    ? vaga.salario.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
        maximumFractionDigits: 0,
      })
    : null

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#ffffff",
          padding: "72px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "18px",
                backgroundColor: "#f5f3ff",
                color: "#6d28d9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "28px",
                fontWeight: 700,
              }}
            >
              {company.trim().charAt(0).toUpperCase() || "S"}
            </div>
            <span style={{ fontSize: "30px", color: "#71717a", fontWeight: 600 }}>{company}</span>
          </div>

          <div
            style={{
              marginTop: "36px",
              fontSize: "68px",
              fontWeight: 700,
              color: "#09090b",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              display: "flex",
            }}
          >
            {titulo}
          </div>

          {vaga && (
            <div style={{ marginTop: "34px", display: "flex", gap: "12px" }}>
              {tags.map((tag) => (
                <div
                  key={tag}
                  style={{
                    display: "flex",
                    padding: "12px 24px",
                    borderRadius: "999px",
                    backgroundColor: "#fafafa",
                    border: "1px solid #e4e4e7",
                    color: "#3f3f46",
                    fontSize: "26px",
                    fontWeight: 600,
                  }}
                >
                  {tag}
                </div>
              ))}
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "2px solid #f4f4f5",
            paddingTop: "32px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            {salario && (
              <span style={{ fontSize: "40px", fontWeight: 700, color: "#09090b" }}>
                {salario} <span style={{ fontSize: "26px", color: "#71717a" }}>/ mês</span>
              </span>
            )}
            {vaga && (
              <span style={{ fontSize: "26px", color: "#71717a", marginTop: "6px" }}>
                {vaga.cidade}, {vaga.estado}
              </span>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "14px",
                backgroundColor: "#7c3aed",
                display: "flex",
              }}
            />
            <span style={{ fontSize: "32px", fontWeight: 700, color: "#09090b" }}>Selecta</span>
          </div>
        </div>
      </div>
    ),
    size,
  )
}
