import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { DatabaseService } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "20")

    const sessions = await DatabaseService.getSessionHistory(user.id, limit)

    return NextResponse.json({ sessions })
  } catch (error) {
    console.error("Error fetching session history:", error)
    return NextResponse.json({ error: "Failed to fetch session history" }, { status: 500 })
  }
}
