import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const user = await requireAuth()

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const oracle = await prisma.oracleMessage.findUnique({
      where: {
        userId_date: {
          userId: user.id,
          date: today,
        },
      },
    })

    return NextResponse.json({ oracle })
  } catch (error) {
    console.error("Error fetching today's oracle:", error)
    return NextResponse.json({ error: "Failed to fetch oracle" }, { status: 500 })
  }
}
