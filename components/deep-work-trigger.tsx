"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, Brain, Zap } from "lucide-react"
import { useAppStore } from "@/lib/store"

interface DeepWorkTriggerProps {
  userId: string
  variant?: "card" | "button"
  className?: string
}

export function DeepWorkTrigger({ userId, variant = "card", className }: DeepWorkTriggerProps) {
  const { openDeepWork, session } = useAppStore()

  const handleEnterDeepWork = () => {
    openDeepWork()
  }

  if (variant === "button") {
    return (
      <Button
        onClick={handleEnterDeepWork}
        disabled={session.status === "ACTIVE"}
        size="lg"
        className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
      >
        <Sparkles className="h-5 w-5 mr-2" />
        Enter Deep Work Realm
        <Brain className="h-5 w-5 ml-2" />
      </Button>
    )
  }

  return (
    <Card
      className={`bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-purple-200 dark:border-purple-800 hover:shadow-lg transition-all duration-300 cursor-pointer group ${className}`}
      onClick={handleEnterDeepWork}
    >
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-purple-800 dark:text-purple-200 group-hover:scale-105 transition-transform">
          <Sparkles className="h-6 w-6 animate-pulse" />🪄 Deep Work Realm
        </CardTitle>
        <p className="text-purple-600 dark:text-purple-300 text-sm">
          Enter a state of profound focus with guided 90-minute sessions
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center space-y-2">
          <div className="text-4xl group-hover:animate-bounce">🧘‍♂️</div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Immersive environment with ambient sounds, motivational quotes, and distraction-free focus
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-xs text-purple-600 dark:text-purple-400">
          <div>
            <div className="font-semibold">90 Min</div>
            <div>Deep Focus</div>
          </div>
          <div>
            <div className="font-semibold">Ambient</div>
            <div>Sounds</div>
          </div>
          <div>
            <div className="font-semibold">AI</div>
            <div>Guidance</div>
          </div>
        </div>

        <Button
          disabled={session.status === "ACTIVE"}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300 group-hover:scale-105"
        >
          {session.status === "ACTIVE" ? (
            <>
              <Zap className="h-4 w-4 mr-2" />
              Session Active
            </>
          ) : (
            <>
              <Brain className="h-4 w-4 mr-2" />
              Enter Deep Work Realm
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
