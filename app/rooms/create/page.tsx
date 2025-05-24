import { Navigation } from "@/components/navigation"
import { RoomCreate } from "@/components/room-create"
import { getAuthenticatedUser } from "@/lib/auth"
import { redirect } from "next/navigation"

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
        <RoomCreate />
      </main>
    </div>
  )
}
