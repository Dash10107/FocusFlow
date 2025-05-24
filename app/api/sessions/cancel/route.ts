import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { RedisService } from "@/lib/redis"

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { sessionId } = await request.json()

    // Check distraction rate limit with enhanced feedback
    const limitCheck = await RedisService.checkDistractionLimit(user.id)
    if (!limitCheck.allowed) {
      return NextResponse.json(
        {
          error: "RATE_LIMITED",
          message: `You've reached the maximum number of cancellations for this hour. ${limitCheck.remaining} attempts remaining.`,
          remaining: limitCheck.remaining,
        },
        { status: 429 },
      )
    }

    // Update session as cancelled
    await prisma.session.update({
      where: { id: sessionId, userId: user.id },
      data: { status: "CANCELLED" },
    })

    // Clean up Redis timer
    await RedisService.deleteSessionTimer(sessionId)

    // Update user status
    await RedisService.setUserStatus(user.id, "idle")

    // Log distraction event
    await prisma.distractionEvent.create({
      data: {
        userId: user.id,
        sessionId,
      },
    })

    return NextResponse.json({
      success: true,
      remaining: limitCheck.remaining - 1,
    })
  } catch (error) {
    console.error("Error canceling session:", error)
    return NextResponse.json({ error: "Failed to cancel session" }, { status: 500 })
  }
}
