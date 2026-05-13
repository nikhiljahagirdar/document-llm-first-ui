import * as React from "react"

import { cn } from "@/lib/utils"

const CardComponent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-md border bg-card text-card-foreground shadow",
      className
    )}
    {...props}
  />
))
CardComponent.displayName = "Card"

const CardHeaderComponent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeaderComponent.displayName = "CardHeader"

const CardTitleComponent = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("font-semibold leading-none tracking-tight", className)}
    {...props}
  />
))
CardTitleComponent.displayName = "CardTitle"

const CardDescriptionComponent = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescriptionComponent.displayName = "CardDescription"

const CardContentComponent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContentComponent.displayName = "CardContent"

const CardFooterComponent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooterComponent.displayName = "CardFooter"

export const Card = React.memo(CardComponent)
export const CardHeader = React.memo(CardHeaderComponent)
export const CardTitle = React.memo(CardTitleComponent)
export const CardDescription = React.memo(CardDescriptionComponent)
export const CardContent = React.memo(CardContentComponent)
export const CardFooter = React.memo(CardFooterComponent)
