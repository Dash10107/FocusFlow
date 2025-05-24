"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trophy, Medal, Award, Crown, RefreshCw, Users } from "lucide-react"
import { LoadingSkeleton } from "@/components/loading-spinner"
import { ErrorBoundary } from "@/components/error-boundary"
import { useToast } from "@/hooks/use-toast"

interface LeaderboardEntry {
  userId: string
  name: string
  avatar: string | null
  score: number
  rank: number
}

interface LeaderboardProps {
  userId: string
  showHeader?: boolean
}

function LeaderboardContent({ userId, showHeader = true }: LeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchLeaderboard()

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => fetchLeaderboard(false), 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchLeaderboard = async (showToast = false) => {
    try {
      if (showToast) setIsRefreshing(true)

      const response = await fetch("/api/leaderboard")
      if (response.ok) {
        const data = await response.json()
        setLeaderboard(data.leaderboard)
        setLastUpdated(new Date())

        if (showToast) {
          toast({
            title: "Leaderboard Updated",
            description: "Latest rankings have been loaded.",
            variant: "success",
          })
        }
      } else {
        throw new Error("Failed to fetch leaderboard")
      }
    } catch (error) {
      console.error("Error fetching leaderboard:", error)
      if (showToast) {
        toast({
          title: "Error",
          description: "Failed to update leaderboard. Please try again.",
          variant: "destructive",
        })
      }
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  const handleRefresh = () => {
    fetchLeaderboard(true)
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />
      default:
        return <span className="text-sm font-bold text-gray-500 dark:text-gray-400">#{rank}</span>
    }
  }

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/50 dark:text-yellow-200">
            🥇 Champion
          </Badge>
        )
      case 2:
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-900/50 dark:text-gray-200">
            🥈 Runner-up
          </Badge>
        )
      case 3:
        return (
          <Badge className="bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/50 dark:text-amber-200">
            🥉 Third Place
          </Badge>
        )
      default:
        return null
    }
  }

  const currentUser = leaderboard.find((entry) => entry.userId === userId)

  if (isLoading) {
    return (
      <Card>
        {showHeader && (
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-600" />
              Today's Leaderboard
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg">
                <LoadingSkeleton className="w-8 h-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <LoadingSkeleton className="h-4 w-3/4" />
                  <LoadingSkeleton className="h-3 w-1/2" />
                </div>
                <LoadingSkeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      {showHeader && (
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-600" />
              Today's Leaderboard
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            </Button>
          </div>
          {lastUpdated && (
            <p className="text-xs text-gray-500 dark:text-gray-400">Last updated: {lastUpdated.toLocaleTimeString()}</p>
          )}
        </CardHeader>
      )}
      <CardContent>
        {leaderboard.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No rankings yet</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Complete your first focus session to appear on the leaderboard!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Current User Highlight */}
            {currentUser && currentUser.rank > 3 && (
              <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full">
                    <span className="text-sm font-bold text-indigo-600 dark:text-indigo-300">#{currentUser.rank}</span>
                  </div>
                  <div className="flex items-center gap-3 flex-1">
                    {currentUser.avatar ? (
                      <img
                        src={currentUser.avatar || "/placeholder.svg"}
                        alt={currentUser.name}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                        <span className="text-indigo-600 dark:text-indigo-300 text-sm font-medium">
                          {currentUser.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">{currentUser.name} (You)</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{currentUser.score} points</p>
                    </div>
                  </div>
                  <Badge variant="secondary">Your Rank</Badge>
                </div>
              </div>
            )}

            {/* Top Rankings */}
            {leaderboard.slice(0, 10).map((entry) => {
              const isCurrentUser = entry.userId === userId

              return (
                <div
                  key={entry.userId}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${
                    isCurrentUser
                      ? "bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800"
                      : ""
                  }`}
                >
                  <div className="flex items-center justify-center w-8 h-8">{getRankIcon(entry.rank)}</div>

                  <div className="flex items-center gap-3 flex-1">
                    {entry.avatar ? (
                      <img
                        src={entry.avatar || "/placeholder.svg"}
                        alt={entry.name}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 dark:text-gray-300 text-sm font-medium">
                          {entry.name.charAt(0)}
                        </span>
                      </div>
                    )}

                    <div className="flex-1">
                      <p
                        className={`font-medium ${isCurrentUser ? "text-indigo-900 dark:text-indigo-100" : "text-gray-900 dark:text-white"}`}
                      >
                        {entry.name}
                        {isCurrentUser && <span className="text-indigo-600 dark:text-indigo-400 ml-1">(You)</span>}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {entry.score} points • {Math.round(entry.score / 2)} minutes
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    {getRankBadge(entry.rank)}
                    <span className="text-lg font-bold text-gray-900 dark:text-white">{entry.score}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function Leaderboard(props: LeaderboardProps) {
  return (
    <ErrorBoundary>
      <LeaderboardContent {...props} />
    </ErrorBoundary>
  )
}
