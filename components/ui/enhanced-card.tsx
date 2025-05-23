import * as React from "react"
import { cn } from "@/lib/utils"

const EnhancedCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "default" | "glass" | "gradient" | "oracle" | "focus"
    hover?: boolean
    glow?: boolean
  }
>(({ className, variant = "default", hover = false, glow = false, ...props }, ref) => {
  const variants = {
    default: "bg-card text-card-foreground border shadow-sm",
    glass: "bg-white/10 dark:bg-gray-900/10 backdrop-blur-xl border-white/20 dark:border-gray-700/20 shadow-xl",
    gradient: "bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border shadow-lg",
    oracle:
      "bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 dark:from-purple-900/20 dark:via-indigo-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-700 shadow-xl",
    focus:
      "bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50 dark:from-indigo-900/20 dark:via-blue-900/20 dark:to-cyan-900/20 border-indigo-200 dark:border-indigo-700 shadow-xl",
  }

  return (
    <div
      ref={ref}
      className={cn(
        "rounded-xl border transition-all duration-300",
        variants[variant],
        hover && "hover:shadow-lg hover:-translate-y-1 cursor-pointer",
        glow && "shadow-2xl ring-1 ring-purple-500/20",
        className,
      )}
      {...props}
    />
  )
})
EnhancedCard.displayName = "EnhancedCard"

const EnhancedCardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
  ),
)
EnhancedCardHeader.displayName = "EnhancedCardHeader"

const EnhancedCardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("font-semibold leading-none tracking-tight", className)} {...props} />
  ),
)
EnhancedCardTitle.displayName = "EnhancedCardTitle"

const EnhancedCardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  ),
)
EnhancedCardDescription.displayName = "EnhancedCardDescription"

const EnhancedCardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />,
)
EnhancedCardContent.displayName = "EnhancedCardContent"

const EnhancedCardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
  ),
)
EnhancedCardFooter.displayName = "EnhancedCardFooter"

export {
  EnhancedCard,
  EnhancedCardHeader,
  EnhancedCardTitle,
  EnhancedCardDescription,
  EnhancedCardContent,
  EnhancedCardFooter,
}
