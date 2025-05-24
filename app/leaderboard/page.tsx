import { Navigation } from "@/components/navigation"
import { Leaderboard } from "@/components/leaderboard"
import { getAuthenticatedUser } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function LeaderboardPage() {
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
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Leaderboard</h1>
            <p className="text-gray-600">See how you rank against other focused individuals today.</p>
          </div>
          <Leaderboard userId={user.id} />
        </div>
      </main>
    </div>
  )
}
