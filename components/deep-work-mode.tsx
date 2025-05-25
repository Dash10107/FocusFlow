"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { X, Volume2, VolumeX, Sparkles, Brain } from "lucide-react"
import { useAppStore } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"
import { LoadingSpinner } from "@/components/loading-spinner"
import { cn } from "@/lib/utils"

interface DeepWorkModeProps {
  userId: string
}

export function DeepWorkMode({ userId }: DeepWorkModeProps) {
  const { ui, closeDeepWork, session, startSession, setSession, deepWorkQuote, setDeepWorkQuote } = useAppStore()
  const [isLoadingQuote, setIsLoadingQuote] = useState(true)
  const [isStarting, setIsStarting] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [isExiting, setIsExiting] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const { toast } = useToast()

  // Fetch motivational quote on mount
  useEffect(() => {
    if (ui.isDeepWorkActive && !deepWorkQuote) {
      fetchMotivationalQuote()
    } else if (ui.isDeepWorkActive && deepWorkQuote) {
      setIsLoadingQuote(false)
    }
  }, [ui.isDeepWorkActive, deepWorkQuote])

  // Handle audio
  useEffect(() => {
    if (ui.isDeepWorkActive && audioEnabled && audioRef.current) {
      audioRef.current.play().catch(console.error)
    } else if (audioRef.current) {
      audioRef.current.pause()
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
      }
    }
  }, [ui.isDeepWorkActive, audioEnabled])

  // Timer countdown
  useEffect(() => {
    if (hasStarted && session.status === "ACTIVE") {
      setTimeRemaining(session.timeRemaining)

      const interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [hasStarted, session.status, session.timeRemaining])

  // Disable body scroll when active
  useEffect(() => {
    if (ui.isDeepWorkActive) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.body.style.overflow = "unset"
    }
  }, [ui.isDeepWorkActive])

  const fetchMotivationalQuote = async () => {
    setIsLoadingQuote(true)
    try {
      const response = await fetch("/api/ai/deep-work-quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })

      if (response.ok) {
        const data = await response.json()
        setDeepWorkQuote(data.quote)
      } else {
        setDeepWorkQuote("The cave you fear to enter holds the treasure you seek. Begin your deep work journey.")
      }
    } catch (error) {
      console.error("Error fetching quote:", error)
      setDeepWorkQuote("Deep work is the ability to focus without distraction. You have this power within you.")
    } finally {
      setIsLoadingQuote(false)
    }
  }

  const handleStartDeepWork = async () => {
    setIsStarting(true)

    try {
      const response = await fetch("/api/sessions/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "FOCUS",
          duration: 90,
          isDeepWork: true,
        }),
      })

      if (response.ok) {
        const { sessionId } = await response.json()
        startSession("FOCUS", 90)
        setSession({ id: sessionId })
        setHasStarted(true)
        setTimeRemaining(90 * 60)

        toast({
          title: "🪄 Deep Work Realm Activated",
          description: "You've entered a 90-minute deep work session. Focus deeply.",
          variant: "success",
        })
      } else {
        throw new Error("Failed to start session")
      }
    } catch (error) {
      console.error("Error starting deep work:", error)
      toast({
        title: "Error",
        description: "Failed to enter deep work mode. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsStarting(false)
    }
  }

  const handleExit = async () => {
    setIsExiting(true)

    if (hasStarted && session.id) {
      try {
        await fetch("/api/sessions/cancel", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: session.id }),
        })
      } catch (error) {
        console.error("Error canceling session:", error)
      }
    }

    if (audioRef.current) {
      audioRef.current.pause()
    }

    // Show exit animation
    setTimeout(() => {
      closeDeepWork()
      setIsExiting(false)
      setHasStarted(false)
    }, 1000)
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  if (!ui.isDeepWorkActive) return null

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-1000",
        "bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900",
        isExiting && "animate-out fade-out-0 zoom-out-95",
      )}
    >
      {/* Ambient Audio */}
      <audio ref={audioRef} loop preload="auto" className="hidden">
        <source src="/audio/deep-work-ambient.mp3" type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>

      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 md:w-96 md:h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 md:w-96 md:h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 md:w-[600px] md:h-[600px] bg-indigo-500/5 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      {/* Controls */}
      <div className="absolute top-4 right-4 md:top-6 md:right-6 flex items-center gap-3 z-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setAudioEnabled(!audioEnabled)}
          className="text-white/70 hover:text-white hover:bg-white/10 h-10 w-10 md:h-auto md:w-auto"
        >
          {audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          <span className="sr-only md:not-sr-only md:ml-2 hidden md:inline">{audioEnabled ? "Mute" : "Unmute"}</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleExit}
          className="text-white/70 hover:text-white hover:bg-white/10 h-10 w-10 md:h-auto md:w-auto"
        >
          <X className="h-4 w-4" />
          <span className="sr-only md:not-sr-only md:ml-2 hidden md:inline">Exit</span>
        </Button>
      </div>

      {/* Exit Animation */}
      {isExiting && (
        <div className="relative z-10 text-center animate-in fade-in-0 zoom-in-95">
          <div className="space-y-6">
            <div className="text-6xl md:text-8xl">🌟</div>
            <h1 className="text-2xl md:text-4xl font-bold text-white">You've exited the realm</h1>
            <p className="text-lg md:text-xl text-white/80">Well done, focused warrior.</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      {!isExiting && (
        <div className="relative z-10 text-center max-w-4xl mx-auto w-full">
          {!hasStarted ? (
            <div className="space-y-6 md:space-y-8 animate-in fade-in-0 zoom-in-95 duration-1000">
              {/* Header */}
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2 md:gap-3 mb-4 md:mb-6">
                  <Sparkles className="h-6 w-6 md:h-8 md:w-8 text-yellow-400 animate-pulse" />
                  <h1 className="text-3xl md:text-6xl font-bold text-white tracking-wide">🪄 Deep Work Realm</h1>
                  <Sparkles className="h-6 w-6 md:h-8 md:w-8 text-yellow-400 animate-pulse delay-500" />
                </div>

                <p className="text-lg md:text-2xl text-white/80 font-light px-4">
                  Enter a state of profound focus and unlock your potential
                </p>
              </div>

              {/* Motivational Quote */}
              <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl mx-4">
                <CardContent className="p-6 md:p-8">
                  {isLoadingQuote ? (
                    <div className="flex items-center justify-center space-x-2">
                      <LoadingSpinner size="sm" className="text-white" />
                      <span className="text-white/70">Channeling wisdom...</span>
                    </div>
                  ) : (
                    <blockquote className="text-base md:text-xl text-white font-medium italic leading-relaxed">
                      "{deepWorkQuote}"
                    </blockquote>
                  )}
                </CardContent>
              </Card>

              {/* Start Button */}
              <div className="space-y-4 px-4">
                <Button
                  onClick={handleStartDeepWork}
                  disabled={isStarting || isLoadingQuote}
                  size="lg"
                  className={cn(
                    "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700",
                    "text-white font-semibold px-8 md:px-12 py-4 md:py-6 text-lg md:text-xl rounded-full shadow-2xl",
                    "transform transition-all duration-300 hover:scale-105 hover:shadow-purple-500/25",
                    "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
                    "w-full md:w-auto",
                  )}
                >
                  {isStarting ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-3" />
                      Entering Realm...
                    </>
                  ) : (
                    <>
                      <Brain className="h-5 w-5 md:h-6 md:w-6 mr-3" />
                      Begin 90-Minute Deep Work
                    </>
                  )}
                </Button>

                <p className="text-white/60 text-sm md:text-base">
                  A focused 90-minute session with ambient sounds and minimal distractions
                </p>
              </div>
            </div>
          ) : (
            /* Active Session Display */
            <div className="space-y-6 md:space-y-8 animate-in fade-in-0 zoom-in-95">
              <div className="space-y-4">
                <h1 className="text-2xl md:text-5xl font-bold text-white">🧘‍♂️ Deep Work Active</h1>
                <p className="text-base md:text-lg text-white/80 px-4">
                  You are in the realm of deep focus. Stay present.
                </p>
              </div>

              {/* Timer Display */}
              <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl mx-4">
                <CardContent className="p-6 md:p-8">
                  <div className="text-4xl md:text-8xl font-mono font-bold text-white mb-4">
                    {formatTime(timeRemaining)}
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2 md:h-3 mb-4">
                    <div
                      className="bg-gradient-to-r from-purple-400 to-indigo-400 h-2 md:h-3 rounded-full transition-all duration-1000"
                      style={{
                        width: `${((90 * 60 - timeRemaining) / (90 * 60)) * 100}%`,
                      }}
                    />
                  </div>
                  <p className="text-white/70 text-sm md:text-base">
                    {Math.floor(timeRemaining / 60)} minutes remaining in your deep work session
                  </p>
                </CardContent>
              </Card>

              {/* Motivational Quote (smaller) */}
              <Card className="bg-white/5 backdrop-blur-sm border-white/10 mx-4">
                <CardContent className="p-4 md:p-6">
                  <blockquote className="text-white/80 italic text-sm md:text-base">"{deepWorkQuote}"</blockquote>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
