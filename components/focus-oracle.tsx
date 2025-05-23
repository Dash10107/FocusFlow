"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { EnhancedButton } from "@/components/ui/enhanced-button"
import { EnhancedCard, EnhancedCardContent, EnhancedCardHeader, EnhancedCardTitle } from "@/components/ui/enhanced-card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import {
  SnowflakeIcon as Crystal,
  Send,
  Sparkles,
  Eye,
  Calendar,
  RefreshCw,
  X,
  Share2,
  Heart,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAppStore } from "@/lib/store"
import { useOracle } from "@/hooks/use-oracle"
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
  const { ui, toggleOracle } = useAppStore()
  const {
    todayOracle,
    oracleHistory,
    isLoading,
    isTyping,
    displayedResponse,
    consultOracle,
    submitFeedback,
    fetchOracleHistory,
  } = useOracle()
  const [prompt, setPrompt] = useState("")
  const [showHistory, setShowHistory] = useState(false)
  const [isRevealing, setIsRevealing] = useState(false)
  const [showFloatingEmojis, setShowFloatingEmojis] = useState(false)
  const [feedbackGiven, setFeedbackGiven] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (ui.isOracleOpen) {
      setShowFloatingEmojis(true)
    } else {
      setShowFloatingEmojis(false)
    }
  }, [ui.isOracleOpen])

  const handleSubmitPrompt = async () => {
    if (!prompt.trim() || isLoading) return

    setIsRevealing(true)
    const result = await consultOracle(prompt.trim())

    if (result) {
      setPrompt("")
      setTimeout(() => {
        setIsRevealing(false)
      }, 1500)
    } else {
      setIsRevealing(false)
    }
  }

  const handleFeedback = async (resonates: boolean) => {
    if (!todayOracle || feedbackGiven) return

    await submitFeedback(resonates)
    setFeedbackGiven(true)
  }

  const handleShare = async () => {
    if (!todayOracle) return

    const shareText = `🔮 Today's Oracle Wisdom:\n\n"${todayOracle.oracleResponse}"\n\n#FocusFlow #Productivity #Oracle`

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Oracle Wisdom",
          text: shareText,
        })
      } else {
        await navigator.clipboard.writeText(shareText)
        toast({
          title: "✨ Copied to Clipboard",
          description: "Oracle wisdom ready to share!",
          variant: "success",
        })
      }
    } catch (error) {
      console.error("Error sharing:", error)
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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in-0 duration-500">
      {/* Floating Mystical Elements */}
      {showFloatingEmojis && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 text-4xl animate-bounce delay-0 floating-1">✨</div>
          <div className="absolute top-1/3 right-1/4 text-3xl animate-bounce delay-1000 floating-2">🌟</div>
          <div className="absolute bottom-1/3 left-1/3 text-2xl animate-bounce delay-500 floating-3">💫</div>
          <div className="absolute bottom-1/4 right-1/3 text-3xl animate-bounce delay-1500 floating-1">⭐</div>
          <div className="absolute top-1/2 left-1/6 text-2xl animate-bounce delay-2000 floating-2">🔮</div>
          <div className="absolute top-3/4 right-1/6 text-3xl animate-bounce delay-750 floating-3">🌙</div>
        </div>
      )}

      <EnhancedCard
        variant="oracle"
        className={cn(
          "w-full max-w-4xl shadow-2xl animate-in zoom-in-95 fade-in-0 duration-700",
          "backdrop-blur-xl border-2",
          todayOracle && "oracle-glow",
        )}
      >
        <EnhancedCardHeader className="text-center relative">
          <EnhancedButton
            variant="ghost"
            size="sm"
            onClick={toggleOracle}
            className="absolute right-2 top-2 hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors"
          >
            <X className="h-4 w-4" />
          </EnhancedButton>

          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3">
              <Crystal className="h-10 w-10 text-purple-600 animate-pulse" />
              <EnhancedCardTitle className="text-4xl gradient-text-oracle font-bold">🔮 Focus Oracle</EnhancedCardTitle>
              <Crystal className="h-10 w-10 text-purple-600 animate-pulse delay-500" />
            </div>
            <p className="text-xl text-purple-600 dark:text-purple-300 font-medium">
              Mystical guidance for your focus journey
            </p>
            {todayOracle && (
              <div className="flex items-center justify-center gap-2">
                <Badge
                  variant="secondary"
                  className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                >
                  🕐 {new Date(todayOracle.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </Badge>
                <Badge
                  variant="secondary"
                  className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
                >
                  📅 {new Date(todayOracle.date).toLocaleDateString()}
                </Badge>
              </div>
            )}
          </div>
        </EnhancedCardHeader>

        <EnhancedCardContent className="space-y-6">
          {!showHistory ? (
            <>
              {/* Oracle Response or Input */}
              {todayOracle ? (
                <div className="space-y-6">
                  {/* Revealing Animation */}
                  {isRevealing && (
                    <div className="text-center space-y-6 animate-in fade-in-0 zoom-in-95 duration-1000">
                      <div className="text-9xl animate-pulse oracle-text-glow">🔮</div>
                      <div className="flex items-center justify-center gap-3">
                        <Sparkles className="h-8 w-8 text-purple-500 animate-spin" />
                        <p className="text-2xl text-purple-700 dark:text-purple-300 font-bold oracle-text-glow">
                          The Oracle channels ancient wisdom...
                        </p>
                        <Sparkles className="h-8 w-8 text-purple-500 animate-spin delay-300" />
                      </div>
                      <div className="flex justify-center space-x-3">
                        <div className="w-4 h-4 bg-purple-500 rounded-full animate-bounce delay-0"></div>
                        <div className="w-4 h-4 bg-indigo-500 rounded-full animate-bounce delay-150"></div>
                        <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce delay-300"></div>
                      </div>
                    </div>
                  )}

                  {/* Oracle Message */}
                  {!isRevealing && (
                    <EnhancedCard
                      variant="glass"
                      className="shadow-2xl animate-in slide-in-from-bottom-4 fade-in-0 duration-700 border-2 border-purple-200 dark:border-purple-700"
                    >
                      <EnhancedCardContent className="p-8 space-y-6">
                        <div className="flex items-start gap-4">
                          <Eye className="h-7 w-7 text-purple-600 mt-1 flex-shrink-0 animate-pulse" />
                          <div className="flex-1">
                            <p className="text-sm text-purple-700 dark:text-purple-300 font-bold mb-3 uppercase tracking-wide">
                              Your Question:
                            </p>
                            <p className="text-gray-700 dark:text-gray-300 italic text-xl leading-relaxed">
                              "{todayOracle.userPrompt}"
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-4">
                          <Crystal className="h-7 w-7 text-purple-600 mt-1 flex-shrink-0 animate-pulse" />
                          <div className="flex-1">
                            <p className="text-sm text-purple-700 dark:text-purple-300 font-bold mb-4 uppercase tracking-wide">
                              Oracle's Wisdom:
                            </p>
                            <blockquote className="text-2xl text-purple-900 dark:text-purple-100 font-bold leading-relaxed oracle-text-glow">
                              {displayedResponse}
                              {isTyping && <span className="animate-pulse text-purple-500 text-3xl">|</span>}
                            </blockquote>
                          </div>
                        </div>

                        {/* Feedback Section */}
                        {!isTyping && !feedbackGiven && (
                          <div className="border-t border-purple-200 dark:border-purple-700 pt-6 animate-in fade-in-0 duration-500 delay-1000">
                            <p className="text-center text-purple-700 dark:text-purple-300 mb-4 font-medium">
                              Does this wisdom resonate with your current challenge?
                            </p>
                            <div className="flex justify-center gap-4">
                              <EnhancedButton
                                variant="success"
                                size="sm"
                                onClick={() => handleFeedback(true)}
                                className="transform hover:scale-105"
                              >
                                <ThumbsUp className="h-4 w-4 mr-2" />
                                Yes, it resonates
                              </EnhancedButton>
                              <EnhancedButton
                                variant="outline"
                                size="sm"
                                onClick={() => handleFeedback(false)}
                                className="transform hover:scale-105"
                              >
                                <ThumbsDown className="h-4 w-4 mr-2" />
                                Not quite
                              </EnhancedButton>
                            </div>
                          </div>
                        )}

                        {feedbackGiven && (
                          <div className="text-center animate-in fade-in-0 duration-500">
                            <Badge
                              variant="secondary"
                              className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            >
                              <Heart className="h-3 w-3 mr-1" />
                              Thank you for your feedback
                            </Badge>
                          </div>
                        )}
                      </EnhancedCardContent>
                    </EnhancedCard>
                  )}

                  {!isRevealing && (
                    <div className="flex justify-center gap-4 animate-in slide-in-from-bottom-2 fade-in-0 duration-500 delay-300">
                      <EnhancedButton
                        variant="outline"
                        onClick={handleShare}
                        className="border-purple-300 text-purple-700 hover:bg-purple-50 dark:border-purple-600 dark:text-purple-300 transform hover:scale-105"
                      >
                        <Share2 className="h-4 w-4 mr-2" />
                        Share Wisdom
                      </EnhancedButton>
                      <Badge
                        variant="secondary"
                        className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 px-6 py-3 text-base font-medium"
                      >
                        ✨ Today's wisdom received
                      </Badge>
                    </div>
                  )}
                </div>
              ) : (
                /* Oracle Input Form */
                <div className="space-y-8">
                  <div className="text-center space-y-6 animate-in fade-in-0 zoom-in-95 duration-700">
                    <div className="text-10xl animate-bounce oracle-text-glow">🔮</div>
                    <div className="space-y-4">
                      <h3 className="text-3xl font-bold gradient-text-oracle">Seek Daily Wisdom</h3>
                      <p className="text-xl text-purple-600 dark:text-purple-300 font-medium">
                        What challenges your focus today?
                      </p>
                    </div>
                  </div>

                  {/* Quick Prompts */}
                  <div className="space-y-4 animate-in slide-in-from-bottom-4 fade-in-0 duration-500 delay-200">
                    <p className="text-center text-purple-600 dark:text-purple-400 font-bold uppercase tracking-wide">
                      Quick questions:
                    </p>
                    <div className="flex flex-wrap gap-3 justify-center">
                      {quickPrompts.map((quickPrompt) => (
                        <Badge
                          key={quickPrompt}
                          variant="outline"
                          className={cn(
                            "cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 p-3",
                            "hover:bg-purple-100 dark:hover:bg-purple-900/50",
                            "border-purple-300 dark:border-purple-600",
                            "text-purple-700 dark:text-purple-300 font-medium",
                            "hover:shadow-lg",
                          )}
                          onClick={() => handleQuickPrompt(quickPrompt)}
                        >
                          {quickPrompt}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Input */}
                  <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in-0 duration-500 delay-400">
                    <Input
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="What blocks your focus today?"
                      disabled={isLoading}
                      className="border-2 border-purple-300 dark:border-purple-600 focus:border-purple-500 text-center text-xl py-6 bg-white/80 dark:bg-gray-800/80 rounded-xl shadow-lg focus:shadow-xl transition-all duration-300"
                    />

                    <EnhancedButton
                      onClick={handleSubmitPrompt}
                      disabled={!prompt.trim() || isLoading}
                      variant="oracle"
                      size="xl"
                      loading={isLoading}
                      loadingText="Consulting Oracle..."
                      className="w-full py-6 text-xl font-bold shadow-2xl"
                    >
                      <Send className="h-6 w-6 mr-3" />
                      Seek Wisdom
                    </EnhancedButton>
                  </div>
                </div>
              )}

              {/* History Toggle */}
              {oracleHistory.length > 0 && (
                <div className="text-center pt-6 border-t border-purple-200 dark:border-purple-700 animate-in fade-in-0 duration-500 delay-500">
                  <EnhancedButton
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowHistory(true)}
                    className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200 hover:bg-purple-50 dark:hover:bg-purple-900/30 transform hover:scale-105"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    View Past Wisdom ({oracleHistory.length})
                  </EnhancedButton>
                </div>
              )}
            </>
          ) : (
            /* Oracle History */
            <div className="space-y-6 animate-in slide-in-from-right-4 fade-in-0 duration-500">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold gradient-text-oracle">Oracle History</h3>
                <EnhancedButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHistory(false)}
                  className="text-purple-600 dark:text-purple-400 hover:scale-105"
                >
                  <RefreshCw className="h-4 w-4" />
                </EnhancedButton>
              </div>

              <ScrollArea className="h-96 custom-scrollbar">
                <div className="space-y-4 pr-4">
                  {oracleHistory.map((oracle, index) => (
                    <EnhancedCard
                      key={oracle.id}
                      variant="glass"
                      hover
                      className="animate-in slide-in-from-bottom-2 fade-in-0 duration-300 border border-purple-200 dark:border-purple-700"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <EnhancedCardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <Badge variant="outline" className="text-purple-600 dark:text-purple-400 font-medium">
                            📅 {new Date(oracle.date).toLocaleDateString()}
                          </Badge>
                          <EnhancedButton
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const shareText = `🔮 Oracle Wisdom:\n\n"${oracle.oracleResponse}"\n\n#FocusFlow #Oracle`
                              navigator.clipboard.writeText(shareText)
                              toast({
                                title: "✨ Copied!",
                                description: "Oracle wisdom copied to clipboard",
                                variant: "success",
                              })
                            }}
                            className="hover:scale-105"
                          >
                            <Share2 className="h-4 w-4" />
                          </EnhancedButton>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 mb-4 italic font-medium">
                          "{oracle.userPrompt}"
                        </p>
                        <blockquote className="text-purple-900 dark:text-purple-100 font-bold border-l-4 border-purple-400 dark:border-purple-500 pl-6 text-lg leading-relaxed">
                          {oracle.oracleResponse}
                        </blockquote>
                      </EnhancedCardContent>
                    </EnhancedCard>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </EnhancedCardContent>
      </EnhancedCard>
    </div>
  )
}
