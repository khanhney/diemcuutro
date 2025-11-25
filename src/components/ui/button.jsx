import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-[hsl(var(--color-primary))] text-[hsl(var(--color-primary-foreground))] hover:opacity-90",
        destructive:
          "bg-[hsl(var(--color-destructive))] text-[hsl(var(--color-destructive-foreground))] hover:opacity-90",
        outline:
          "border border-[hsl(var(--color-input))] bg-[hsl(var(--color-background))] hover:bg-[hsl(var(--color-accent))] hover:text-[hsl(var(--color-accent-foreground))]",
        secondary:
          "bg-[hsl(var(--color-secondary))] text-[hsl(var(--color-secondary-foreground))] hover:opacity-80",
        ghost: "hover:bg-[hsl(var(--color-accent))] hover:text-[hsl(var(--color-accent-foreground))]",
        link: "text-[hsl(var(--color-primary))] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, ...props }, ref) => {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button, buttonVariants }
