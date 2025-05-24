"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, Brain, Target, X, Sparkles } from "lucide-react"

interface SessionSummaryProps {
  sessionId: string
  summary: {
    summary: string
    insights: string[]
    recommendations: string[]
    mood: "excellent" | "good" | "fair" | "needs_improvement"
    focusScore: number
  }
  onClose: () => void
}

export function SessionSummary({ sessionId, summary, onClose }: SessionSummaryProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)

    // Auto-close after 10 seconds
    const timer = setTimeout(() => {
      handleClose()
    }, 10000)

    return () => clearTimeout(timer)
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 300) // Wait for animation
  }

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case "excellent":
        return "bg-green-100 text-green-800 border-green-200"
      case "good":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "fair":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "needs_improvement":
        return "bg-orange-100 text-orange-800 border-orange-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getMoodEmoji = (mood: string) => {
    switch (mood) {
      case "excellent":
        return "🎯"
      case "good":
        return "👍"
      case "fair":
        return "📈"
      case "needs_improvement":
        return "💪"
      default:
        return "✨"
    }
  }

  return (
    <div
      className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <Card
        className={`w-full max-w-2xl transform transition-all duration-300 ${
          isVisible ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
        }`}
      >
        <CardHeader className="relative">
          <Button variant="ghost" size="sm" onClick={handleClose} className="absolute right-2 top-2">
            <X className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                Session Complete! {getMoodEmoji(summary.mood)}
                <Badge className={getMoodColor(summary.mood)}>{summary.focusScore}/100 Focus Score</Badge>
              </CardTitle>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Main Summary */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg border border-indigo-100">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-indigo-600 mt-0.5 flex-shrink-0" />
              <p className="text-gray-900 leading-relaxed">{summary.summary}</p>
            </div>
          </div>

          {/* Insights */}
          {summary.insights.length > 0 && (
            <div>
              <h4 className="flex items-center gap-2 font-semibold text-gray-900 mb-3">
                <Brain className="h-4 w-4 text-blue-600" />
                Key Insights
              </h4>
              <ul className="space-y-2">
                {summary.insights.map((insight, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-700">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-sm">{insight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          {summary.recommendations.length > 0 && (
            <div>
              <h4 className="flex items-center gap-2 font-semibold text-gray-900 mb-3">
                <Target className="h-4 w-4 text-green-600" />
                Recommendations
              </h4>
              <ul className="space-y-2">
                {summary.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-700">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-sm">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button onClick={handleClose} className="flex-1">
              Continue Focusing
            </Button>
            <Button variant="outline" onClick={() => (window.location.href = "/stats")}>
              View Stats
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
