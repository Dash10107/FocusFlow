import { Navigation } from "@/components/navigation"
import { RoomCreate } from "@/components/room-create"
import { FocusChatbot } from "@/components/focus-chatbot"
import { getAuthenticatedUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ErrorBoundary } from "@/components/error-boundary"

export default async function CreateRoomPage() {
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
        <ErrorBoundary>
          <RoomCreate />
        </ErrorBoundary>

        {/* Focus Assistant for room creation help */}
        <ErrorBoundary>
          <FocusChatbot userId={user.id} mode="floating" />
        </ErrorBoundary>
      </main>
    </div>
  )
}
