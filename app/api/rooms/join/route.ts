import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { RedisService } from "@/lib/redis"

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { roomId } = await request.json()

    // Check if room exists and has space
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: {
        _count: {
          select: { memberships: true },
        },
      },
    })

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 })
    }

    if (room._count.memberships >= room.maxMembers) {
      return NextResponse.json({ error: "Room is full" }, { status: 400 })
    }

    // Check if already a member
    const existingMembership = await prisma.roomMembership.findUnique({
      where: {
        userId_roomId: {
          userId: user.id,
          roomId: roomId,
        },
      },
    })

    if (!existingMembership) {
      // Create membership
      await prisma.roomMembership.create({
        data: {
          userId: user.id,
          roomId: roomId,
        },
      })
    }

    // Join room presence in Redis
    await RedisService.joinRoom(roomId, user.id, {
      name: user.name,
      avatar: user.avatar,
      status: "idle",
      joinedAt: Date.now(),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error joining room:", error)
    return NextResponse.json({ error: "Failed to join room" }, { status: 500 })
  }
}
