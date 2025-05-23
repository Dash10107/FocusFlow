"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Calendar, Share2, RefreshCw, SnowflakeIcon as Crystal } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { LoadingSkeleton } from "@/components/loading-spinner"

interface OracleMessage {
  id: string
  userPrompt: string
  oracleResponse: string
  date: string
  createdAt: string
}

interface OracleHistoryProps {
  userId: string
  compact?: boolean
}

export function OracleHistory({ userId, compact = false }: OracleHistoryProps) {
  const [history, setHistory] = useState<OracleMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchHistory()
  }, [userId])

  const fetchHistory = async () => {
    try {
      const response = await fetch("/api/ai/oracle/history")
      if (response.ok) {
        const data = await response.json()
        setHistory(data.history)
      }
    } catch (error) {
      console.error("Error fetching oracle history:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleShare = async (oracle: OracleMessage) => {
    const shareText = `🔮 Oracle Wisdom from ${new Date(oracle.date).toLocaleDateString()}:\n\n"${oracle.oracleResponse}"\n\n#FocusFlow #Oracle`

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

  if (isLoading) {
    return (
      <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-purple-200 dark:border-purple-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crystal className="h-5 w-5 text-purple-600" />
            Oracle History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-3">
                <LoadingSkeleton className="h-4 w-1/4" />
                <LoadingSkeleton className="h-3 w-full" />
                <LoadingSkeleton className="h-6 w-3/4" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-purple-200 dark:border-purple-700 hover:shadow-lg transition-all duration-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Crystal className="h-5 w-5 text-purple-600" />
            Oracle History
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={fetchHistory}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <div className="text-center py-8">
            <Crystal className="h-12 w-12 text-purple-300 dark:text-purple-600 mx-auto mb-4 animate-pulse" />
            <h3 className="text-lg font-medium text-purple-800 dark:text-purple-200 mb-2">No Oracle History</h3>
            <p className="text-purple-600 dark:text-purple-400 text-sm">
              Consult the Oracle to begin your wisdom journey
            </p>
          </div>
        ) : (
          <ScrollArea className={compact ? "h-64" : "h-96"}>
            <div className="space-y-4">
              {history.map((oracle, index) => (
                <div
                  key={oracle.id}
                  className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-lg p-4 border border-purple-200 dark:border-purple-700 animate-in slide-in-from-bottom-2 fade-in-0 duration-300"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <Badge
                      variant="outline"
                      className="text-xs text-purple-600 dark:text-purple-400 border-purple-300 dark:border-purple-600"
                    >
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(oracle.date).toLocaleDateString()}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleShare(oracle)}
                      className="h-6 w-6 p-0 hover:bg-purple-100 dark:hover:bg-purple-900/50"
                    >
                      <Share2 className="h-3 w-3" />
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-purple-700 dark:text-purple-300 font-medium mb-1">Question:</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 italic">"{oracle.userPrompt}"</p>
                    </div>

                    <div>
                      <p className="text-xs text-purple-700 dark:text-purple-300 font-medium mb-1">Oracle's Wisdom:</p>
                      <blockquote className="text-sm text-purple-900 dark:text-purple-100 font-medium border-l-4 border-purple-300 dark:border-purple-600 pl-3 leading-relaxed">
                        {oracle.oracleResponse}
                      </blockquote>
                    </div>
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
