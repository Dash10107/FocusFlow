import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const user = await requireAuth()

    const history = await prisma.oracleMessage.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
      take: 7, // Last 7 days
    })

    return NextResponse.json({ history })
  } catch (error) {
    console.error("Error fetching oracle history:", error)
    return NextResponse.json({ error: "Failed to fetch oracle history" }, { status: 500 })
  }
}
