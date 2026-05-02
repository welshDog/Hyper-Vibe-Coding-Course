import * as React from "react"
import { cn } from "@/lib/utils"

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-lg px-4 py-2.5 text-base font-sans",
          "bg-hfz-midnight text-hfz-text-primary placeholder:text-hfz-text-disabled",
          "border border-hfz-border-violet-strong",
          "transition-colors duration-hfz-fast ease-hfz-smooth",
          "focus:outline-none focus:border-hfz-violet-light focus:shadow-hfz-glow-violet",
          "disabled:cursor-not-allowed disabled:opacity-50",
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
