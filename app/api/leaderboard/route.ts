import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { RedisService } from "@/lib/redis"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    await requireAuth()

    const { searchParams } = new URL(request.url)
    const date = searchParams.get("date") || new Date().toISOString().split("T")[0]
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    // Get leaderboard from Redis
    const leaderboardData = await RedisService.getLeaderboard(date, limit)

    if (!leaderboardData || leaderboardData.length === 0) {
      return NextResponse.json({ leaderboard: [] })
    }

    // Get user details for leaderboard entries
    const userIds = leaderboardData.filter((_, index) => index % 2 === 0) as string[]
    const scores = leaderboardData.filter((_, index) => index % 2 === 1) as number[]

    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, avatar: true },
    })

    const leaderboard = userIds.map((userId, index) => {
      const user = users.find((u) => u.id === userId)
      return {
        userId,
        name: user?.name || "Anonymous",
        avatar: user?.avatar,
        score: scores[index] || 0,
        rank: index + 1,
      }
    })

    return NextResponse.json({ leaderboard })
  } catch (error) {
    console.error("Error fetching leaderboard:", error)
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 })
  }
}
