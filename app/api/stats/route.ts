import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { RedisService } from "@/lib/redis"

export async function GET() {
  try {
    const user = await requireAuth()

    // Get today's stats
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todayStats = await prisma.dailyStats.findUnique({
      where: {
        userId_date: {
          userId: user.id,
          date: today,
        },
      },
    })

    // Get current streak from Redis
    const streakDays = await RedisService.getStreakDays(user.id)

    // Get last 7 days of stats for trends
    const sevenDaysAgo = new Date(today)
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)

    const weeklyStats = await prisma.dailyStats.findMany({
      where: {
        userId: user.id,
        date: {
          gte: sevenDaysAgo,
          lte: today,
        },
      },
      orderBy: { date: "asc" },
    })

    // Get total all-time stats
    const totalStats = await prisma.dailyStats.aggregate({
      where: { userId: user.id },
      _sum: {
        focusMinutes: true,
        sessionsCount: true,
        totalPoints: true,
      },
    })

    // Get current user rank from today's leaderboard
    const todayDate = today.toISOString().split("T")[0]
    const leaderboard = await RedisService.getLeaderboard(todayDate, 100)
    const userIds = leaderboard.filter((_, index) => index % 2 === 0) as string[]
    const userRank = userIds.indexOf(user.id) + 1

    return NextResponse.json({
      today: {
        focusMinutes: todayStats?.focusMinutes || 0,
        sessionsCount: todayStats?.sessionsCount || 0,
        totalPoints: todayStats?.totalPoints || 0,
        rank: userRank || null,
      },
      streak: {
        currentDays: streakDays,
        longestDays: streakDays, // Simplified for MVP
      },
      weekly: weeklyStats.map((stat) => ({
        date: stat.date.toISOString().split("T")[0],
        focusMinutes: stat.focusMinutes,
        sessionsCount: stat.sessionsCount,
      })),
      allTime: {
        totalFocusMinutes: totalStats._sum.focusMinutes || 0,
        totalSessions: totalStats._sum.sessionsCount || 0,
        totalPoints: totalStats._sum.totalPoints || 0,
      },
    })
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
