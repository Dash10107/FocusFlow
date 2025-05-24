import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { RedisService } from "@/lib/redis"

export async function GET() {
  try {
    const user = await requireAuth()

    // Get all public rooms with member counts
    const rooms = await prisma.room.findMany({
      where: { isPublic: true },
      include: {
        memberships: {
          select: { userId: true },
        },
        _count: {
          select: { memberships: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    // Get active member counts from Redis
    const roomsWithActivity = await Promise.all(
      rooms.map(async (room) => {
        const activeMembers = await RedisService.getRoomPresence(room.id)
        return {
          id: room.id,
          name: room.name,
          description: room.description,
          isPublic: room.isPublic,
          maxMembers: room.maxMembers,
          memberCount: room._count.memberships,
          activeMembers: Object.keys(activeMembers).length,
        }
      }),
    )

    return NextResponse.json({ rooms: roomsWithActivity })
  } catch (error) {
    console.error("Error fetching rooms:", error)
    return NextResponse.json({ error: "Failed to fetch rooms" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { name, description, isPublic = true, maxMembers = 10 } = await request.json()

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: "Room name is required" }, { status: 400 })
    }

    // Create room
    const room = await prisma.room.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        isPublic,
        maxMembers: Math.min(Math.max(maxMembers, 2), 50), // Between 2-50 members
      },
    })

    // Auto-join creator to room
    await prisma.roomMembership.create({
      data: {
        userId: user.id,
        roomId: room.id,
      },
    })

    return NextResponse.json({ room })
  } catch (error) {
    console.error("Error creating room:", error)
    return NextResponse.json({ error: "Failed to create room" }, { status: 500 })
  }
}
