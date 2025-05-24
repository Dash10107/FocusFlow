import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    errorFormat: "pretty",
  })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

// Prisma middleware for enhanced logging and validation
prisma.$use(async (params, next) => {
  const before = Date.now()

  try {
    const result = await next(params)
    const after = Date.now()

    // Log slow queries in development
    if (process.env.NODE_ENV === "development" && after - before > 1000) {
      console.log(`Slow Query: ${params.model}.${params.action} took ${after - before}ms`)
    }

    return result
  } catch (error) {
    console.error(`Database Error: ${params.model}.${params.action}`, error)
    throw error
  }
})

// Enhanced database utilities
export class DatabaseService {
  static async createUserIfNotExists(kindeUser: any) {
    try {
      return await prisma.user.upsert({
        where: { kindeId: kindeUser.id },
        update: {
          email: kindeUser.email || "",
          name: `${kindeUser.given_name || ""} ${kindeUser.family_name || ""}`.trim() || null,
          avatar: kindeUser.picture || null,
        },
        create: {
          kindeId: kindeUser.id,
          email: kindeUser.email || "",
          name: `${kindeUser.given_name || ""} ${kindeUser.family_name || ""}`.trim() || null,
          avatar: kindeUser.picture || null,
        },
      })
    } catch (error) {
      console.error("Error creating/updating user:", error)
      throw new Error("Failed to create user")
    }
  }

  static async createSession(data: {
    userId: string
    roomId?: string
    type: "FOCUS" | "SHORT_BREAK" | "LONG_BREAK"
    duration: number
  }) {
    try {
      // Validate input
      if (!data.userId || !data.type || !data.duration) {
        throw new Error("Missing required session data")
      }

      if (data.duration < 1 || data.duration > 120) {
        throw new Error("Invalid session duration")
      }

      return await prisma.session.create({
        data: {
          userId: data.userId,
          roomId: data.roomId || null,
          type: data.type,
          duration: data.duration,
          status: "ACTIVE",
        },
      })
    } catch (error) {
      console.error("Error creating session:", error)
      throw new Error("Failed to create session")
    }
  }

  static async completeSession(sessionId: string, summary?: string) {
    try {
      return await prisma.session.update({
        where: { id: sessionId },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
          summary: summary || null,
        },
      })
    } catch (error) {
      console.error("Error completing session:", error)
      throw new Error("Failed to complete session")
    }
  }

  static async updateDailyStats(
    userId: string,
    sessionData: {
      type: string
      duration: number
      points: number
    },
  ) {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (sessionData.type === "FOCUS") {
        await prisma.dailyStats.upsert({
          where: {
            userId_date: {
              userId,
              date: today,
            },
          },
          update: {
            focusMinutes: { increment: sessionData.duration },
            sessionsCount: { increment: 1 },
            totalPoints: { increment: sessionData.points },
          },
          create: {
            userId,
            date: today,
            focusMinutes: sessionData.duration,
            sessionsCount: 1,
            totalPoints: sessionData.points,
            streakDays: 1,
          },
        })
      }
    } catch (error) {
      console.error("Error updating daily stats:", error)
      throw new Error("Failed to update daily stats")
    }
  }

  static async getUserStats(userId: string, days = 7) {
    try {
      const endDate = new Date()
      endDate.setHours(23, 59, 59, 999)

      const startDate = new Date(endDate)
      startDate.setDate(startDate.getDate() - days + 1)
      startDate.setHours(0, 0, 0, 0)

      return await prisma.dailyStats.findMany({
        where: {
          userId,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: { date: "asc" },
      })
    } catch (error) {
      console.error("Error getting user stats:", error)
      return []
    }
  }

  static async getSessionHistory(userId: string, limit = 20) {
    try {
      return await prisma.session.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: limit,
        include: {
          room: {
            select: { name: true },
          },
        },
      })
    } catch (error) {
      console.error("Error getting session history:", error)
      return []
    }
  }

  static async healthCheck(): Promise<boolean> {
    try {
      await prisma.$queryRaw`SELECT 1`
      return true
    } catch (error) {
      console.error("Database health check failed:", error)
      return false
    }
  }
}
