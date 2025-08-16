import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-app-primary text-white shadow-app hover:bg-app-primary-dark active:scale-[0.98]",
        destructive:
          "bg-destructive text-destructive-foreground shadow-app hover:bg-destructive/90 active:scale-[0.98]",
        outline:
          "border border-app-border bg-background text-app-text-primary hover:bg-app-surface hover:border-app-primary active:scale-[0.98]",
        secondary:
          "bg-app-accent text-app-primary shadow-app hover:bg-app-accent/90 active:scale-[0.98]",
        ghost: "text-app-text-primary hover:bg-app-hover active:bg-app-active",
        link: "text-app-primary underline-offset-4 hover:underline hover:text-app-primary-dark",
        surface: "bg-app-surface text-app-text-primary border border-app-border hover:bg-app-hover active:scale-[0.98]",
      },
      size: {
        default: "h-10 px-4 py-2 rounded-lg text-sm",
        sm: "h-8 px-3 py-1.5 rounded-md text-xs",
        lg: "h-12 px-6 py-3 rounded-xl text-base",
        icon: "h-10 w-10 rounded-lg",
        "icon-sm": "h-8 w-8 rounded-md",
        "icon-lg": "h-12 w-12 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
