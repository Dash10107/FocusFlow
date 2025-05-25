"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Send, X, Minimize2, Maximize2, Brain, User, Bot, Sparkles } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { LoadingSpinner } from "@/components/loading-spinner"
import { useAppStore } from "@/lib/store"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  isTyping?: boolean
}

interface FocusChatbotProps {
  userId: string
}

export function FocusChatbot({ userId }: FocusChatbotProps) {
  const { ui, toggleChatbot } = useAppStore()
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Hotkey support (C to toggle)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "c" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        toggleChatbot()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [toggleChatbot])

  // Welcome message
  useEffect(() => {
    if (ui.isChatbotOpen && messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content:
            "Hi! I'm your Focus Assistant. I'm here to help you stay on track, understand productivity concepts, or provide motivation when you need it. How can I support your focus journey today?",
          timestamp: new Date(),
        },
      ])
    }
  }, [ui.isChatbotOpen, messages.length])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Focus input when opened
  useEffect(() => {
    if (ui.isChatbotOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [ui.isChatbotOpen, isMinimized])

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    setIsTyping(true)

    // Add typing indicator
    const typingMessage: Message = {
      id: `typing-${Date.now()}`,
      role: "assistant",
      content: "",
      timestamp: new Date(),
      isTyping: true,
    }
    setMessages((prev) => [...prev, typingMessage])

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          userId,
          conversationHistory: messages.slice(-6),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response")
      }

      const data = await response.json()

      // Remove typing indicator and add real response
      setMessages((prev) => {
        const withoutTyping = prev.filter((msg) => !msg.isTyping)
        return [
          ...withoutTyping,
          {
            id: `assistant-${Date.now()}`,
            role: "assistant",
            content: data.response,
            timestamp: new Date(),
          },
        ]
      })
    } catch (error) {
      console.error("Error sending message:", error)

      // Remove typing indicator and add error message
      setMessages((prev) => {
        const withoutTyping = prev.filter((msg) => !msg.isTyping)
        return [
          ...withoutTyping,
          {
            id: `error-${Date.now()}`,
            role: "assistant",
            content: "I'm having trouble thinking right now. Try again in a moment! 🤔",
            timestamp: new Date(),
          },
        ]
      })

      toast({
        title: "Connection Issue",
        description: "Unable to reach the Focus Assistant. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const clearChat = () => {
    setMessages([
      {
        id: "welcome-new",
        role: "assistant",
        content: "Fresh start! I'm here to help you refocus. What's on your mind?",
        timestamp: new Date(),
      },
    ])
  }

  const quickPrompts = [
    "Help me regain focus",
    "What is deep work?",
    "I'm feeling distracted",
    "Motivate me to continue",
    "Explain the Pomodoro technique",
  ]

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt)
    setTimeout(() => handleSendMessage(), 100)
  }

  if (!ui.isChatbotOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={toggleChatbot}
          size="lg"
          className={cn(
            "rounded-full h-14 w-14 shadow-lg hover:shadow-xl transition-all duration-300",
            "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700",
            "transform hover:scale-110 active:scale-95",
          )}
        >
          <MessageCircle className="h-6 w-6" />
          <span className="sr-only">Open Focus Assistant (Ctrl+C)</span>
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card
        className={cn(
          "shadow-2xl transition-all duration-300 ease-out",
          "bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-indigo-200 dark:border-indigo-800",
          isMinimized ? "w-80 h-12" : "w-96 h-[32rem]",
          "animate-in slide-in-from-bottom-4 fade-in-0",
        )}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-t-lg">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Brain className="h-4 w-4 text-indigo-600" />
            Focus Assistant
            {isTyping && <Sparkles className="h-3 w-3 animate-pulse text-purple-500" />}
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="h-6 w-6 p-0 hover:bg-indigo-100 dark:hover:bg-indigo-900/50"
            >
              {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleChatbot}
              className="h-6 w-6 p-0 hover:bg-red-100 dark:hover:bg-red-900/50"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0 flex flex-col h-[28rem]">
            <ChatContent
              messages={messages}
              input={input}
              setInput={setInput}
              isLoading={isLoading}
              onSendMessage={handleSendMessage}
              onKeyPress={handleKeyPress}
              onClearChat={clearChat}
              onQuickPrompt={handleQuickPrompt}
              quickPrompts={quickPrompts}
              messagesEndRef={messagesEndRef}
              inputRef={inputRef}
            />
          </CardContent>
        )}
      </Card>
    </div>
  )
}

interface ChatContentProps {
  messages: Message[]
  input: string
  setInput: (value: string) => void
  isLoading: boolean
  onSendMessage: () => void
  onKeyPress: (e: React.KeyboardEvent) => void
  onClearChat: () => void
  onQuickPrompt: (prompt: string) => void
  quickPrompts: string[]
  messagesEndRef: React.RefObject<HTMLDivElement>
  inputRef: React.RefObject<HTMLInputElement>
}

function ChatContent({
  messages,
  input,
  setInput,
  isLoading,
  onSendMessage,
  onKeyPress,
  onQuickPrompt,
  quickPrompts,
  messagesEndRef,
  inputRef,
}: ChatContentProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn("flex gap-3", message.role === "user" ? "justify-end" : "justify-start")}
            >
              {message.role === "assistant" && (
                <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                  <Bot className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                </div>
              )}

              <div
                className={cn(
                  "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                  message.role === "user"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100",
                )}
              >
                {message.isTyping ? (
                  <div className="flex items-center gap-1">
                    <div className="flex space-x-1">
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      />
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      />
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap">{message.content}</div>
                )}
              </div>

              {message.role === "user" && (
                <div className="flex-shrink-0 w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Quick Prompts */}
      {messages.length <= 1 && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Quick prompts:</p>
          <div className="flex flex-wrap gap-1">
            {quickPrompts.map((prompt) => (
              <Badge
                key={prompt}
                variant="outline"
                className="cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-xs"
                onClick={() => onQuickPrompt(prompt)}
              >
                {prompt}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={onKeyPress}
            placeholder="Ask me anything about focus..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button onClick={onSendMessage} disabled={!input.trim() || isLoading} size="sm" className="px-3">
            {isLoading ? <LoadingSpinner size="sm" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
