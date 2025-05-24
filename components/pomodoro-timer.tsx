"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, Square, Coffee, Brain, AlertTriangle } from "lucide-react"
import { useAppStore } from "@/lib/store"
import { SessionSummary } from "@/components/session-summary"
import { useToast } from "@/hooks/use-toast"
import { ErrorBoundary } from "@/components/error-boundary"
import { LoadingSpinner } from "@/components/loading-spinner"

interface PomodoroTimerProps {
  userId: string
  roomId?: string
}

function PomodoroTimerContent({ userId, roomId }: PomodoroTimerProps) {
  const { session, setSession, startSession, pauseSession, resumeSession, completeSession, cancelSession } =
    useAppStore()
  const [isClient, setIsClient] = useState(false)
  const [sessionSummary, setSessionSummary] = useState<any>(null)
  const [showSummary, setShowSummary] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [cancelRemaining, setCancelRemaining] = useState<number | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Timer countdown effect with enhanced state management
  useEffect(() => {
    if (!isClient || session.status !== "ACTIVE") return

    const interval = setInterval(() => {
      setSession((prev) => {
        if (prev.timeRemaining <= 1) {
          // Timer completed
          handleSessionComplete()
          return { ...prev, timeRemaining: 0, status: "COMPLETED" }
        }
        return { ...prev, timeRemaining: prev.timeRemaining - 1 }
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [session.status, isClient, setSession])

  // Browser notification permission
  useEffect(() => {
    if (isClient && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission()
    }
  }, [isClient])

  const showNotification = (title: string, body: string) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, {
        body,
        icon: "/favicon.ico",
        badge: "/favicon.ico",
      })
    }
  }

  const handleSessionComplete = useCallback(async () => {
    if (!session.id) return

    try {
      const response = await fetch("/api/sessions/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: session.id }),
      })

      if (response.ok) {
        const data = await response.json()
        completeSession()

        // Show notification
        showNotification(
          "Session Complete! 🎉",
          `Great job! You completed a ${session.duration}-minute ${session.type.toLowerCase().replace("_", " ")}.`,
        )

        // Show session summary if it was a focus session
        if (session.type === "FOCUS" && data.fullSummary) {
          setSessionSummary(data.fullSummary)
          setShowSummary(true)
        }

        // Show success toast
        toast({
          title: "Session Complete!",
          description: `You completed a ${session.duration}-minute ${session.type.toLowerCase().replace("_", " ")}.`,
          variant: "success",
        })
      }
    } catch (error) {
      console.error("Error completing session:", error)
      toast({
        title: "Error",
        description: "Failed to complete session. Please try again.",
        variant: "destructive",
      })
    }
  }, [session.id, session.type, session.duration, completeSession, toast])

  const handleStartSession = async (type: "FOCUS" | "SHORT_BREAK" | "LONG_BREAK") => {
    const durations = {
      FOCUS: 25,
      SHORT_BREAK: 5,
      LONG_BREAK: 15,
    }

    const duration = durations[type]
    setIsLoading(true)

    try {
      const response = await fetch("/api/sessions/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, duration, roomId }),
      })

      if (response.ok) {
        const { sessionId } = await response.json()
        startSession(type, duration)
        setSession({ id: sessionId })
        setShowSummary(false)

        toast({
          title: "Session Started!",
          description: `${duration}-minute ${type.toLowerCase().replace("_", " ")} session has begun.`,
          variant: "success",
        })

        // Show notification
        showNotification(
          "Session Started! 🎯",
          `Your ${duration}-minute ${type.toLowerCase().replace("_", " ")} session has begun.`,
        )
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.error || "Failed to start session",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error starting session:", error)
      toast({
        title: "Error",
        description: "Failed to start session. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePauseSession = async () => {
    if (!session.id) return
    setIsLoading(true)

    try {
      await fetch("/api/sessions/pause", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: session.id }),
      })
      pauseSession()

      toast({
        title: "Session Paused",
        description: "Your session has been paused. Resume when ready!",
      })
    } catch (error) {
      console.error("Error pausing session:", error)
      toast({
        title: "Error",
        description: "Failed to pause session",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResumeSession = async () => {
    if (!session.id) return
    setIsLoading(true)

    try {
      await fetch("/api/sessions/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: session.id }),
      })
      resumeSession()

      toast({
        title: "Session Resumed",
        description: "Welcome back! Your session has resumed.",
        variant: "success",
      })
    } catch (error) {
      console.error("Error resuming session:", error)
      toast({
        title: "Error",
        description: "Failed to resume session",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelSession = async () => {
    if (!session.id) return
    setIsLoading(true)

    try {
      const response = await fetch("/api/sessions/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: session.id }),
      })

      if (response.ok) {
        const data = await response.json()
        cancelSession()
        setCancelRemaining(data.remaining)

        toast({
          title: "Session Cancelled",
          description: `Session cancelled. ${data.remaining} cancellations remaining this hour.`,
          variant: "warning",
        })
      } else {
        const { error, message, remaining } = await response.json()
        if (error === "RATE_LIMITED") {
          setCancelRemaining(remaining)
          toast({
            title: "Cancellation Limit Reached",
            description: message || "You've reached the maximum cancellations for this hour.",
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      console.error("Error canceling session:", error)
      toast({
        title: "Error",
        description: "Failed to cancel session",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!isClient) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        </CardContent>
      </Card>
    )
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const progress =
    session.duration > 0 ? ((session.duration * 60 - session.timeRemaining) / (session.duration * 60)) * 100 : 0

  const getSessionColor = () => {
    switch (session.type) {
      case "FOCUS":
        return "text-indigo-600 dark:text-indigo-400"
      case "SHORT_BREAK":
        return "text-green-600 dark:text-green-400"
      case "LONG_BREAK":
        return "text-blue-600 dark:text-blue-400"
      default:
        return "text-gray-600 dark:text-gray-400"
    }
  }

  const getSessionBg = () => {
    switch (session.type) {
      case "FOCUS":
        return "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800"
      case "SHORT_BREAK":
        return "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
      case "LONG_BREAK":
        return "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
      default:
        return "bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-700"
    }
  }

  return (
    <div className="space-y-4">
      {/* Session Summary Modal */}
      {showSummary && sessionSummary && (
        <SessionSummary sessionId={session.id || ""} summary={sessionSummary} onClose={() => setShowSummary(false)} />
      )}

      {/* Rate Limit Warning */}
      {cancelRemaining !== null && cancelRemaining <= 2 && (
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-800">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-orange-900 dark:text-orange-100 mb-1">Cancellation Warning</h4>
                <p className="text-sm text-orange-700 dark:text-orange-200">
                  You have {cancelRemaining} cancellation{cancelRemaining !== 1 ? "s" : ""} remaining this hour. Try to
                  complete your sessions for better focus habits!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Timer */}
      <Card className={`w-full max-w-md mx-auto transition-all duration-300 ${getSessionBg()}`}>
        <CardHeader className="text-center pb-4">
          <CardTitle className="flex items-center justify-center gap-2">
            {session.type === "FOCUS" ? (
              <Brain className={`h-5 w-5 ${getSessionColor()}`} />
            ) : (
              <Coffee className={`h-5 w-5 ${getSessionColor()}`} />
            )}
            <span className={getSessionColor()}>
              {session.type === "FOCUS"
                ? "Focus Session"
                : session.type === "SHORT_BREAK"
                  ? "Short Break"
                  : "Long Break"}
            </span>
          </CardTitle>
          {session.status === "ACTIVE" && (
            <Badge
              variant="secondary"
              className="w-fit mx-auto bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200"
            >
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
              Active
            </Badge>
          )}
          {session.status === "PAUSED" && (
            <Badge
              variant="secondary"
              className="w-fit mx-auto bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200"
            >
              Paused
            </Badge>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Timer Display */}
          <div className="text-center">
            <div className={`text-6xl font-mono font-bold mb-4 ${getSessionColor()}`}>
              {formatTime(session.timeRemaining)}
            </div>
            <Progress value={progress} className="h-3" />
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              {session.duration > 0 && `${session.duration} minute ${session.type.toLowerCase().replace("_", " ")}`}
            </p>
          </div>

          {/* Session Controls */}
          {session.status === "COMPLETED" || session.status === "CANCELLED" ? (
            <div className="grid grid-cols-1 gap-3">
              <Button
                onClick={() => handleStartSession("FOCUS")}
                className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                disabled={isLoading}
              >
                {isLoading ? <LoadingSpinner size="sm" className="mr-2" /> : <Brain className="h-4 w-4 mr-2" />}
                Focus Session (25m)
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={() => handleStartSession("SHORT_BREAK")} variant="outline" disabled={isLoading}>
                  <Coffee className="h-4 w-4 mr-2" />
                  Short Break (5m)
                </Button>
                <Button onClick={() => handleStartSession("LONG_BREAK")} variant="outline" disabled={isLoading}>
                  <Coffee className="h-4 w-4 mr-2" />
                  Long Break (15m)
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              {session.status === "ACTIVE" ? (
                <Button onClick={handlePauseSession} variant="outline" className="flex-1" disabled={isLoading}>
                  {isLoading ? <LoadingSpinner size="sm" className="mr-2" /> : <Pause className="h-4 w-4 mr-2" />}
                  Pause
                </Button>
              ) : (
                <Button onClick={handleResumeSession} className="flex-1" disabled={isLoading}>
                  {isLoading ? <LoadingSpinner size="sm" className="mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                  Resume
                </Button>
              )}
              <Button
                onClick={handleCancelSession}
                variant="destructive"
                disabled={isLoading || (cancelRemaining !== null && cancelRemaining <= 0)}
              >
                {isLoading ? <LoadingSpinner size="sm" className="mr-2" /> : <Square className="h-4 w-4 mr-2" />}
                Cancel
              </Button>
            </div>
          )}

          {/* Session Info */}
          {session.status !== "COMPLETED" && session.status !== "CANCELLED" && (
            <div className="text-center text-sm text-gray-600 dark:text-gray-400 bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
              {session.status === "ACTIVE" ? "Stay focused! You're doing great." : "Session paused. Resume when ready."}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export function PomodoroTimer(props: PomodoroTimerProps) {
  return (
    <ErrorBoundary>
      <PomodoroTimerContent {...props} />
    </ErrorBoundary>
  )
}
