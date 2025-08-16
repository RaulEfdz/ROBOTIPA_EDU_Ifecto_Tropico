import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-lg border border-app-border bg-background px-3 py-2.5 text-sm text-app-text-primary transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-app-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-primary focus-visible:ring-offset-2 focus-visible:border-app-primary hover:border-app-primary/50 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-app-surface",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
