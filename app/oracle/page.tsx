import { Navigation } from "@/components/navigation"
import { FocusOracle } from "@/components/focus-oracle"
import { OracleHistory } from "@/components/oracle-history"
import { getAuthenticatedUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ErrorBoundary } from "@/components/error-boundary"

export default async function OraclePage() {
  const user = await getAuthenticatedUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 dark:from-purple-900/20 dark:via-indigo-900/20 dark:to-blue-900/20">
      <Navigation
        user={{
          name: user.name,
          avatar: user.avatar,
        }}
      />
      <main className="flex-1 p-4 md:p-8 overflow-auto">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
              🔮 Focus Oracle
            </h1>
            <p className="text-lg text-purple-600 dark:text-purple-300 max-w-2xl mx-auto">
              Seek mystical wisdom to guide your focus journey. The Oracle speaks once per day.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Oracle Consultation */}
            <div className="lg:col-span-2">
              {/* <ErrorBoundary> */}
                {/* <OracleConsultation userId={user.id} /> */}
                
              {/* </ErrorBoundary> */}
            </div>

            {/* Oracle History */}
            <div className="lg:col-span-1">
              <ErrorBoundary>
                <OracleHistory userId={user.id} />
              </ErrorBoundary>
            </div>
          </div>
        </div>

        {/* Global Oracle Modal */}
        <ErrorBoundary>
          <FocusOracle userId={user.id} />
        </ErrorBoundary>
      </main>
    </div>
  )
}

