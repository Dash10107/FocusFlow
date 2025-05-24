import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { RedisService } from "@/lib/redis"

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

    // Update session status
    await prisma.session.update({
      where: { id: sessionId },
      data: { status: "ACTIVE" },
    })

    // Update user status
    await RedisService.setUserStatus(user.id, session.type === "FOCUS" ? "focus" : "break")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error resuming session:", error)
    return NextResponse.json({ error: "Failed to resume session" }, { status: 500 })
  }
}
