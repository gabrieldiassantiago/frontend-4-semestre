import { cn } from "@/lib/utils"

/*
  As empresas escrevem a descrição em um markdown simplificado (o template de
  publicação usa "### título", "- item" e "**negrito**"). Em vez de despejar o
  texto cru na tela, este renderizador converte os blocos em tipografia real.
  É um subconjunto proposital de markdown — sem dependência externa.
*/

type Block =
  | { kind: "heading"; text: string }
  | { kind: "ul"; items: string[] }
  | { kind: "ol"; items: string[] }
  | { kind: "p"; text: string }

function parseBlocks(source: string): Block[] {
  const blocks: Block[] = []
  const lines = source.replace(/\r\n/g, "\n").split("\n")

  let paragraph: string[] = []
  let listKind: "ul" | "ol" | null = null
  let listItems: string[] = []

  const flushParagraph = () => {
    if (paragraph.length > 0) {
      blocks.push({ kind: "p", text: paragraph.join(" ") })
      paragraph = []
    }
  }

  const flushList = () => {
    const kind = listKind
    if (kind && listItems.length > 0) blocks.push({ kind, items: listItems })
    listKind = null
    listItems = []
  }

  for (const rawLine of lines) {
    const line = rawLine.trim()

    if (!line) {
      flushParagraph()
      flushList()
      continue
    }

    const heading = /^#{1,6}\s+(.+)$/.exec(line)
    if (heading) {
      flushParagraph()
      flushList()
      blocks.push({ kind: "heading", text: heading[1].replace(/:$/, "") })
      continue
    }

    const bullet = /^[-*\u2022]\s+(.+)$/.exec(line)
    if (bullet) {
      flushParagraph()
      if (listKind !== "ul") {
        flushList()
        listKind = "ul"
      }
      listItems.push(bullet[1])
      continue
    }

    const ordered = /^\d+[.)]\s+(.+)$/.exec(line)
    if (ordered) {
      flushParagraph()
      if (listKind !== "ol") {
        flushList()
        listKind = "ol"
      }
      listItems.push(ordered[1])
      continue
    }

    flushList()
    paragraph.push(line)
  }

  flushParagraph()
  flushList()

  return blocks
}

/** Aplica **negrito** dentro de uma linha de texto. */
function Inline({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean)

  return (
    <>
      {parts.map((part, index) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={index} className="font-bold text-foreground">
            {part.slice(2, -2)}
          </strong>
        ) : (
          part
        ),
      )}
    </>
  )
}

export function VagaDescription({
  description,
  className,
}: {
  description: string
  className?: string
}) {
  const blocks = parseBlocks(description)

  if (blocks.length === 0) {
    return (
      <p className={cn("text-sm leading-relaxed text-muted-foreground", className)}>
        Esta vaga ainda não tem uma descrição detalhada.
      </p>
    )
  }

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {blocks.map((block, index) => {
        if (block.kind === "heading") {
          return (
            <h3
              key={index}
              className={cn(
                "text-sm font-bold uppercase tracking-[0.1em] text-primary-subtle-foreground",
                index > 0 && "mt-2",
              )}
            >
              {block.text}
            </h3>
          )
        }

        if (block.kind === "ul") {
          return (
            <ul key={index} className="flex list-none flex-col gap-2.5">
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex} className="flex gap-3 text-sm leading-relaxed text-strong-foreground">
                  <span
                    className="mt-[7px] size-1.5 shrink-0 rounded-full bg-primary"
                    aria-hidden
                  />
                  <span className="text-pretty">
                    <Inline text={item} />
                  </span>
                </li>
              ))}
            </ul>
          )
        }

        if (block.kind === "ol") {
          return (
            <ol key={index} className="flex list-none flex-col gap-2.5">
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex} className="flex gap-3 text-sm leading-relaxed text-strong-foreground">
                  <span className="grid size-5 shrink-0 place-items-center rounded-md bg-primary-subtle text-[11px] font-bold text-primary-subtle-foreground">
                    {itemIndex + 1}
                  </span>
                  <span className="text-pretty">
                    <Inline text={item} />
                  </span>
                </li>
              ))}
            </ol>
          )
        }

        return (
          <p key={index} className="text-sm leading-relaxed text-strong-foreground text-pretty">
            <Inline text={block.text} />
          </p>
        )
      })}
    </div>
  )
}
