"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MessageCircle, Sparkles } from "lucide-react"
import { FocusChatbot } from "@/components/focus-chatbot"
import { useAppStore } from "@/lib/store"

interface FocusChatbotTriggerProps {
  userId: string
}

export function FocusChatbotTrigger({ userId }: FocusChatbotTriggerProps) {
  const [showChatbot, setShowChatbot] = useState(false)
  const { session } = useAppStore()

  // Show different states based on session status
  const getButtonVariant = () => {
    if (session.status === "ACTIVE") {
      return "outline"
    }
    return "default"
  }

  const getButtonText = () => {
    if (session.status === "ACTIVE") {
      return "Need Focus Help?"
    }
    return "Focus Assistant"
  }

  if (showChatbot) {
    return <FocusChatbot userId={userId} mode="floating" />
  }

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <Button
        onClick={() => setShowChatbot(true)}
        variant={getButtonVariant()}
        size="lg"
        className="rounded-full shadow-lg hover:shadow-xl transition-all duration-200 group"
      >
        <MessageCircle className="h-5 w-5 mr-2" />
        <span className="hidden sm:inline">{getButtonText()}</span>
        <Sparkles className="h-4 w-4 ml-2 opacity-60 group-hover:opacity-100 transition-opacity" />
      </Button>
    </div>
  )
}
