"use client"

import { PomodoroTimer } from "@/components/pomodoro-timer"
import { DashboardStats } from "@/components/dashboard-stats"
import { Leaderboard } from "@/components/leaderboard"
import { SessionHistory } from "@/components/session-history"
import { DeepWorkTrigger } from "@/components/deep-work-trigger"
import { ErrorBoundary } from "@/components/error-boundary"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageCircle, SnowflakeIcon as Crystal } from "lucide-react"

interface User {
  id: string
  name?: string
  avatar?: string
}

interface DashboardContentProps {
  user: User
}

export function DashboardContent({ user }: DashboardContentProps) {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome back, {user.name || "Focuser"}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Ready to boost your productivity? Choose your path to focused excellence.
        </p>
      </div>

      {/* Mystical Features Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Deep Work Realm */}
        <ErrorBoundary>
          <DeepWorkTrigger userId={user.id} variant="card" />
        </ErrorBoundary>

        {/* Focus Oracle */}
        <ErrorBoundary>
          <FocusOracleWidget userId={user.id} />
        </ErrorBoundary>

        {/* Focus Assistant */}
        <ErrorBoundary>
          <FocusChatbotWidget />
        </ErrorBoundary>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Timer Section */}
        <div className="lg:col-span-2 space-y-8">
          <ErrorBoundary>
            <div className="flex justify-center">
              <PomodoroTimer userId={user.id} />
            </div>
          </ErrorBoundary>

          {/* Stats Section */}
          <ErrorBoundary>
            <DashboardStats userId={user.id} />
          </ErrorBoundary>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <ErrorBoundary>
            <Leaderboard userId={user.id} />
          </ErrorBoundary>

          <ErrorBoundary>
            <SessionHistory userId={user.id} limit={10} />
          </ErrorBoundary>
        </div>
      </div>
    </div>
  )
}

// Widget Components for Dashboard
function FocusOracleWidget({ userId }: { userId: string }) {
  const handleOracleClick = () => {
    window.location.href = "/oracle"
  }

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-purple-200 dark:border-purple-800 hover:shadow-lg transition-all duration-300 cursor-pointer group">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-purple-800 dark:text-purple-200 group-hover:scale-105 transition-transform">
          <Crystal className="h-6 w-6 animate-pulse" />🔮 Focus Oracle
        </CardTitle>
        <p className="text-purple-600 dark:text-purple-300 text-sm">Seek mystical wisdom for your focus journey</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center space-y-2">
          <div className="text-4xl group-hover:animate-bounce">🔮</div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Daily guidance from the mystical realm of productivity
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-xs text-purple-600 dark:text-purple-400">
          <div>
            <div className="font-semibold">Daily</div>
            <div>Wisdom</div>
          </div>
          <div>
            <div className="font-semibold">AI</div>
            <div>Powered</div>
          </div>
          <div>
            <div className="font-semibold">Personal</div>
            <div>Guidance</div>
          </div>
        </div>

        <Button
          onClick={handleOracleClick}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300 group-hover:scale-105"
        >
          <Crystal className="h-4 w-4 mr-2" />
          Consult Oracle
        </Button>
      </CardContent>
    </Card>
  )
}

function FocusChatbotWidget() {
  return (
    <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 border-indigo-200 dark:border-indigo-800 hover:shadow-lg transition-all duration-300 cursor-pointer group">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-indigo-800 dark:text-indigo-200 group-hover:scale-105 transition-transform">
          <MessageCircle className="h-6 w-6" />🤖 Focus Assistant
        </CardTitle>
        <p className="text-indigo-600 dark:text-indigo-300 text-sm">Chat with your AI productivity companion</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center space-y-2">
          <div className="text-4xl group-hover:animate-bounce">🤖</div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Get instant help, motivation, and productivity tips
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-xs text-indigo-600 dark:text-indigo-400">
          <div>
            <div className="font-semibold">24/7</div>
            <div>Available</div>
          </div>
          <div>
            <div className="font-semibold">Smart</div>
            <div>Responses</div>
          </div>
          <div>
            <div className="font-semibold">Focus</div>
            <div>Expert</div>
          </div>
        </div>

        <Button className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300 group-hover:scale-105">
          <MessageCircle className="h-4 w-4 mr-2" />
          Start Chat (Ctrl+C)
        </Button>
      </CardContent>
    </Card>
  )
}