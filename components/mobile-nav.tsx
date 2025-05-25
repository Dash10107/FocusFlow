"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components"
import { Menu, Timer, Users, Trophy, BarChart3, Settings, LogOut, Zap, SnowflakeIcon as Crystal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useAppStore } from "@/lib/store"

interface MobileNavProps {
  user: {
    name: string | null
    avatar: string | null
  }
}

export function MobileNav({ user }: MobileNavProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { session } = useAppStore()

  const navItems = [
    { href: "/dashboard", icon: Timer, label: "Timer" },
    { href: "/rooms", icon: Users, label: "Rooms" },
    { href: "/leaderboard", icon: Trophy, label: "Leaderboard" },
    { href: "/stats", icon: BarChart3, label: "Stats" },
    { href: "/oracle", icon: Crystal, label: "Oracle" },
    { href: "/settings", icon: Settings, label: "Settings" },
  ]

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center gap-2 p-4 border-b">
            <Zap className="h-6 w-6 text-indigo-600" />
            <h1 className="text-lg font-bold text-gray-900">FocusFlow</h1>
          </div>

          {/* Session Status */}
          {session.status === "ACTIVE" && (
            <div className="m-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-700">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">{session.type === "FOCUS" ? "Focusing" : "On Break"}</span>
              </div>
              <div className="text-xs text-green-600 mt-1">
                {Math.floor(session.timeRemaining / 60)}:{(session.timeRemaining % 60).toString().padStart(2, "0")}{" "}
                remaining
              </div>
            </div>
          )}

          {/* Navigation Items */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                        isActive ? "bg-indigo-100 text-indigo-700" : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* User Profile */}
          <div className="border-t p-4">
            <div className="flex items-center gap-3 mb-3">
              {user.avatar ? (
                <img
                  src={user.avatar || "/placeholder.svg"}
                  alt={user.name || "User"}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-indigo-600 text-sm font-medium">{user.name?.charAt(0) || "U"}</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user.name || "User"}</p>
              </div>
            </div>

            <LogoutLink>
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </LogoutLink>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
