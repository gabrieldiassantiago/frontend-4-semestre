import { ImageResponse } from "next/og"
import { getVagaPublic } from "@/lib/services/vagas.public"
import { CATEGORIA_LABELS, MODALIDADE_LABELS, NIVEL_LABELS } from "@/lib/types/vaga.types"

export const size = { width: 1200, height: 630 }
export const contentType = "image/png"
export const alt = "Vaga publicada na Selecta"

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const vaga = await getVagaPublic(id)

  const company = vaga?.nomeEmpresa ?? "Empresa confidencial"
  const titulo = vaga?.titulo ?? "Oportunidade na Selecta"

  const tags = vaga
    ? [
      NIVEL_LABELS[vaga.nivelExperiencia],
      MODALIDADE_LABELS[vaga.modalidade],
      CATEGORIA_LABELS[vaga.categoria],
    ]
    : []

  const salario = vaga?.salario
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
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          {/* Header da Empresa */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "16px",
                backgroundColor: "#f5f3ff",
                color: "#7c3aed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "26px",
                fontWeight: 700,
              }}
            >
              {company.trim().charAt(0).toUpperCase() || "S"}
            </div>
            <span style={{ fontSize: "24px", color: "#71717a", fontWeight: 600 }}>
              {company}
            </span>
          </div>

          {/* Título Principal */}
          <div
            style={{
              marginTop: "40px",
              fontSize: "64px",
              fontWeight: 700,
              color: "#09090b",
              lineHeight: 1.15,
              letterSpacing: "-0.03em",
              display: "flex",
            }}
          >
            {titulo}
          </div>

          {/* Tags Pills */}
          {vaga && (
            <div style={{ marginTop: "32px", display: "flex", gap: "10px" }}>
              {tags.map((tag) => (
                <div
                  key={tag}
                  style={{
                    display: "flex",
                    padding: "8px 20px",
                    borderRadius: "999px",
                    backgroundColor: "#fafafa",
                    border: "1px solid #e4e4e7",
                    color: "#52525b",
                    fontSize: "22px",
                    fontWeight: 600,
                  }}
                >
                  {tag}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Rodapé com Remuneração e Assinatura */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid #f4f4f5",
            paddingTop: "32px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            {salario ? (
              <span style={{ fontSize: "38px", fontWeight: 700, color: "#09090b" }}>
                {salario} <span style={{ fontSize: "24px", color: "#71717a" }}>/ mês</span>
              </span>
            ) : (
              <span style={{ fontSize: "28px", fontWeight: 600, color: "#09090b" }}>
                Remuneração a combinar
              </span>
            )}
            {vaga && (
              <span style={{ fontSize: "22px", color: "#71717a", marginTop: "4px" }}>
                {vaga.cidade} - {vaga.estado}
              </span>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                backgroundColor: "#7c3aed",
                display: "flex",
              }}
            />
            <span style={{ fontSize: "28px", fontWeight: 700, color: "#09090b", letterSpacing: "-0.02em" }}>
              Selecta
            </span>
          </div>
        </div>
      </div>
    ),
    size,
  )
}