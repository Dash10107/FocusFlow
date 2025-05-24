import { Navigation } from "@/components/navigation"
import { RoomDetail } from "@/components/room-detail"
import { getAuthenticatedUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect, notFound } from "next/navigation"

interface RoomPageProps {
  params: {
    roomId: string
  }
}

export default async function RoomPage({ params }: RoomPageProps) {
  const user = await getAuthenticatedUser()

  if (!user) {
    redirect("/login")
  }

  // Get room details
  const room = await prisma.room.findUnique({
    where: { id: params.roomId },
    include: {
      memberships: {
        where: { userId: user.id },
      },
    },
  })

  if (!room) {
    notFound()
  }

  // Check if user is a member or if room is public
  const isMember = room.memberships.length > 0
  if (!room.isPublic && !isMember) {
    redirect("/rooms")
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
        <RoomDetail
          roomId={room.id}
          roomName={room.name}
          roomDescription={room.description}
          isPublic={room.isPublic}
          userId={user.id}
        />
      </main>
    </div>
  )
}
