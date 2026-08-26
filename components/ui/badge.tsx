import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full font-semibold [&_svg]:size-3 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        neutral: "bg-muted text-strong-foreground",
        outline: "border border-border bg-background text-muted-foreground",
        primary: "bg-primary-subtle text-primary-subtle-foreground",
        success: "bg-success-subtle text-success-foreground",
        danger: "bg-danger-subtle text-danger-foreground",
        warning: "bg-warning-subtle text-warning-foreground",
        info: "bg-info-subtle text-info",
      },
      size: {
        sm: "px-2 py-0.5 text-[11px]",
        md: "px-2.5 py-1 text-xs",
      },
    },
    defaultVariants: { variant: "neutral", size: "md" },
  },
)

export function Badge({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant, size }), className)} {...props} />
}

export { badgeVariants }
