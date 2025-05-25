"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { SnowflakeIcon as Crystal, Send, Sparkles, Eye, Calendar, RefreshCw, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { LoadingSpinner } from "@/components/loading-spinner"
import { useAppStore } from "@/lib/store"
import { cn } from "@/lib/utils"

interface OracleMessage {
  id: string
  userPrompt: string
  oracleResponse: string
  date: string
  createdAt: string
}

interface FocusOracleProps {
  userId: string
}

export function FocusOracle({ userId }: FocusOracleProps) {
  const { ui, toggleOracle, todayOracle, setTodayOracle } = useAppStore()
  const [prompt, setPrompt] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [oracleHistory, setOracleHistory] = useState<OracleMessage[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [displayedResponse, setDisplayedResponse] = useState("")
  const [isRevealing, setIsRevealing] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (ui.isOracleOpen) {
      fetchTodayOracle()
      fetchOracleHistory()
    }
  }, [ui.isOracleOpen])

  // Typewriter animation effect
  useEffect(() => {
    if (todayOracle && isTyping) {
      let index = 0
      const response = todayOracle.oracleResponse
      setDisplayedResponse("")

      const timer = setInterval(() => {
        if (index < response.length) {
          setDisplayedResponse(response.slice(0, index + 1))
          index++
        } else {
          setIsTyping(false)
          clearInterval(timer)
        }
      }, 30)

      return () => clearInterval(timer)
    } else if (todayOracle && !isTyping) {
      setDisplayedResponse(todayOracle.oracleResponse)
    }
  }, [todayOracle, isTyping])

  const fetchTodayOracle = async () => {
    try {
      const response = await fetch("/api/ai/oracle/today")
      if (response.ok) {
        const data = await response.json()
        setTodayOracle(data.oracle)
      }
    } catch (error) {
      console.error("Error fetching today's oracle:", error)
    }
  }

  const fetchOracleHistory = async () => {
    try {
      const response = await fetch("/api/ai/oracle/history")
      if (response.ok) {
        const data = await response.json()
        setOracleHistory(data.history)
      }
    } catch (error) {
      console.error("Error fetching oracle history:", error)
    }
  }

  const handleSubmitPrompt = async () => {
    if (!prompt.trim() || isLoading) return

    setIsLoading(true)
    setIsRevealing(true)

    try {
      const response = await fetch("/api/ai/oracle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim() }),
      })

      if (response.ok) {
        const data = await response.json()
        setTodayOracle(data.oracle)
        setPrompt("")

        // Delay typing animation for dramatic effect
        setTimeout(() => {
          setIsTyping(true)
          setIsRevealing(false)
        }, 1000)

        toast({
          title: "🔮 Oracle Has Spoken",
          description: "Your daily wisdom has been revealed.",
          variant: "success",
        })
      } else {
        const errorData = await response.json()
        if (response.status === 429) {
          toast({
            title: "Oracle Rests",
            description: errorData.message || "The Oracle speaks only once per day. Return tomorrow for new wisdom.",
            variant: "warning",
          })
        } else {
          throw new Error(errorData.error || "Failed to consult oracle")
        }
      }
    } catch (error) {
      console.error("Error consulting oracle:", error)
      toast({
        title: "Oracle Unavailable",
        description: "The mystical connection is weak. Try again later.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      if (!todayOracle) setIsRevealing(false)
    }
  }

  const quickPrompts = [
    "What's blocking my focus today?",
    "How can I overcome procrastination?",
    "I feel overwhelmed with tasks",
    "Help me find motivation",
    "I'm struggling with distractions",
  ]

  const handleQuickPrompt = (selectedPrompt: string) => {
    setPrompt(selectedPrompt)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmitPrompt()
    }
  }

  if (!ui.isOracleOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <Card
        className={cn(
          "w-full max-w-2xl shadow-2xl",
          "bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50",
          "dark:from-purple-900/20 dark:via-indigo-900/20 dark:to-blue-900/20",
          "border-purple-200 dark:border-purple-800",
          "animate-in zoom-in-95 fade-in-0 duration-300",
        )}
      >
        <CardHeader className="text-center relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleOracle}
            className="absolute right-2 top-2 hover:bg-purple-100 dark:hover:bg-purple-900/50"
          >
            <X className="h-4 w-4" />
          </Button>

          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Crystal className="h-8 w-8 text-purple-600 animate-pulse" />
              <CardTitle className="text-2xl text-purple-800 dark:text-purple-200">🔮 Focus Oracle</CardTitle>
              <Crystal className="h-8 w-8 text-purple-600 animate-pulse delay-500" />
            </div>
            <p className="text-purple-600 dark:text-purple-300">Mystical guidance for your focus journey</p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {!showHistory ? (
            <>
              {/* Oracle Response or Input */}
              {todayOracle ? (
                <div className="space-y-6">
                  {/* Revealing Animation */}
                  {isRevealing && (
                    <div className="text-center space-y-4">
                      <div className="text-6xl animate-pulse">🔮</div>
                      <div className="flex items-center justify-center gap-2">
                        <Sparkles className="h-5 w-5 text-purple-500 animate-spin" />
                        <p className="text-purple-700 dark:text-purple-300 font-medium">
                          The Oracle is channeling wisdom...
                        </p>
                        <Sparkles className="h-5 w-5 text-purple-500 animate-spin delay-300" />
                      </div>
                    </div>
                  )}

                  {/* Oracle Message */}
                  {!isRevealing && (
                    <Card className="bg-white/70 dark:bg-gray-800/70 border-purple-200 dark:border-purple-700 shadow-lg">
                      <CardContent className="p-6 space-y-4">
                        <div className="flex items-start gap-3">
                          <Eye className="h-5 w-5 text-purple-600 mt-1 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-sm text-purple-700 dark:text-purple-300 font-medium mb-2">
                              Your Question:
                            </p>
                            <p className="text-gray-700 dark:text-gray-300 italic">"{todayOracle.userPrompt}"</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <Crystal className="h-5 w-5 text-purple-600 mt-1 flex-shrink-0 animate-pulse" />
                          <div className="flex-1">
                            <p className="text-sm text-purple-700 dark:text-purple-300 font-medium mb-2">
                              Oracle's Wisdom:
                            </p>
                            <blockquote className="text-lg text-purple-900 dark:text-purple-100 font-medium leading-relaxed">
                              {displayedResponse}
                              {isTyping && <span className="animate-pulse text-purple-500">|</span>}
                            </blockquote>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {!isRevealing && (
                    <div className="text-center">
                      <Badge
                        variant="secondary"
                        className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 px-4 py-2"
                      >
                        ✨ Today's wisdom received
                      </Badge>
                    </div>
                  )}
                </div>
              ) : (
                /* Oracle Input Form */
                <div className="space-y-6">
                  <div className="text-center space-y-4">
                    <div className="text-8xl animate-bounce">🔮</div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold text-purple-800 dark:text-purple-200">Seek Daily Wisdom</h3>
                      <p className="text-purple-600 dark:text-purple-300">What challenges your focus today?</p>
                    </div>
                  </div>

                  {/* Quick Prompts */}
                  <div className="space-y-3">
                    <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Quick questions:</p>
                    <div className="flex flex-wrap gap-2">
                      {quickPrompts.map((quickPrompt) => (
                        <Badge
                          key={quickPrompt}
                          variant="outline"
                          className={cn(
                            "cursor-pointer transition-all duration-200",
                            "hover:bg-purple-100 dark:hover:bg-purple-900/50",
                            "border-purple-300 dark:border-purple-600",
                            "hover:scale-105 active:scale-95",
                          )}
                          onClick={() => handleQuickPrompt(quickPrompt)}
                        >
                          {quickPrompt}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Input */}
                  <div className="space-y-4">
                    <Input
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="What blocks your focus today?"
                      disabled={isLoading}
                      className="border-purple-300 dark:border-purple-600 focus:border-purple-500 text-center text-lg py-3"
                    />

                    <Button
                      onClick={handleSubmitPrompt}
                      disabled={!prompt.trim() || isLoading}
                      className={cn(
                        "w-full py-3 text-lg font-semibold",
                        "bg-gradient-to-r from-purple-600 to-indigo-600",
                        "hover:from-purple-700 hover:to-indigo-700",
                        "transform transition-all duration-200",
                        "hover:scale-105 active:scale-95",
                        "shadow-lg hover:shadow-xl",
                      )}
                    >
                      {isLoading ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          Consulting Oracle...
                        </>
                      ) : (
                        <>
                          <Send className="h-5 w-5 mr-2" />
                          Seek Wisdom
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* History Toggle */}
              {oracleHistory.length > 0 && (
                <div className="text-center pt-4 border-t border-purple-200 dark:border-purple-700">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowHistory(true)}
                    className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    View Past Wisdom ({oracleHistory.length})
                  </Button>
                </div>
              )}
            </>
          ) : (
            /* Oracle History */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-200">Oracle History</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHistory(false)}
                  className="text-purple-600 dark:text-purple-400"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>

              <ScrollArea className="h-80">
                <div className="space-y-3">
                  {oracleHistory.map((oracle) => (
                    <Card
                      key={oracle.id}
                      className="bg-white/50 dark:bg-gray-800/50 border-purple-200 dark:border-purple-700"
                    >
                      <CardContent className="p-4">
                        <div className="text-xs text-purple-600 dark:text-purple-400 mb-2">
                          {new Date(oracle.date).toLocaleDateString()}
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 italic">"{oracle.userPrompt}"</p>
                        <blockquote className="text-sm text-purple-900 dark:text-purple-100 font-medium">
                          {oracle.oracleResponse}
                        </blockquote>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
