import * as React from "react"
import { cn } from "@/lib/utils"
import { EnhancedButton } from "./enhanced-button"

interface FloatingActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left"
  size?: "sm" | "md" | "lg"
  variant?: "default" | "gradient" | "oracle"
}

const FloatingActionButton = React.forwardRef<HTMLButtonElement, FloatingActionButtonProps>(
  ({ className, position = "bottom-right", size = "md", variant = "gradient", children, ...props }, ref) => {
    const positions = {
      "bottom-right": "bottom-4 right-4 md:bottom-6 md:right-6",
      "bottom-left": "bottom-4 left-4 md:bottom-6 md:left-6",
      "top-right": "top-4 right-4 md:top-6 md:right-6",
      "top-left": "top-4 left-4 md:top-6 md:left-6",
    }

    const sizes = {
      sm: "h-12 w-12",
      md: "h-14 w-14",
      lg: "h-16 w-16",
    }

    return (
      <EnhancedButton
        ref={ref}
        variant={variant}
        className={cn(
          "fixed z-50 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300",
          "transform hover:scale-110 active:scale-95",
          positions[position],
          sizes[size],
          className,
        )}
        {...props}
      >
        {children}
      </EnhancedButton>
    )
  },
)
FloatingActionButton.displayName = "FloatingActionButton"

export { FloatingActionButton }
