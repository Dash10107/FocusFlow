import { GoogleGenerativeAI } from "@google/generative-ai"

interface SessionSummaryInput {
  type: "FOCUS" | "SHORT_BREAK" | "LONG_BREAK"
  duration: number
  userId: string
  completedAt: Date
  distractionCount?: number
  roomId?: string
  sessionGoal?: string
}

interface ProductivityInsight {
  summary: string
  insights: string[]
  recommendations: string[]
  mood: "excellent" | "good" | "fair" | "needs_improvement"
  focusScore: number // 1-100
}

export class AISessionSummaryService {
  private static genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null

  private static readonly FOCUS_PROMPTS = {
    excellent: [
      "You demonstrated exceptional focus during this {duration}-minute session. Your concentration was unwavering, and you made significant progress on your tasks.",
      "Outstanding work! You maintained deep focus for {duration} minutes with minimal distractions. This level of concentration is exactly what leads to breakthrough productivity.",
      "Incredible session! You were completely in the zone for {duration} minutes. This kind of sustained attention is rare and valuable.",
    ],
    good: [
      "Great focus session! You stayed concentrated for {duration} minutes and accomplished meaningful work. Keep building this momentum.",
      "Well done! Your {duration}-minute focus session shows strong discipline and commitment to your goals.",
      "Solid work! You maintained good concentration for {duration} minutes and made steady progress.",
    ],
    fair: [
      "You completed a {duration}-minute focus session with some challenges. Every session builds your focus muscle - keep practicing!",
      "Good effort on your {duration}-minute session. Focus is a skill that improves with practice, and you're on the right track.",
      "You pushed through for {duration} minutes despite some distractions. Persistence is key to developing stronger focus.",
    ],
    needs_improvement: [
      "You started a {duration}-minute session but faced some challenges. Remember, building focus takes time and practice.",
      "This {duration}-minute session was a learning experience. Each attempt strengthens your ability to concentrate.",
      "You gave it a try for {duration} minutes. Focus is like a muscle - it gets stronger with consistent training.",
    ],
  }

  private static readonly BREAK_PROMPTS = {
    short: [
      "Perfect timing for a {duration}-minute break! This mental reset will help you return to work refreshed and focused.",
      "Smart break choice! These {duration} minutes of rest will recharge your mental energy for the next focus session.",
      "Excellent self-care! Your {duration}-minute break helps prevent burnout and maintains peak performance.",
    ],
    long: [
      "Wise decision on this {duration}-minute break! Extended rest periods are crucial for sustained productivity.",
      "Great break timing! This {duration}-minute pause will help you return with renewed energy and clarity.",
      "Perfect recharge session! Your {duration} minutes of rest will pay dividends in your next focus period.",
    ],
  }

  static async generateSessionSummary(input: SessionSummaryInput): Promise<ProductivityInsight> {
    try {
      if (input.type === "FOCUS") {
        return this.generateFocusSummary(input)
      } else {
        return this.generateBreakSummary(input)
      }
    } catch (error) {
      console.error("Error generating AI summary:", error)
      return this.getFallbackSummary(input)
    }
  }

  private static async generateFocusSummary(input: SessionSummaryInput): Promise<ProductivityInsight> {
    const distractionCount = input.distractionCount || 0
    const focusScore = this.calculateFocusScore(input.duration, distractionCount)
    const mood = this.determineMood(focusScore)

    let summary: string
    let insights: string[]
    let recommendations: string[]

    if (this.genAI && process.env.GEMINI_API_KEY) {
      try {
        const aiResponse = await this.generateGeminiSummary(input, focusScore, mood)
        summary = aiResponse.summary
        insights = aiResponse.insights
        recommendations = aiResponse.recommendations
      } catch (error) {
        console.error("Gemini generation failed, using templates:", error)
        const templateResponse = this.getTemplateSummary(input, mood)
        summary = templateResponse.summary
        insights = templateResponse.insights
        recommendations = templateResponse.recommendations
      }
    } else {
      const templateResponse = this.getTemplateSummary(input, mood)
      summary = templateResponse.summary
      insights = templateResponse.insights
      recommendations = templateResponse.recommendations
    }

    return {
      summary,
      insights,
      recommendations,
      mood,
      focusScore,
    }
  }

