import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { prisma } from "@/lib/prisma"
import { RedisService } from "@/lib/redis"

interface ChatMessage {
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface ChatRequest {
  message: string
  userId: string
  conversationHistory?: ChatMessage[]
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { message, conversationHistory = [] }: ChatRequest = await request.json()

    // Rate limiting
    const canChat = await RedisService.checkRateLimit(user.id, "ai_chat", 30, 300) // 30 messages per 5 minutes
    if (!canChat) {
      return NextResponse.json(
        { error: "Too many messages. Please wait a moment before continuing our conversation." },
        { status: 429 },
      )
    }

    // Validate input
    if (!message || message.trim().length === 0) {
      return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 })
    }

    if (message.length > 500) {
      return NextResponse.json({ error: "Message too long. Please keep it under 500 characters." }, { status: 400 })
    }

    // Initialize Gemini
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({
        response:
          "I'm currently offline, but here's a gentle reminder: take a deep breath, eliminate distractions, and focus on one task at a time. You've got this! 🌟",
      })
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    // Get user context for personalization
    const userStats = await getUserContext(user.id)

    // Build conversation context
    const conversationContext = conversationHistory
      .slice(-6) // Last 6 messages for context
      .map((msg) => `${msg.role}: ${msg.content}`)
      .join("\n")

    // Create focused prompt
    const systemPrompt = `You are a Focus Assistant for FocusFlow, a productivity app. Your role is to help users maintain focus, understand productivity concepts, and provide gentle motivation.

User Context:
- Current streak: ${userStats.streakDays} days
- Today's focus time: ${userStats.todayMinutes} minutes
- Total sessions: ${userStats.totalSessions}

Guidelines:
1. Be supportive, calm, and encouraging
2. Keep responses concise (under 150 words)
3. Focus on actionable advice
4. Use a warm, understanding tone
5. Relate advice to their current progress when relevant
6. If asked about non-focus topics, gently redirect to productivity
7. Use emojis sparingly but effectively
8. Provide specific, practical tips

Recent conversation:
${conversationContext}

Current user message: "${message}"

Respond as the Focus Assistant with helpful, encouraging advice:`

    try {
      const result = await model.generateContent(systemPrompt)
      const response = await result.response
      let assistantResponse = response.text()

      // Clean up response
      assistantResponse = assistantResponse.replace(/^(Focus Assistant:|Assistant:)/i, "").trim()

      // Ensure response isn't too long
      if (assistantResponse.length > 300) {
        assistantResponse = assistantResponse.substring(0, 297) + "..."
      }

      // Log the conversation
      const conversationId = await logConversation(user.id, message, assistantResponse)

      return NextResponse.json({
        response: assistantResponse,
        conversationId,
      })
    } catch (geminiError) {
      console.error("Gemini API error:", geminiError)

      // Provide contextual fallback based on message content
      const fallbackResponse = generateFallbackResponse(message, userStats)

      return NextResponse.json({
        response: fallbackResponse,
      })
    }
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json(
      { error: "I'm having trouble thinking right now. Try again in a moment! 🤔" },
      { status: 500 },
    )
  }
}

async function getUserContext(userId: string) {
  try {
    // Get current streak
    const streakDays = await RedisService.getCurrentStreak(userId)

    // Get today's stats
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todayStats = await prisma.dailyStats.findUnique({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
    })

    // Get total sessions
    const totalSessions = await prisma.session.count({
      where: { userId, status: "COMPLETED" },
    })

    return {
      streakDays,
      todayMinutes: todayStats?.focusMinutes || 0,
      totalSessions,
    }
  } catch (error) {
    console.error("Error getting user context:", error)
    return {
      streakDays: 0,
      todayMinutes: 0,
      totalSessions: 0,
    }
  }
}

async function logConversation(userId: string, userMessage: string, assistantResponse: string) {
  try {
    const conversation = await prisma.chatConversation.create({
      data: {
        userId,
        userMessage,
        assistantResponse,
      },
    })
    return conversation.id
  } catch (error) {
    console.error("Error logging conversation:", error)
    return null
  }
}

function generateFallbackResponse(message: string, userStats: any): string {
  const lowerMessage = message.toLowerCase()

  if (lowerMessage.includes("focus") || lowerMessage.includes("distract")) {
    return `I understand you're working on focus. With ${userStats.todayMinutes} minutes of focus time today, you're already making progress! Try the 2-minute rule: commit to just 2 minutes of focused work. Often, starting is the hardest part. 🎯`
  }

  if (lowerMessage.includes("motivat") || lowerMessage.includes("encourage")) {
    return `You've completed ${userStats.totalSessions} focus sessions so far - that's real progress! Remember, every small step builds the habit. Your ${userStats.streakDays}-day streak shows you have the discipline. Keep going! 💪`
  }

  if (lowerMessage.includes("deep work") || lowerMessage.includes("pomodoro")) {
    return `Deep work is sustained, focused effort on cognitively demanding tasks. The Pomodoro Technique breaks this into 25-minute focused sessions with short breaks. It's perfect for building focus gradually. Want to try a session now? 🍅`
  }

  if (lowerMessage.includes("break") || lowerMessage.includes("rest")) {
    return `Breaks are essential! They prevent mental fatigue and help consolidate what you've learned. Try a 5-minute walk, some deep breathing, or just step away from screens. Your brain will thank you! 🌱`
  }

  if (lowerMessage.includes("overwhelm") || lowerMessage.includes("stress")) {
    return `Feeling overwhelmed is normal! Try breaking your tasks into smaller chunks. Focus on just one thing at a time. Remember: you don't have to do everything today, just the next right thing. 🌊`
  }

  // Default fallback
  return `I'm here to help with your focus journey! Whether you need motivation, productivity tips, or just want to understand how to work more effectively, I'm here. What specific aspect of focus would you like to explore? 🌟`
}
