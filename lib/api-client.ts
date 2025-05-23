import { toast } from "@/hooks/use-toast"

interface ApiResponse<T = any> {
  data?: T
  error?: string
  success: boolean
}

class ApiClient {
  private baseUrl = ""

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP ${response.status}`,
        }
      }

      return {
        success: true,
        data,
      }
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Network error",
      }
    }
  }

  // Session API methods
  async startSession(data: any) {
    return this.request("/api/sessions/start", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async pauseSession(sessionId: string) {
    return this.request("/api/sessions/pause", {
      method: "POST",
      body: JSON.stringify({ sessionId }),
    })
  }

  async resumeSession(sessionId: string) {
    return this.request("/api/sessions/resume", {
      method: "POST",
      body: JSON.stringify({ sessionId }),
    })
  }

  async completeSession(sessionId: string) {
    return this.request("/api/sessions/complete", {
      method: "POST",
      body: JSON.stringify({ sessionId }),
    })
  }

  async cancelSession(sessionId: string) {
    return this.request("/api/sessions/cancel", {
      method: "POST",
      body: JSON.stringify({ sessionId }),
    })
  }

  // Oracle API methods
  async consultOracle(prompt: string) {
    return this.request("/api/ai/oracle", {
      method: "POST",
      body: JSON.stringify({ prompt }),
    })
  }

  async getTodayOracle() {
    return this.request("/api/ai/oracle/today")
  }

  async getOracleHistory() {
    return this.request("/api/ai/oracle/history")
  }

  async submitOracleFeedback(oracleId: string, resonates: boolean, feedback?: string) {
    return this.request("/api/ai/oracle/feedback", {
      method: "POST",
      body: JSON.stringify({ oracleId, resonates, feedback }),
    })
  }

  // Chat API methods
  async sendChatMessage(message: string, userId: string, conversationHistory?: any[]) {
    return this.request("/api/ai/chat", {
      method: "POST",
      body: JSON.stringify({ message, userId, conversationHistory }),
    })
  }

  // Room API methods
  async getRooms() {
    return this.request("/api/rooms")
  }

  async createRoom(data: any) {
    return this.request("/api/rooms", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async joinRoom(roomId: string) {
    return this.request("/api/rooms/join", {
      method: "POST",
      body: JSON.stringify({ roomId }),
    })
  }

  async leaveRoom(roomId: string) {
    return this.request("/api/rooms/leave", {
      method: "POST",
      body: JSON.stringify({ roomId }),
    })
  }

  // Stats API methods
  async getStats() {
    return this.request("/api/stats")
  }

  async getLeaderboard() {
    return this.request("/api/leaderboard")
  }

  async getSessionHistory() {
    return this.request("/api/sessions/history")
  }
}

export const apiClient = new ApiClient()

// Helper function for handling API responses with toast notifications
export async function handleApiCall<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  options: {
    successMessage?: string
    errorMessage?: string
    showSuccessToast?: boolean
    showErrorToast?: boolean
  } = {},
): Promise<T | null> {
  const {
    successMessage,
    errorMessage = "Something went wrong",
    showSuccessToast = false,
    showErrorToast = true,
  } = options

  const response = await apiCall()

  if (response.success) {
    if (showSuccessToast && successMessage) {
      toast({
        title: "Success",
        description: successMessage,
        variant: "success",
      })
    }
    return response.data || null
  } else {
    if (showErrorToast) {
      toast({
        title: "Error",
        description: response.error || errorMessage,
        variant: "destructive",
      })
    }
    return null
  }
}
