"use client"

import type React from "react"

import { cn } from "@/lib/utils"
import { Loader2, Brain, SnowflakeIcon as Crystal, MessageCircle } from "lucide-react"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
  variant?: "default" | "oracle" | "chat" | "focus"
}

export function LoadingSpinner({ size = "md", className, variant = "default" }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-12 w-12",
  }

  const variantClasses = {
    default: "text-gray-600 dark:text-gray-400",
    oracle: "text-purple-600 dark:text-purple-400",
    chat: "text-indigo-600 dark:text-indigo-400",
    focus: "text-green-600 dark:text-green-400",
  }

  const Icon =
    variant === "oracle" ? Crystal : variant === "chat" ? MessageCircle : variant === "focus" ? Brain : Loader2

  return <Icon className={cn("animate-spin", sizeClasses[size], variantClasses[variant], className)} />
}

interface SkeletonProps {
  className?: string
  variant?: "text" | "avatar" | "card" | "button"
}

export function Skeleton({ className, variant = "text" }: SkeletonProps) {
  const variantClasses = {
    text: "h-4 w-full",
    avatar: "h-10 w-10 rounded-full",
    card: "h-32 w-full rounded-lg",
    button: "h-10 w-24 rounded-md",
  }

  return <div className={cn("animate-pulse bg-gray-200 dark:bg-gray-700", variantClasses[variant], className)} />
}

interface LoadingCardProps {
  title?: string
  description?: string
  variant?: "default" | "oracle" | "chat"
  children?: React.ReactNode
}

export function LoadingCard({ title, description, variant = "default", children }: LoadingCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
      <div className="flex items-center justify-center mb-4">
        <LoadingSpinner size="lg" variant={variant} />
      </div>
      {title && <h3 className="text-lg font-semibold text-center text-gray-900 dark:text-gray-100 mb-2">{title}</h3>}
      {description && <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-4">{description}</p>}
      {children}
    </div>
  )
}

interface ErrorStateProps {
  title?: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  variant?: "default" | "oracle" | "chat"
}

export function ErrorState({
  title = "Something went wrong",
  description = "Please try again later",
  action,
  variant = "default",
}: ErrorStateProps) {
  const variantClasses = {
    default: "text-red-600 dark:text-red-400",
    oracle: "text-purple-600 dark:text-purple-400",
    chat: "text-indigo-600 dark:text-indigo-400",
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm text-center">
      <div className={cn("text-4xl mb-4", variantClasses[variant])}>
        {variant === "oracle" ? "🔮" : variant === "chat" ? "💬" : "⚠️"}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className={cn(
            "px-4 py-2 rounded-md text-white font-medium transition-colors",
            variantClasses[variant].replace("text-", "bg-").replace("dark:text-", "dark:bg-"),
            "hover:opacity-90",
          )}
        >
          {action.label}
        </button>
      )}
    </div>
  )
}

interface TypingIndicatorProps {
  variant?: "default" | "oracle" | "chat"
  size?: "sm" | "md" | "lg"
}

export function TypingIndicator({ variant = "default", size = "md" }: TypingIndicatorProps) {
  const sizeClasses = {
    sm: "w-1 h-1",
    md: "w-2 h-2",
    lg: "w-3 h-3",
  }

  const variantClasses = {
    default: "bg-gray-400",
    oracle: "bg-purple-500",
    chat: "bg-indigo-500",
  }

  return (
    <div className="flex items-center space-x-1">
      <div
        className={cn("rounded-full animate-bounce", sizeClasses[size], variantClasses[variant])}
        style={{ animationDelay: "0ms" }}
      />
      <div
        className={cn("rounded-full animate-bounce", sizeClasses[size], variantClasses[variant])}
        style={{ animationDelay: "150ms" }}
      />
      <div
        className={cn("rounded-full animate-bounce", sizeClasses[size], variantClasses[variant])}
        style={{ animationDelay: "300ms" }}
      />
    </div>
  )
}
