import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { RedisService } from "@/lib/redis"

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { sessionId } = await request.json()

    // Update session status
    await prisma.session.update({
      where: { id: sessionId, userId: user.id },
      data: { status: "PAUSED" },
    })

    // Update user status
    await RedisService.setUserStatus(user.id, "idle")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error pausing session:", error)
    return NextResponse.json({ error: "Failed to pause session" }, { status: 500 })
  }
}
