"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components"
import { Timer, Users, Trophy, BarChart3, Settings, LogOut, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { MobileNav } from "@/components/mobile-nav"
import { useAppStore } from "@/lib/store"

interface NavigationProps {
  user: {
    name: string | null
    avatar: string | null
  }
}

export function Navigation({ user }: NavigationProps) {
  const pathname = usePathname()
  const { session } = useAppStore()

  const navItems = [
    { href: "/dashboard", icon: Timer, label: "Timer" },
    { href: "/rooms", icon: Users, label: "Rooms" },
    { href: "/leaderboard", icon: Trophy, label: "Leaderboard" },
    { href: "/stats", icon: BarChart3, label: "Stats" },
    { href: "/settings", icon: Settings, label: "Settings" },
  ]

  return (
    <>
      {/* Mobile Navigation */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b">
        <div className="flex items-center gap-2">
          <Zap className="h-6 w-6 text-indigo-600" />
          <h1 className="text-lg font-bold">FocusFlow</h1>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <MobileNav user={user} />
        </div>
      </div>

      {/* Desktop Navigation */}
      <nav className="hidden md:block bg-white dark:bg-gray-800 shadow-sm border-r border-gray-200 dark:border-gray-700 w-64 min-h-screen p-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Zap className="h-8 w-8 text-indigo-600" />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">FocusFlow</h1>
          </div>
          <ThemeToggle />
        </div>

        {/* Session Status */}
        {session.status === "ACTIVE" && (
          <div className="mb-6 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">{session.type === "FOCUS" ? "Focusing" : "On Break"}</span>
            </div>
            <div className="text-xs text-green-600 dark:text-green-400 mt-1">
              {Math.floor(session.timeRemaining / 60)}:{(session.timeRemaining % 60).toString().padStart(2, "0")}{" "}
              remaining
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <ul className="space-y-2 mb-8">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>

        {/* User Profile */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-auto">
          <div className="flex items-center gap-3 mb-3">
            {user.avatar ? (
              <img src={user.avatar || "/placeholder.svg"} alt={user.name || "User"} className="w-8 h-8 rounded-full" />
            ) : (
              <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                <span className="text-indigo-600 dark:text-indigo-300 text-sm font-medium">
                  {user.name?.charAt(0) || "U"}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.name || "User"}</p>
            </div>
          </div>

          <LogoutLink>
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </LogoutLink>
        </div>
      </nav>
    </>
  )
}
