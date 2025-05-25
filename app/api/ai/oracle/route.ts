import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { prisma } from "@/lib/prisma"
import { RedisService } from "@/lib/redis"

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { prompt } = await request.json()

    // Validate input
    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json({ error: "Prompt cannot be empty" }, { status: 400 })
    }

    if (prompt.length > 300) {
      return NextResponse.json({ error: "Prompt too long. Please keep it under 300 characters." }, { status: 400 })
    }

    // Check if user already consulted oracle today
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const existingOracle = await prisma.oracleMessage.findUnique({
      where: {
        userId_date: {
          userId: user.id,
          date: today,
        },
      },
    })

    if (existingOracle) {
      return NextResponse.json(
        {
          error: "DAILY_LIMIT_REACHED",
          message: "The Oracle speaks only once per day. Return tomorrow for new wisdom.",
          oracle: existingOracle,
        },
        { status: 429 },
      )
    }

    // Rate limiting (backup check)
    const canConsult = await RedisService.checkRateLimit(user.id, "oracle_consult", 1, 86400) // 1 per day
    if (!canConsult) {
      return NextResponse.json(
        {
          error: "RATE_LIMITED",
          message: "The Oracle's energy is depleted for today. Return tomorrow.",
        },
        { status: 429 },
      )
    }

    // Generate oracle response
    let oracleResponse: string

    if (!process.env.GEMINI_API_KEY) {
      // Fallback responses when Gemini is unavailable
      const fallbackResponses = [
        "The path to focus begins with a single breath. Clear your mind, and clarity will follow.",
        "Resistance is the compass pointing to your true work. Follow where it leads.",
        "Your attention is your most precious resource. Guard it like a sacred flame.",
        "The cave you fear to enter holds the treasure you seek. Begin where you are.",
        "Perfectionism is procrastination in disguise. Progress over perfection, always.",
        "Your future self is counting on the choices you make in this moment.",
        "Distraction is not a lack of focus, but focus on the wrong things. Choose wisely.",
        "The master has failed more times than the beginner has even tried. Keep going.",
      ]
      oracleResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)]
    } else {
      try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

        const oraclePrompt = `You are a wise, mystical productivity oracle. A user seeks guidance about their focus challenges.

Their concern: "${prompt}"

Respond as an oracle with:
1. One powerful, short motivational message (1-2 sentences max)
2. Use mystical but practical language
3. Be encouraging yet profound
4. Focus on actionable wisdom
5. Keep it under 100 words

Examples of good oracle responses:
- "Fear of imperfection is not a reason to stop. Your work awaits your courage, not your perfection."
- "The mind that seeks distraction has forgotten its power. Return to your breath, return to your purpose."
- "What you resist persists. Embrace the difficulty, and it becomes your teacher."

Respond only with the oracle message, no additional text:`

        const result = await model.generateContent(oraclePrompt)
        const response = await result.response
        oracleResponse = response.text().trim()

        // Clean up response
        oracleResponse = oracleResponse.replace(/^["']|["']$/g, "") // Remove quotes
        if (oracleResponse.length > 200) {
          oracleResponse = oracleResponse.substring(0, 197) + "..."
        }
      } catch (error) {
        console.error("Gemini API error:", error)
        // Use fallback
        oracleResponse =
          "The universe whispers its secrets to those who listen deeply. Your focus is your superpower - wield it wisely."
      }
    }

    // Save oracle message
    const oracle = await prisma.oracleMessage.create({
      data: {
        userId: user.id,
        userPrompt: prompt.trim(),
        oracleResponse,
        date: today,
      },
    })

    return NextResponse.json({ oracle })
  } catch (error) {
    console.error("Oracle API error:", error)
    return NextResponse.json({ error: "The mystical connection is disrupted. Try again later." }, { status: 500 })
  }
}
