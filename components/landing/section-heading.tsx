import { Fragment } from "react"
import { cn } from "@/lib/utils"

/** Cabeçalho das seções. `lines` vira uma linha por item, animadas palavra a palavra (data-split). */
export function SectionHeading({
  eyebrow,
  lines,
  align = "center",
  className,
}: {
  eyebrow: string
  lines: string[]
  align?: "center" | "left"
  className?: string
}) {
  return (
    <div className={cn(align === "center" ? "text-center" : "text-left", className)}>
      <p data-reveal className="mb-5 inline-flex items-center gap-3 text-sm font-medium uppercase tracking-[0.2em] text-strong-foreground">
        <span className="size-2.5 bg-primary" aria-hidden /> {eyebrow}
      </p>
      <h2 data-split aria-label={lines.join(" ")} className="text-balance text-[34px] font-normal leading-[1.1] tracking-[-0.03em] sm:text-5xl lg:text-[56px]">
        {lines.map((line) => (
          <span key={line} className="block" aria-hidden>
            {line.split(" ").map((word, i, words) => (
              <Fragment key={i}>
                <span className="inline-block overflow-hidden pb-1 align-bottom">
                  <span data-word className="inline-block">{word}</span>
                </span>
                {i < words.length - 1 ? " " : null}
              </Fragment>
            ))}
          </span>
        ))}
      </h2>
    </div>
  )
}
