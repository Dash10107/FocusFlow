"use client"

import { useState, useEffect } from "react"
import { useAppStore } from "@/lib/store"
import { apiClient, handleApiCall } from "@/lib/api-client"

export function useOracle() {
  const { todayOracle, setTodayOracle } = useAppStore()
  const [isLoading, setIsLoading] = useState(false)
  const [oracleHistory, setOracleHistory] = useState<any[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [displayedResponse, setDisplayedResponse] = useState("")

  // Fetch today's oracle on mount
  useEffect(() => {
    fetchTodayOracle()
    fetchOracleHistory()
  }, [])

  // Typewriter effect
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
      }, 25)

      return () => clearInterval(timer)
    } else if (todayOracle && !isTyping) {
      setDisplayedResponse(todayOracle.oracleResponse)
    }
  }, [todayOracle, isTyping])

  const fetchTodayOracle = async () => {
    const result = await handleApiCall(() => apiClient.getTodayOracle(), { showErrorToast: false })

    if (result?.oracle) {
      setTodayOracle(result.oracle)
    }
  }

  const fetchOracleHistory = async () => {
    const result = await handleApiCall(() => apiClient.getOracleHistory(), { showErrorToast: false })

    if (result?.history) {
      setOracleHistory(result.history)
    }
  }

  const consultOracle = async (prompt: string) => {
    setIsLoading(true)

    const result = await handleApiCall(() => apiClient.consultOracle(prompt), {
      successMessage: "🔮 The Oracle has spoken!",
      showSuccessToast: true,
    })

    if (result?.oracle) {
      setTodayOracle(result.oracle)
      setTimeout(() => setIsTyping(true), 1000)
    }

    setIsLoading(false)
    return result
  }

  const submitFeedback = async (resonates: boolean, feedback?: string) => {
    if (!todayOracle) return

    await handleApiCall(() => apiClient.submitOracleFeedback(todayOracle.id, resonates, feedback), {
      successMessage: "Thank you for your feedback!",
      showSuccessToast: true,
    })
  }

  return {
    todayOracle,
    oracleHistory,
    isLoading,
    isTyping,
    displayedResponse,
    consultOracle,
    submitFeedback,
    fetchOracleHistory,
  }
}
