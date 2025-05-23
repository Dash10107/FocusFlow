import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { oracleId, resonates } = await request.json()

    // Validate input
    if (!oracleId || typeof resonates !== "boolean") {
      return NextResponse.json({ error: "Invalid feedback data" }, { status: 400 })
    }

    // Check if oracle exists and belongs to user
    const oracle = await prisma.oracleMessage.findUnique({
      where: { id: oracleId, userId: user.id },
    })

    if (!oracle) {
      return NextResponse.json({ error: "Oracle message not found" }, { status: 404 })
    }

    // Create or update feedback
    await prisma.oracleFeedback.upsert({
      where: {
        userId_oracleId: {
          userId: user.id,
          oracleId: oracleId,
        },
      },
      update: {
        resonates,
        updatedAt: new Date(),
      },
      create: {
        userId: user.id,
        oracleId: oracleId,
        resonates,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Oracle feedback API error:", error)
    return NextResponse.json({ error: "Failed to save feedback" }, { status: 500 })
  }
}
