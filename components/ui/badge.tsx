import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-app-primary focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-app-primary text-white shadow-app hover:bg-app-primary-dark",
        secondary:
          "border-transparent bg-app-accent text-app-primary shadow-app hover:bg-app-accent/90",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow-app hover:bg-destructive/90",
        outline: "border-app-border text-app-text-primary hover:bg-app-surface",
        surface: "border-app-border bg-app-surface text-app-text-primary hover:bg-app-hover",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
