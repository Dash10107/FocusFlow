import { Redis } from "@upstash/redis"

if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
  throw new Error("Missing Upstash Redis environment variables")
}

export const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
  retry: {
    retries: 3,
    backoff: (retryCount) => Math.exp(retryCount) * 50,
  },
})

// Redis key patterns with proper namespacing
export const REDIS_KEYS = {
  // Session timers (TTL)
  sessionTimer: (sessionId: string) => `focusflow:session:timer:${sessionId}`,
  sessionState: (sessionId: string) => `focusflow:session:state:${sessionId}`,

  // User presence in rooms (Pub/Sub)
  roomPresence: (roomId: string) => `focusflow:room:presence:${roomId}`,
  roomChannel: (roomId: string) => `focusflow:room:channel:${roomId}`,

  // Daily leaderboard (Sorted Sets)
  dailyLeaderboard: (date: string) => `focusflow:leaderboard:daily:${date}`,
  weeklyLeaderboard: (week: string) => `focusflow:leaderboard:weekly:${week}`,

  // User streaks (Bitmaps)
  userStreak: (userId: string) => `focusflow:streak:${userId}`,

  // Session events (Streams)
  sessionEvents: "focusflow:session:events",

  // Rate limiting
  distractionLimit: (userId: string) => `focusflow:distraction:limit:${userId}`,
  apiRateLimit: (userId: string, endpoint: string) => `focusflow:rate:${endpoint}:${userId}`,

  // User status and cache
  userStatus: (userId: string) => `focusflow:user:status:${userId}`,
  userCache: (userId: string) => `focusflow:user:cache:${userId}`,
}

