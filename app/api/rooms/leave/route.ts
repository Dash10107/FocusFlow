import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { RedisService } from "@/lib/redis"

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { roomId } = await request.json()

    // Leave room presence in Redis
    await RedisService.leaveRoom(roomId, user.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error leaving room:", error)
    return NextResponse.json({ error: "Failed to leave room" }, { status: 500 })
  }
}
