"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Clock, Calendar, Users, Brain, Coffee, RefreshCw } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface SessionHistoryProps {
  userId: string
  limit?: number
}

interface SessionRecord {
  id: string
  type: "FOCUS" | "SHORT_BREAK" | "LONG_BREAK"
  duration: number
  status: string
  startedAt: string
  completedAt: string | null
  summary: string | null
  room: { name: string } | null
}

export function SessionHistory({ userId, limit = 20 }: SessionHistoryProps) {
  const [sessions, setSessions] = useState<SessionRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchSessionHistory()
  }, [userId])

  const fetchSessionHistory = async () => {
    try {
      const response = await fetch(`/api/sessions/history?limit=${limit}`)
      if (response.ok) {
        const data = await response.json()
        setSessions(data.sessions)
      }
    } catch (error) {
      console.error("Error fetching session history:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getSessionIcon = (type: string) => {
    switch (type) {
      case "FOCUS":
        return <Brain className="h-4 w-4 text-indigo-600" />
      case "SHORT_BREAK":
      case "LONG_BREAK":
        return <Coffee className="h-4 w-4 text-green-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Completed
          </Badge>
        )
      case "CANCELLED":
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            Cancelled
          </Badge>
        )
      case "ACTIVE":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            Active
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatSessionType = (type: string) => {
    switch (type) {
      case "FOCUS":
        return "Focus Session"
      case "SHORT_BREAK":
        return "Short Break"
      case "LONG_BREAK":
        return "Long Break"
      default:
        return type
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Session History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg animate-pulse">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-20"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Session History
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={fetchSessionHistory}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {sessions.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No sessions yet</h3>
            <p className="text-gray-600">Start your first focus session to see your history here!</p>
          </div>
        ) : (
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-start gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full flex-shrink-0">
                    {getSessionIcon(session.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900">{formatSessionType(session.type)}</h4>
                      {getStatusBadge(session.status)}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {session.duration}m
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDistanceToNow(new Date(session.startedAt), { addSuffix: true })}
                      </span>
                      {session.room && (
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {session.room.name}
                        </span>
                      )}
                    </div>

                    {session.summary && <p className="text-sm text-gray-700 line-clamp-2">{session.summary}</p>}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
