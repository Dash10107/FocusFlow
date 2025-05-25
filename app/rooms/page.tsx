import { RoomBrowser } from "@/components/room-browser"
import { Navigation } from "@/components/navigation"
import { FocusChatbot } from "@/components/focus-chatbot"
import { getAuthenticatedUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ErrorBoundary } from "@/components/error-boundary"

export default async function RoomsPage() {
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Co-working Rooms</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Join others in focused work sessions and stay motivated together.
            </p>
          </div>

          <ErrorBoundary>
            <RoomBrowser />
          </ErrorBoundary>

          {/* Focus Assistant for room guidance */}
          <ErrorBoundary>
            <FocusChatbot userId={user.id} mode="floating" />
          </ErrorBoundary>
        </div>
      </main>
    </div>
  )
}
