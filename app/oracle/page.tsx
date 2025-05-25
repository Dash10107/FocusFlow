import { Navigation } from "@/components/navigation"
import { FocusOracle } from "@/components/focus-oracle"
import { getAuthenticatedUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ErrorBoundary } from "@/components/error-boundary"

export default async function OraclePage() {
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
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">🔮 Focus Oracle</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Seek mystical wisdom to guide your focus journey. The Oracle speaks once per day.
            </p>
          </div>

          <ErrorBoundary>
            <FocusOracle userId={user.id} mode="page" className="max-w-2xl mx-auto" />
          </ErrorBoundary>
        </div>
      </main>
    </div>
  )
}
