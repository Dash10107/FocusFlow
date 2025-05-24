import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { DatabaseService } from "@/lib/prisma"
import { RedisService } from "@/lib/redis"

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { type, duration, roomId } = await request.json()

    // Rate limiting check
    const canStart = await RedisService.checkRateLimit(user.id, "session_start", 10, 300) // 10 starts per 5 minutes
    if (!canStart) {
      return NextResponse.json({ error: "Too many session starts. Please wait a moment." }, { status: 429 })
    }

    // Create session in database
    const session = await DatabaseService.createSession({
      userId: user.id,
      roomId: roomId || undefined,
      type,
      duration,
    })

    // Set Redis timer with enhanced tracking
    await RedisService.setSessionTimer(session.id, duration, type)

    // Update user status
    await RedisService.setUserStatus(user.id, type === "FOCUS" ? "focus" : "break", roomId)

    return NextResponse.json({ sessionId: session.id })
  } catch (error) {
    console.error("Error starting session:", error)
    return NextResponse.json({ error: "Failed to start session" }, { status: 500 })
  }
}
