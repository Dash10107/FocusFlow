import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

interface ContainerProps {
  children: ReactNode
  className?: string
  size?: "sm" | "md" | "lg" | "xl" | "full"
}

export function Container({ children, className, size = "lg" }: ContainerProps) {
  const sizeClasses = {
    sm: "max-w-2xl",
    md: "max-w-4xl",
    lg: "max-w-6xl",
    xl: "max-w-7xl",
    full: "max-w-full",
  }

  return <div className={cn("mx-auto px-4 sm:px-6 lg:px-8", sizeClasses[size], className)}>{children}</div>
}

interface GridProps {
  children: ReactNode
  className?: string
  cols?: {
    default?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
  gap?: number
}

export function Grid({ children, className, cols = { default: 1, md: 2, lg: 3 }, gap = 6 }: GridProps) {
  const gridClasses = [
    `grid`,
    `gap-${gap}`,
    cols.default && `grid-cols-${cols.default}`,
    cols.sm && `sm:grid-cols-${cols.sm}`,
    cols.md && `md:grid-cols-${cols.md}`,
    cols.lg && `lg:grid-cols-${cols.lg}`,
    cols.xl && `xl:grid-cols-${cols.xl}`,
  ]
    .filter(Boolean)
    .join(" ")

  return <div className={cn(gridClasses, className)}>{children}</div>
}

interface FlexProps {
  children: ReactNode
  className?: string
  direction?: "row" | "col"
  align?: "start" | "center" | "end" | "stretch"
  justify?: "start" | "center" | "end" | "between" | "around" | "evenly"
  wrap?: boolean
  gap?: number
}

export function Flex({
  children,
  className,
  direction = "row",
  align = "start",
  justify = "start",
  wrap = false,
  gap = 0,
}: FlexProps) {
  const flexClasses = [
    "flex",
    direction === "col" ? "flex-col" : "flex-row",
    align === "center"
      ? "items-center"
      : align === "end"
        ? "items-end"
        : align === "stretch"
          ? "items-stretch"
          : "items-start",
    justify === "center"
      ? "justify-center"
      : justify === "end"
        ? "justify-end"
        : justify === "between"
          ? "justify-between"
          : justify === "around"
            ? "justify-around"
            : justify === "evenly"
              ? "justify-evenly"
              : "justify-start",
    wrap && "flex-wrap",
    gap > 0 && `gap-${gap}`,
  ]
    .filter(Boolean)
    .join(" ")

  return <div className={cn(flexClasses, className)}>{children}</div>
}

interface SectionProps {
  children: ReactNode
  className?: string
  padding?: "none" | "sm" | "md" | "lg" | "xl"
  background?: "default" | "muted" | "accent"
}

export function Section({ children, className, padding = "lg", background = "default" }: SectionProps) {
  const paddingClasses = {
    none: "",
    sm: "py-8",
    md: "py-12",
    lg: "py-16",
    xl: "py-24",
  }

  const backgroundClasses = {
    default: "bg-white dark:bg-gray-900",
    muted: "bg-gray-50 dark:bg-gray-800",
    accent: "bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20",
  }

  return <section className={cn(paddingClasses[padding], backgroundClasses[background], className)}>{children}</section>
}

interface StackProps {
  children: ReactNode
  className?: string
  spacing?: number
  align?: "start" | "center" | "end" | "stretch"
}

export function Stack({ children, className, spacing = 4, align = "stretch" }: StackProps) {
  const alignClasses = {
    start: "items-start",
    center: "items-center",
    end: "items-end",
    stretch: "items-stretch",
  }

  return <div className={cn("flex flex-col", `space-y-${spacing}`, alignClasses[align], className)}>{children}</div>
}

interface ResponsiveProps {
  children: ReactNode
  className?: string
  hideOn?: ("mobile" | "tablet" | "desktop")[]
  showOn?: ("mobile" | "tablet" | "desktop")[]
}

export function Responsive({ children, className, hideOn, showOn }: ResponsiveProps) {
  let responsiveClasses = ""

  if (hideOn) {
    if (hideOn.includes("mobile")) responsiveClasses += " hidden sm:block"
    if (hideOn.includes("tablet")) responsiveClasses += " sm:hidden lg:block"
    if (hideOn.includes("desktop")) responsiveClasses += " lg:hidden"
  }

  if (showOn) {
    responsiveClasses = " hidden"
    if (showOn.includes("mobile")) responsiveClasses += " block sm:hidden"
    if (showOn.includes("tablet")) responsiveClasses += " sm:block lg:hidden"
    if (showOn.includes("desktop")) responsiveClasses += " lg:block"
  }

  return <div className={cn(responsiveClasses, className)}>{children}</div>
}
