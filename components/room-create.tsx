"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { ArrowLeft, Users } from "lucide-react"
import { useRouter } from "next/navigation"

export function RoomCreate() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isPublic: true,
    maxMembers: 10,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const { room } = await response.json()
        router.push(`/rooms/${room.id}`)
      } else {
        const { error } = await response.json()
        alert(error || "Failed to create room")
      }
    } catch (error) {
      console.error("Error creating room:", error)
      alert("Failed to create room")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Rooms
        </Button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Co-working Room</h1>
        <p className="text-gray-600">Set up a space where you and others can focus together.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Room Details
          </CardTitle>
          <CardDescription>Configure your co-working room settings</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Room Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Morning Focus Session"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="What will you be working on? (optional)"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Public Room</Label>
                  <p className="text-sm text-gray-600">Allow anyone to discover and join this room</p>
                </div>
                <Switch
                  checked={formData.isPublic}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isPublic: checked }))}
                />
              </div>

              <div className="space-y-3">
                <Label>Maximum Members: {formData.maxMembers}</Label>
                <Slider
                  value={[formData.maxMembers]}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, maxMembers: value[0] }))}
                  max={50}
                  min={2}
                  step={1}
                  className="w-full"
                />
                <p className="text-sm text-gray-600">Recommended: 5-15 members for optimal engagement</p>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || !formData.name.trim()} className="flex-1">
                {isLoading ? "Creating..." : "Create Room"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
