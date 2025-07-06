"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      // Tamaño mayor, borde más visible, sombra y transición
      "peer h-5 w-5 shrink-0 rounded-md border-2 border-gray-300 bg-white dark:bg-gray-900 shadow-sm transition-all duration-200",
      // Estado checked
      "data-[state=checked]:bg-primary-600 data-[state=checked]:border-primary-600 data-[state=checked]:text-white",
      // Estado hover
      "hover:border-primary-400 hover:shadow-md",
      // Estado focus
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2",
      // Estado disabled
      "disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    tabIndex={0}
    aria-checked={
      props.checked === "indeterminate"
        ? "mixed"
        : typeof props.checked === "boolean"
          ? props.checked
          : props.checked === "mixed"
            ? "mixed"
            : undefined
    }
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn(
        "flex items-center justify-center text-white transition-all duration-200",
        "scale-90 data-[state=checked]:scale-100"
      )}
    >
      <Check className="h-4 w-4" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
