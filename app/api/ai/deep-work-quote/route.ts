import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { GoogleGenerativeAI } from "@google/generative-ai"

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()

    let quote: string

    if (!process.env.GEMINI_API_KEY) {
      // Fallback quotes when Gemini is unavailable
      const fallbackQuotes = [
        "The cave you fear to enter holds the treasure you seek. Begin your deep work journey.",
        "Deep work is the ability to focus without distraction. You have this power within you.",
        "Your attention is your most precious resource. Protect it fiercely.",
        "In the depth of silence, you will find the fountain of creativity.",
        "The master has failed more times than the beginner has even tried.",
        "What we plant in the soil of contemplation, we shall reap in the harvest of action.",
        "The mind is everything. What you think you become. Think deeply.",
        "Concentration is the secret of strength in politics, in war, in trade, in short in all management of human affairs.",
      ]
      quote = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)]
    } else {
      try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

        const prompt = `Generate one powerful, inspiring quote about deep work, focus, or concentration. 

Requirements:
- 1-2 sentences maximum
- Profound and motivational
- Related to focus, deep work, or mental clarity
- Should inspire someone about to begin a focused work session
- Can be philosophical or practical
- Keep it under 150 characters

Examples:
- "The cave you fear to enter holds the treasure you seek."
- "Your attention is your most precious resource. Guard it well."
- "In the depth of silence, you will find the fountain of creativity."

Generate only the quote, no additional text or attribution:`

        const result = await model.generateContent(prompt)
        const response = await result.response
        quote = response.text().trim()

        // Clean up response
        quote = quote.replace(/^["']|["']$/g, "") // Remove quotes
        if (quote.length > 200) {
          quote = quote.substring(0, 197) + "..."
        }
      } catch (error) {
        console.error("Gemini API error:", error)
        quote = "The cave you fear to enter holds the treasure you seek. Begin your deep work journey."
      }
    }

    return NextResponse.json({ quote })
  } catch (error) {
    console.error("Deep work quote API error:", error)
    return NextResponse.json(
      { quote: "Deep work is the ability to focus without distraction. You have this power within you." },
      { status: 200 },
    )
  }
}