  private static async generateBreakSummary(input: SessionSummaryInput): Promise<ProductivityInsight> {
    const isLongBreak = input.type === "LONG_BREAK"
    const prompts = isLongBreak ? this.BREAK_PROMPTS.long : this.BREAK_PROMPTS.short
    const summary = prompts[Math.floor(Math.random() * prompts.length)].replace("{duration}", input.duration.toString())

    return {
      summary,
      insights: [
        isLongBreak
          ? "Extended breaks help consolidate learning and prevent mental fatigue"
          : "Short breaks maintain alertness and prevent decision fatigue",
        "Regular breaks are essential for sustained high performance",
      ],
      recommendations: [
        isLongBreak ? "Consider light physical activity or meditation" : "Stay hydrated and avoid screens if possible",
        "Return to work when you feel mentally refreshed",
      ],
      mood: "good",
      focusScore: 85,
    }
  }

  private static async generateGeminiSummary(
    input: SessionSummaryInput,
    focusScore: number,
    mood: string,
  ): Promise<{ summary: string; insights: string[]; recommendations: string[] }> {
    if (!this.genAI) {
      throw new Error("Gemini AI not initialized")
    }

    const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const prompt = `Generate a personalized productivity summary for a focus session:
    
    Session Details:
    - Duration: ${input.duration} minutes
    - Focus Score: ${focusScore}/100
    - Mood: ${mood}
    - Distractions: ${input.distractionCount || 0}
    - In Room: ${input.roomId ? "Yes" : "No"}
    
    Please provide a JSON response with:
    {
      "summary": "A motivational 2-3 sentence summary",
      "insights": ["2-3 key insights about their focus performance"],
      "recommendations": ["2-3 actionable recommendations for improvement"]
    }
    
    Keep it encouraging, specific, and actionable. Focus on progress and growth mindset.`

    try {
      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      // Try to parse JSON response
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        return {
          summary: parsed.summary || this.getTemplateSummary(input, mood).summary,
          insights: Array.isArray(parsed.insights) ? parsed.insights : this.getTemplateSummary(input, mood).insights,
          recommendations: Array.isArray(parsed.recommendations)
            ? parsed.recommendations
            : this.getTemplateSummary(input, mood).recommendations,
        }
      }

      // Fallback to template if JSON parsing fails
      return this.getTemplateSummary(input, mood)
    } catch (error) {
      console.error("Gemini API error:", error)
      return this.getTemplateSummary(input, mood)
    }
  }

  private static getTemplateSummary(
    input: SessionSummaryInput,
    mood: string,
  ): { summary: string; insights: string[]; recommendations: string[] } {
    const prompts = this.FOCUS_PROMPTS[mood as keyof typeof this.FOCUS_PROMPTS]
    const summary = prompts[Math.floor(Math.random() * prompts.length)].replace("{duration}", input.duration.toString())

    const insights = this.getInsightsForMood(mood, input)
    const recommendations = this.getRecommendationsForMood(mood, input)

    return { summary, insights, recommendations }
  }

  private static getInsightsForMood(mood: string, input: SessionSummaryInput): string[] {
    const baseInsights = {
      excellent: [
        "You're in a state of deep work that many struggle to achieve",
        "This level of focus compounds over time into significant achievements",
        "Your concentration skills are well-developed and consistent",
      ],
      good: [
        "You're building strong focus habits that will serve you well",
        "Consistent sessions like this create momentum for bigger goals",
        "Your ability to maintain attention is above average",
      ],
      fair: [
        "You're developing your focus muscle with each session",
        "Persistence in the face of distractions builds mental resilience",
        "Every completed session strengthens your concentration ability",
      ],
      needs_improvement: [
        "Focus is a skill that improves with practice and patience",
        "Starting is often the hardest part - you've already succeeded there",
        "Each attempt teaches you something about your attention patterns",
      ],
    }

    return baseInsights[mood as keyof typeof baseInsights] || baseInsights.fair
  }

  private static getRecommendationsForMood(mood: string, input: SessionSummaryInput): string[] {
    const baseRecommendations = {
      excellent: [
        "Try extending your next session by 5-10 minutes to push your limits",
        "Consider tackling your most challenging tasks during peak focus times",
        "Share your focus techniques with others in co-working rooms",
      ],
      good: [
        "Maintain this consistency to build even stronger focus habits",
        "Try eliminating one more potential distraction for your next session",
        "Consider setting specific goals before starting your next focus period",
      ],
      fair: [
        "Start your next session with a clear intention or goal",
        "Try the 2-minute rule: commit to just 2 minutes if you feel resistance",
        "Experiment with different environments to find your optimal focus space",
      ],
      needs_improvement: [
        "Start with shorter 15-minute sessions to build confidence",
        "Identify and remove your biggest distraction source",
        "Try the Pomodoro technique with built-in breaks for sustainability",
      ],
    }

    return baseRecommendations[mood as keyof typeof baseRecommendations] || baseRecommendations.fair
  }

  private static calculateFocusScore(duration: number, distractionCount: number): number {
    const durationScore = Math.min((duration / 25) * 100, 100)
    const distractionPenalty = distractionCount * 10
    return Math.max(10, Math.round(durationScore - distractionPenalty))
  }

  private static determineMood(focusScore: number): "excellent" | "good" | "fair" | "needs_improvement" {
    if (focusScore >= 90) return "excellent"
    if (focusScore >= 70) return "good"
    if (focusScore >= 50) return "fair"
    return "needs_improvement"
  }

  private static getFallbackSummary(input: SessionSummaryInput): ProductivityInsight {
    const isBreak = input.type !== "FOCUS"

    if (isBreak) {
      return {
        summary: `Great ${input.duration}-minute break! Rest is essential for sustained productivity.`,
        insights: ["Regular breaks prevent mental fatigue", "Rest periods help consolidate learning"],
        recommendations: ["Return to work when you feel refreshed", "Stay hydrated during breaks"],
        mood: "good",
        focusScore: 85,
      }
    }

    return {
      summary: `You completed a ${input.duration}-minute focus session. Every session builds your concentration skills!`,
      insights: ["Consistency is key to developing strong focus", "Each session strengthens your attention muscle"],
      recommendations: ["Keep practicing regularly", "Try to eliminate distractions for better focus"],
      mood: "good",
      focusScore: 75,
    }
  }

  static async generateWeeklySummary(userId: string, weekData: any): Promise<string> {
    const totalMinutes = weekData.totalFocusMinutes || 0
    const totalSessions = weekData.totalSessions || 0
    const averageSession = totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0

    if (this.genAI && process.env.GEMINI_API_KEY) {
      try {
        const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
        const prompt = `Generate a weekly productivity summary:
        - Total focus time: ${totalMinutes} minutes
        - Sessions completed: ${totalSessions}
        - Average session length: ${averageSession} minutes
        
        Provide an encouraging 2-3 sentence summary with insights and motivation for next week.`

        const result = await model.generateContent(prompt)
        const response = await result.response
        return response.text()
      } catch (error) {
        console.error("Error generating weekly summary:", error)
      }
    }

    if (totalMinutes === 0) {
      return "This week is a fresh start! Every expert was once a beginner. Start with just one focus session to build momentum."
    }

    const hours = Math.round((totalMinutes / 60) * 10) / 10
    return `This week you focused for ${hours} hours across ${totalSessions} sessions! Your average session was ${averageSession} minutes. You're building strong productivity habits - keep up the excellent work!`
  }
}
