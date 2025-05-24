import { Navigation } from "@/components/navigation"
import { PomodoroTimer } from "@/components/pomodoro-timer"
import { DashboardStats } from "@/components/dashboard-stats"
import { Leaderboard } from "@/components/leaderboard"
import { SessionHistory } from "@/components/session-history"
import { getAuthenticatedUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ErrorBoundary } from "@/components/error-boundary"

export default async function DashboardPage() {
  const user = await getAuthenticatedUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen">
      <Navigation
        user={{
          name: user.name,
          avatar: user.avatar,
        }}
      />
      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome back, {user.name || "Focuser"}!
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Ready to boost your productivity? Start a focus session or check your progress below.
            </p>
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
      </main>
    </div>
  )
}
