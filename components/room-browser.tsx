"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Users, Plus, Search, Lock, Globe } from "lucide-react"
import { useAppStore } from "@/lib/store"

interface Room {
  id: string
  name: string
  description: string | null
  isPublic: boolean
  maxMembers: number
  memberCount: number
  activeMembers: number
}

export function RoomBrowser() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const { joinRoom } = useAppStore()

  useEffect(() => {
    fetchRooms()
  }, [])

  const fetchRooms = async () => {
    try {
      const response = await fetch("/api/rooms")
      if (response.ok) {
        const data = await response.json()
        setRooms(data.rooms)
      }
    } catch (error) {
      console.error("Error fetching rooms:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleJoinRoom = async (roomId: string, roomName: string) => {
    try {
      const response = await fetch("/api/rooms/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId }),
      })

      if (response.ok) {
        joinRoom(roomId, roomName)
        // Redirect to room
        window.location.href = `/rooms/${roomId}`
      }
    } catch (error) {
      console.error("Error joining room:", error)
    }
  }

  const filteredRooms = rooms.filter((room) => room.name.toLowerCase().includes(searchTerm.toLowerCase()))

  if (isLoading) {
    return <div className="text-center py-8">Loading rooms...</div>
  }

  return (
    <div className="space-y-6">
      {/* Search and Create */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search rooms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => (window.location.href = "/rooms/create")}>
          <Plus className="h-4 w-4 mr-2" />
          Create Room
        </Button>
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRooms.map((room) => (
          <Card key={room.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {room.isPublic ? <Globe className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                    {room.name}
                  </CardTitle>
                  <CardDescription className="mt-1">{room.description || "No description"}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>
                    {room.memberCount}/{room.maxMembers} members
                  </span>
                </div>
                {room.activeMembers > 0 && (
                  <Badge variant="secondary" className="text-green-600">
                    {room.activeMembers} active
                  </Badge>
                )}
              </div>
              <Button
                onClick={() => handleJoinRoom(room.id, room.name)}
                className="w-full"
                disabled={room.memberCount >= room.maxMembers}
              >
                {room.memberCount >= room.maxMembers ? "Room Full" : "Join Room"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRooms.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No rooms found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm ? "Try adjusting your search terms" : "Be the first to create a co-working room!"}
          </p>
          <Button onClick={() => (window.location.href = "/rooms/create")}>
            <Plus className="h-4 w-4 mr-2" />
            Create Room
          </Button>
        </div>
      )}
    </div>
  )
}
