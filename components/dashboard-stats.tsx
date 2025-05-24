"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Timer, Target, Trophy, Flame, TrendingUp, Calendar, RefreshCw } from "lucide-react"
import { LoadingSkeleton } from "@/components/loading-spinner"
import { ErrorBoundary } from "@/components/error-boundary"
import { useToast } from "@/hooks/use-toast"

interface DashboardStatsProps {
  userId: string
}

interface StatsData {
  today: {
    focusMinutes: number
    sessionsCount: number
    totalPoints: number
    rank: number | null
  }
  streak: {
    currentDays: number
    longestDays: number
  }
  weekly: Array<{
    date: string
    focusMinutes: number
    sessionsCount: number
  }>
  allTime: {
    totalFocusMinutes: number
    totalSessions: number
    totalPoints: number
  }
}

function DashboardStatsContent({ userId }: DashboardStatsProps) {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchStats()
  }, [userId])

  const fetchStats = async (showRefreshToast = false) => {
    try {
      if (showRefreshToast) setIsRefreshing(true)

      const response = await fetch("/api/stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data)

        if (showRefreshToast) {
          toast({
            title: "Stats Updated",
            description: "Your latest statistics have been loaded.",
            variant: "success",
          })
        }
      } else {
        throw new Error("Failed to fetch stats")
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
      toast({
        title: "Error",
        description: "Failed to load statistics. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  const handleRefresh = () => {
    fetchStats(true)
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="space-y-3">
                <LoadingSkeleton className="h-4 w-3/4" />
                <LoadingSkeleton className="h-8 w-1/2" />
                <LoadingSkeleton className="h-2 w-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500 mb-4">Unable to load stats. Please try again.</p>
          <Button onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  const todayGoal = 120 // 2 hours daily goal
  const todayProgress = (stats.today.focusMinutes / todayGoal) * 100

  return (
    <div className="space-y-6">
      {/* Header with Refresh */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Your Progress</h2>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Today's Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Focus</CardTitle>
            <Timer className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.today.focusMinutes}m</div>
            <div className="space-y-2 mt-2">
              <Progress value={Math.min(todayProgress, 100)} className="h-2" />
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Goal: {todayGoal}m ({Math.round(todayProgress)}%)
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessions</CardTitle>
            <Target className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.today.sessionsCount}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Completed today</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <Flame className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-1">
              {stats.streak.currentDays}
              <span className="text-orange-600">🔥</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {stats.streak.currentDays === 1 ? "day" : "days"} in a row
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Rank</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.today.rank ? `#${stats.today.rank}` : "--"}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{stats.today.totalPoints} points</p>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-indigo-600" />
            This Week's Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.weekly.length > 0 ? (
              <div className="grid grid-cols-7 gap-2">
                {stats.weekly.map((day, index) => {
                  const dayName = new Date(day.date).toLocaleDateString("en", { weekday: "short" })
                  const isToday = day.date === new Date().toISOString().split("T")[0]
                  const intensity = Math.min(day.focusMinutes / 60, 4) // Max 4 hours for full intensity

                  return (
                    <div key={day.date} className="text-center">
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">{dayName}</div>
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium mx-auto transition-all hover:scale-110 ${
                          isToday ? "ring-2 ring-indigo-500 ring-offset-1 dark:ring-offset-gray-800" : ""
                        }`}
                        style={{
                          backgroundColor: intensity > 0 ? `rgba(99, 102, 241, ${0.2 + intensity * 0.2})` : "#f3f4f6",
                          color: intensity > 2 ? "white" : "#374151",
                        }}
                      >
                        {day.focusMinutes > 0 ? Math.round((day.focusMinutes / 60) * 10) / 10 : ""}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{day.focusMinutes}m</div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                Start your first session to see your weekly progress!
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* All-Time Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-indigo-600" />
            All-Time Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
              <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                {Math.round((stats.allTime.totalFocusMinutes / 60) * 10) / 10}h
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Focus Time</p>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.allTime.totalSessions}</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Sessions Completed</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{stats.allTime.totalPoints}</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Points Earned</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function DashboardStats(props: DashboardStatsProps) {
  return (
    <ErrorBoundary>
      <DashboardStatsContent {...props} />
    </ErrorBoundary>
  )
}
