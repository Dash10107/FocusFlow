"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PomodoroTimer } from "./pomodoro-timer"
import { Users, LogOut, Clock, Globe, Lock } from "lucide-react"
import { useAppStore } from "@/lib/store"
import { useRouter } from "next/navigation"

interface RoomMember {
  userId: string
  name: string
  avatar: string | null
  status: "focus" | "break" | "idle"
  joinedAt: number
}

interface RoomDetailProps {
  roomId: string
  roomName: string
  roomDescription: string | null
  isPublic: boolean
  userId: string
}

export function RoomDetail({ roomId, roomName, roomDescription, isPublic, userId }: RoomDetailProps) {
  const router = useRouter()
  const { room, setRoom, leaveRoom } = useAppStore()
  const [members, setMembers] = useState<Record<string, RoomMember>>({})
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Join room on mount
    joinRoom()

    // Set up polling for room presence
    const interval = setInterval(fetchRoomPresence, 5000)

    return () => {
      clearInterval(interval)
      handleLeaveRoom()
    }
  }, [roomId])

  const joinRoom = async () => {
    try {
      const response = await fetch("/api/rooms/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId }),
      })

      if (response.ok) {
        setRoom({
          id: roomId,
          name: roomName,
          isConnected: true,
        })
        fetchRoomPresence()
      }
    } catch (error) {
      console.error("Error joining room:", error)
    }
  }

  const fetchRoomPresence = async () => {
    try {
      const response = await fetch(`/api/rooms/${roomId}/presence`)
      if (response.ok) {
        const { members: roomMembers } = await response.json()
        setMembers(roomMembers)
      }
    } catch (error) {
      console.error("Error fetching room presence:", error)
    }
  }

  const handleLeaveRoom = async () => {
    setIsLoading(true)
    try {
      await fetch("/api/rooms/leave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId }),
      })

      leaveRoom()
      router.push("/rooms")
    } catch (error) {
      console.error("Error leaving room:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "focus":
        return "bg-red-100 text-red-800"
      case "break":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "focus":
        return "🎯"
      case "break":
        return "☕"
      default:
        return "💤"
    }
  }

  const membersList = Object.values(members)
  const activeFocusers = membersList.filter((m) => m.status === "focus").length
  const onBreak = membersList.filter((m) => m.status === "break").length

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Room Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">{roomName}</h1>
            <div className="flex items-center gap-2">
              {isPublic ? (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Globe className="h-3 w-3" />
                  Public
                </Badge>
              ) : (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Lock className="h-3 w-3" />
                  Private
                </Badge>
              )}
              <Badge variant="outline" className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {membersList.length} member{membersList.length !== 1 ? "s" : ""}
              </Badge>
            </div>
          </div>
          {roomDescription && <p className="text-gray-600 mb-4">{roomDescription}</p>}
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">🎯 {activeFocusers} focusing</span>
            <span className="flex items-center gap-1">☕ {onBreak} on break</span>
          </div>
        </div>
        <Button variant="outline" onClick={handleLeaveRoom} disabled={isLoading}>
          <LogOut className="h-4 w-4 mr-2" />
          Leave Room
        </Button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Timer Section */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Focus Timer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PomodoroTimer userId={userId} roomId={roomId} />
            </CardContent>
          </Card>
        </div>

        {/* Members Sidebar */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Room Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              {membersList.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No members online</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {membersList.map((member) => (
                    <div
                      key={member.userId}
                      className={`flex items-center gap-3 p-3 rounded-lg ${
                        member.userId === userId ? "bg-indigo-50 border border-indigo-200" : "bg-gray-50"
                      }`}
                    >
                      <div className="relative">
                        {member.avatar ? (
                          <img
                            src={member.avatar || "/placeholder.svg"}
                            alt={member.name}
                            className="w-10 h-10 rounded-full"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-gray-600 text-sm font-medium">{member.name.charAt(0)}</span>
                          </div>
                        )}
                        <div className="absolute -bottom-1 -right-1 text-lg">{getStatusIcon(member.status)}</div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {member.name}
                          {member.userId === userId && <span className="text-indigo-600 ml-1">(You)</span>}
                        </p>
                        <Badge variant="secondary" className={`text-xs ${getStatusColor(member.status)}`}>
                          {member.status === "focus" ? "Focusing" : member.status === "break" ? "On Break" : "Idle"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
