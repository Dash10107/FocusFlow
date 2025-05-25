import { Navigation } from "@/components/navigation"
import { PomodoroTimer } from "@/components/pomodoro-timer"
import { DashboardStats } from "@/components/dashboard-stats"
import { Leaderboard } from "@/components/leaderboard"
import { SessionHistory } from "@/components/session-history"
import { FocusChatbot } from "@/components/focus-chatbot"
import { DeepWorkTrigger } from "@/components/deep-work-trigger"
import { FocusOracle } from "@/components/focus-oracle"
import { DeepWorkMode } from "@/components/deep-work-mode"
import { getAuthenticatedUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ErrorBoundary } from "@/components/error-boundary"
import { DashboardContent } from "@/components/dashboard-content"

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
        <DashboardContent user={user} />
        
        {/* Global Components */}
        <ErrorBoundary>
          <FocusChatbot userId={user.id} />
        </ErrorBoundary>

        <ErrorBoundary>
          <FocusOracle userId={user.id} />
        </ErrorBoundary>

        <ErrorBoundary>
          <DeepWorkMode userId={user.id} />
        </ErrorBoundary>
      </main>
    </div>
  )
}