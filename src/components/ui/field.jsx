import * as React from "react"
import { cn } from "../../lib/utils"

const FieldGroup = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("grid gap-4", className)}
    {...props}
  />
))
FieldGroup.displayName = "FieldGroup"

const Field = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("grid gap-2", className)}
    {...props}
  />
))
Field.displayName = "Field"

const FieldLabel = React.forwardRef(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
      className
    )}
    {...props}
  />
))
FieldLabel.displayName = "FieldLabel"

const FieldDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-[hsl(var(--color-muted-foreground))]", className)}
    {...props}
  />
))
FieldDescription.displayName = "FieldDescription"

const FieldSeparator = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("relative my-4", className)}
    {...props}
  >
    <div className="absolute inset-0 flex items-center">
      <span className="w-full border-t" />
    </div>
    {children && (
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-[hsl(var(--color-background))] px-2 text-[hsl(var(--color-muted-foreground))]" data-slot="field-separator-content">
          {children}
        </span>
      </div>
    )}
  </div>
))
FieldSeparator.displayName = "FieldSeparator"

export {
  FieldGroup,
  Field,
  FieldLabel,
  FieldDescription,
  FieldSeparator,
}
