import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { DatabaseService } from "@/lib/prisma"
import { RedisService } from "@/lib/redis"
import { AISessionSummaryService } from "@/lib/ai-summaries"
import { prisma } from "@/lib/prisma" // Declare the prisma variable

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { sessionId } = await request.json()

    // Get session details
    const session = await prisma.session.findUnique({
      where: { id: sessionId, userId: user.id },
    })

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    // Generate AI summary
    const summaryData = await AISessionSummaryService.generateSessionSummary({
      type: session.type,
      duration: session.duration,
      userId: user.id,
      completedAt: new Date(),
      roomId: session.roomId || undefined,
    })

    // Complete session with summary
    await DatabaseService.completeSession(sessionId, summaryData.summary)

    // Clean up Redis timer
    await RedisService.deleteSessionTimer(sessionId)

    // Update user status
    await RedisService.setUserStatus(user.id, "idle")

    // Award points and update stats if it was a focus session
    if (session.type === "FOCUS") {
      const points = session.duration * 2 // 2 points per minute
      const today = new Date().toISOString().split("T")[0]

      // Add to leaderboard
      await RedisService.addToLeaderboard(user.id, points, today)

      // Update streak
      await RedisService.updateStreak(user.id)

      // Update daily stats
      await DatabaseService.updateDailyStats(user.id, {
        type: session.type,
        duration: session.duration,
        points,
      })

      // Log leaderboard entry
      await prisma.leaderboardLog.create({
        data: {
          userId: user.id,
          points,
          sessionId,
        },
      })
    }

    return NextResponse.json({
      success: true,
      summary: summaryData.summary,
      fullSummary: summaryData,
    })
  } catch (error) {
    console.error("Error completing session:", error)
    return NextResponse.json({ error: "Failed to complete session" }, { status: 500 })
  }
}
