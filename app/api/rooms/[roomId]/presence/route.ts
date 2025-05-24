import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { RedisService } from "@/lib/redis"

export async function GET(request: NextRequest, { params }: { params: { roomId: string } }) {
  try {
    await requireAuth()
    const { roomId } = params

    // Get room presence from Redis
    const members = await RedisService.getRoomPresence(roomId)

    return NextResponse.json({ members })
  } catch (error) {
    console.error("Error fetching room presence:", error)
    return NextResponse.json({ error: "Failed to fetch room presence" }, { status: 500 })
  }
}
