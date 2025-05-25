import { Navigation } from "@/components/navigation"
import { DashboardStats } from "@/components/dashboard-stats"
import { FocusChatbot } from "@/components/focus-chatbot"
import { getAuthenticatedUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ErrorBoundary } from "@/components/error-boundary"

export default async function StatsPage() {
  const user = await getAuthenticatedUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="flex">
      <Navigation
        user={{
          name: user.name,
          avatar: user.avatar,
        }}
      />
      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Your Statistics</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Track your focus journey and see your productivity patterns over time.
            </p>
          </div>

          <ErrorBoundary>
            <DashboardStats userId={user.id} />
          </ErrorBoundary>

          {/* Focus Assistant for stats insights */}
          <div className="mt-8">
            <ErrorBoundary>
              <FocusChatbot userId={user.id} mode="embedded" className="max-w-4xl" />
            </ErrorBoundary>
          </div>
        </div>
      </main>
    </div>
  )
}