// Enhanced Redis utility functions with error handling
export class RedisService {
  private static async withRetry<T>(operation: () => Promise<T>, retries = 3): Promise<T> {
    for (let i = 0; i < retries; i++) {
      try {
        return await operation()
      } catch (error) {
        if (i === retries - 1) throw error
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, i) * 100))
      }
    }
    throw new Error("Redis operation failed after retries")
  }

  // Session Timer Management with enhanced state tracking
  static async setSessionTimer(sessionId: string, durationMinutes: number, sessionType: string) {
    const key = REDIS_KEYS.sessionTimer(sessionId)
    const stateKey = REDIS_KEYS.sessionState(sessionId)
    const ttlSeconds = durationMinutes * 60

    const sessionData = {
      sessionId,
      startTime: Date.now(),
      duration: durationMinutes,
      type: sessionType,
      status: "ACTIVE",
    }

    await this.withRetry(async () => {
      const pipeline = redis.pipeline()
      pipeline.setex(key, ttlSeconds, JSON.stringify(sessionData))
      pipeline.setex(stateKey, ttlSeconds + 300, JSON.stringify(sessionData)) // 5 min buffer
      await pipeline.exec()
    })
  }

  static async getSessionTimer(sessionId: string) {
    try {
      const key = REDIS_KEYS.sessionTimer(sessionId)
      const data = await this.withRetry(() => redis.get(key))
      return data ? JSON.parse(data as string) : null
    } catch (error) {
      console.error("Error getting session timer:", error)
      return null
    }
  }

  static async updateSessionState(sessionId: string, updates: Record<string, any>) {
    try {
      const stateKey = REDIS_KEYS.sessionState(sessionId)
      const current = await redis.get(stateKey)
      if (current) {
        const currentData = JSON.parse(current as string)
        const updatedData = { ...currentData, ...updates, updatedAt: Date.now() }
        await redis.setex(stateKey, 1800, JSON.stringify(updatedData)) // 30 min TTL
      }
    } catch (error) {
      console.error("Error updating session state:", error)
    }
  }

  static async deleteSessionTimer(sessionId: string) {
    try {
      const keys = [REDIS_KEYS.sessionTimer(sessionId), REDIS_KEYS.sessionState(sessionId)]
      await this.withRetry(() => redis.del(...keys))
    } catch (error) {
      console.error("Error deleting session timer:", error)
    }
  }

  // Enhanced Room Presence Management with Pub/Sub
  static async joinRoom(roomId: string, userId: string, userData: any) {
    try {
      const key = REDIS_KEYS.roomPresence(roomId)
      const channel = REDIS_KEYS.roomChannel(roomId)

      const userPresence = {
        ...userData,
        userId,
        joinedAt: Date.now(),
        lastSeen: Date.now(),
      }

      await this.withRetry(async () => {
        const pipeline = redis.pipeline()
        pipeline.hset(key, { [userId]: JSON.stringify(userPresence) })
        pipeline.expire(key, 3600) // 1 hour expiry
        pipeline.publish(
          channel,
          JSON.stringify({
            type: "user_joined",
            userId,
            userData: userPresence,
            timestamp: Date.now(),
          }),
        )
        await pipeline.exec()
      })
    } catch (error) {
      console.error("Error joining room:", error)
      throw new Error("Failed to join room")
    }
  }

  static async leaveRoom(roomId: string, userId: string) {
    try {
      const key = REDIS_KEYS.roomPresence(roomId)
      const channel = REDIS_KEYS.roomChannel(roomId)

      await this.withRetry(async () => {
        const pipeline = redis.pipeline()
        pipeline.hdel(key, userId)
        pipeline.publish(
          channel,
          JSON.stringify({
            type: "user_left",
            userId,
            timestamp: Date.now(),
          }),
        )
        await pipeline.exec()
      })
    } catch (error) {
      console.error("Error leaving room:", error)
    }
  }

  static async updateUserPresence(roomId: string, userId: string, status: string) {
    try {
      const key = REDIS_KEYS.roomPresence(roomId)
      const channel = REDIS_KEYS.roomChannel(roomId)
      const current = await redis.hget(key, userId)

      if (current) {
        const userData = JSON.parse(current as string)
        userData.status = status
        userData.lastSeen = Date.now()

        await this.withRetry(async () => {
          const pipeline = redis.pipeline()
          pipeline.hset(key, { [userId]: JSON.stringify(userData) })
          pipeline.publish(
            channel,
            JSON.stringify({
              type: "user_status_changed",
              userId,
              status,
              timestamp: Date.now(),
            }),
          )
          await pipeline.exec()
        })
      }
    } catch (error) {
      console.error("Error updating user presence:", error)
    }
  }

  static async getRoomPresence(roomId: string) {
    try {
      const key = REDIS_KEYS.roomPresence(roomId)
      const presence = await this.withRetry(() => redis.hgetall(key))
      const users: Record<string, any> = {}

      for (const [userId, userData] of Object.entries(presence)) {
        try {
          users[userId] = JSON.parse(userData as string)
        } catch (error) {
          console.error(`Error parsing user data for ${userId}:`, error)
        }
      }

      return users
    } catch (error) {
      console.error("Error getting room presence:", error)
      return {}
    }
  }

  // Enhanced Leaderboard Management with multiple timeframes
  static async addToLeaderboard(userId: string, points: number, date: string = new Date().toISOString().split("T")[0]) {
    try {
      const dailyKey = REDIS_KEYS.dailyLeaderboard(date)
      const weekKey = REDIS_KEYS.weeklyLeaderboard(this.getWeekKey(new Date(date)))

      await this.withRetry(async () => {
        const pipeline = redis.pipeline()
        pipeline.zincrby(dailyKey, points, userId)
        pipeline.expire(dailyKey, 7 * 24 * 60 * 60) // 7 days
        pipeline.zincrby(weekKey, points, userId)
        pipeline.expire(weekKey, 30 * 24 * 60 * 60) // 30 days
        await pipeline.exec()
      })
    } catch (error) {
      console.error("Error adding to leaderboard:", error)
    }
  }

  static async getLeaderboard(
    date: string = new Date().toISOString().split("T")[0],
    limit = 10,
    timeframe: "daily" | "weekly" = "daily",
  ) {
    try {
      const key =
        timeframe === "daily"
          ? REDIS_KEYS.dailyLeaderboard(date)
          : REDIS_KEYS.weeklyLeaderboard(this.getWeekKey(new Date(date)))

      // Upstash Redis: zrange(key, start, stop, { rev: true, withScores: true })
      return await this.withRetry(() =>
        redis.zrange(key, 0, limit - 1, {
          rev: true,
          withScores: true,
        })
      )
    } catch (error) {
      console.error("Error getting leaderboard:", error)
      return []
    }
  }

  static async getUserRank(userId: string, date: string = new Date().toISOString().split("T")[0]) {
    try {
      const key = REDIS_KEYS.dailyLeaderboard(date)
const total = await this.withRetry(() => redis.zCard(key))
const rank = await this.withRetry(() => redis.zRank(key, userId))
const reverseRank = rank !== null ? total - 1 - rank : null

    return reverseRank !== null ? reverseRank + 1 : null // Convert to 1-based rank
    } catch (error) {
      console.error("Error getting user rank:", error)
      return null
    }
  }

  // Enhanced Streak Management
  static async updateStreak(userId: string, date: Date = new Date()) {
    try {
      const key = REDIS_KEYS.userStreak(userId)
      const dayOfYear = Math.floor(
        (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24),
      )

      await this.withRetry(async () => {
        const pipeline = redis.pipeline()
        pipeline.setbit(key, dayOfYear, 1)
        pipeline.expire(key, 365 * 24 * 60 * 60) // 1 year
        await pipeline.exec()
      })
    } catch (error) {
      console.error("Error updating streak:", error)
    }
  }

  static async getStreakDays(userId: string, year: number = new Date().getFullYear()) {
    try {
      const key = REDIS_KEYS.userStreak(userId)
      const bitmap = await this.withRetry(() => redis.bitcount(key))
      return bitmap || 0
    } catch (error) {
      console.error("Error getting streak days:", error)
      return 0
    }
  }

  static async getCurrentStreak(userId: string): Promise<number> {
    try {
      const key = REDIS_KEYS.userStreak(userId)
      const today = new Date()
      let streak = 0

      // Check backwards from today
      for (let i = 0; i < 365; i++) {
        const checkDate = new Date(today)
        checkDate.setDate(checkDate.getDate() - i)
        const dayOfYear = Math.floor(
          (checkDate.getTime() - new Date(checkDate.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24),
        )

        const hasActivity = await redis.getbit(key, dayOfYear)
        if (hasActivity) {
          streak++
        } else {
          break
        }
      }

      return streak
    } catch (error) {
      console.error("Error getting current streak:", error)
      return 0
    }
  }

  // Rate Limiting with enhanced controls
  static async checkRateLimit(
    userId: string,
    endpoint: string,
    limit: number,
    windowSeconds: number,
  ): Promise<boolean> {
    try {
      const key = REDIS_KEYS.apiRateLimit(userId, endpoint)
      const current = await this.withRetry(() => redis.incr(key))

      if (current === 1) {
        await redis.expire(key, windowSeconds)
      }

      return current <= limit
    } catch (error) {
      console.error("Error checking rate limit:", error)
      return true // Allow on error
    }
  }

  static async checkDistractionLimit(userId: string): Promise<{ allowed: boolean; remaining: number }> {
    try {
      const key = REDIS_KEYS.distractionLimit(userId)
      const current = await this.withRetry(() => redis.incr(key))

      if (current === 1) {
        await redis.expire(key, 3600) // 1 hour window
      }

      const limit = 5 // Max 5 cancellations per hour
      return {
        allowed: current <= limit,
        remaining: Math.max(0, limit - current),
      }
    } catch (error) {
      console.error("Error checking distraction limit:", error)
      return { allowed: true, remaining: 5 }
    }
  }

  // User Status Management
  static async setUserStatus(userId: string, status: "focus" | "break" | "idle", roomId?: string) {
    try {
      const key = REDIS_KEYS.userStatus(userId)
      const statusData = {
        status,
        roomId: roomId || null,
        timestamp: Date.now(),
      }

      await this.withRetry(() => redis.setex(key, 300, JSON.stringify(statusData))) // 5 minute TTL

      // Update room presence if in a room
      if (roomId) {
        await this.updateUserPresence(roomId, userId, status)
      }
    } catch (error) {
      console.error("Error setting user status:", error)
    }
  }

  static async getUserStatus(userId: string) {
    try {
      const key = REDIS_KEYS.userStatus(userId)
      const data = await this.withRetry(() => redis.get(key))
      return data ? JSON.parse(data as string) : null
    } catch (error) {
      console.error("Error getting user status:", error)
      return null
    }
  }

  // Utility methods
  private static getWeekKey(date: Date): string {
    const year = date.getFullYear()
    const week = this.getWeekNumber(date)
    return `${year}-W${week.toString().padStart(2, "0")}`
  }

  private static getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
    const dayNum = d.getUTCDay() || 7
    d.setUTCDate(d.getUTCDate() + 4 - dayNum)
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
  }

  // Health check
  static async healthCheck(): Promise<boolean> {
    try {
      await redis.ping()
      return true
    } catch (error) {
      console.error("Redis health check failed:", error)
      return false
    }
  }
}
