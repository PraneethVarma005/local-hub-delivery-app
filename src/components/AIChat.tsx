
import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Send, Bot, User, AlertCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface AIChatProps {
  isFloating?: boolean
}

const AIChat: React.FC<AIChatProps> = ({ isFloating = false }) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!input.trim() || loading || !user) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    const messageContent = input.trim()
    setInput('')
    setLoading(true)

    try {
      console.log('Sending message to AI chat function:', messageContent)
      
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: { message: messageContent },
        headers: {
          'Content-Type': 'application/json',
        }
      })

      console.log('AI chat response received:', { data, error })

      if (error) {
        console.error('AI chat function error:', error)
        throw new Error(error.message || 'Failed to get AI response')
      }

      if (!data?.response || typeof data.response !== 'string') {
        console.error('Invalid response format:', data)
        throw new Error('Invalid response from AI service')
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
      
      // Show success toast for successful AI responses
      if (!data.response.includes('Sorry') && !data.response.includes('unavailable')) {
        toast({
          title: 'AI Assistant',
          description: 'Response received successfully',
        })
      }
      
    } catch (error) {
      console.error('Chat error:', error)
      
      // Add error message to chat
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I\'m experiencing some technical difficulties. Please try again in a moment.',
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, errorMessage])
      
      toast({
        title: 'AI Assistant Error',
        description: 'The AI service is temporarily unavailable. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <AlertCircle className="w-12 h-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Sign In Required</h3>
        <p className="text-gray-500">Please sign in to use the AI assistant.</p>
      </div>
    )
  }

  const containerClasses = isFloating 
    ? "flex flex-col h-full" 
    : "max-w-4xl mx-auto"

  const messagesContainerClasses = isFloating
    ? "flex-1 overflow-y-auto p-4 space-y-4"
    : "h-96 overflow-y-auto p-4 space-y-4 border rounded-lg bg-gray-50 dark:bg-gray-900"

  return (
    <div className={containerClasses}>
      {!isFloating && (
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">AI Assistant</h2>
          <p className="text-gray-600 dark:text-gray-300">Ask me anything about LocalHub</p>
        </div>
      )}

      <div className={messagesContainerClasses}>
        {messages.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <Bot className="w-12 h-12 mx-auto mb-4 text-[#16A085]" />
            <p>Hello! I'm your LocalHub AI assistant.</p>
            <p className="text-sm mt-2">Ask me about orders, deliveries, shops, or anything else!</p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start space-x-2 ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {message.role === 'assistant' && (
              <div className="w-8 h-8 bg-[#16A085] rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
            )}
            
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.role === 'user'
                  ? 'bg-[#16A085] text-white'
                  : 'bg-white dark:bg-gray-700 border shadow-sm'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <span className="text-xs opacity-70 mt-1 block">
                {message.timestamp.toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            </div>

            {message.role === 'user' && (
              <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-start space-x-2">
            <div className="w-8 h-8 bg-[#16A085] rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white dark:bg-gray-700 border shadow-sm px-4 py-2 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className={`flex space-x-2 ${isFloating ? 'p-4 border-t' : 'mt-4'}`}>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything about LocalHub..."
          disabled={loading}
          className="flex-1"
          maxLength={500}
        />
        <Button 
          type="submit" 
          disabled={loading || !input.trim()}
          className="bg-[#16A085] hover:bg-[#16A085]/90"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  )
}

export default AIChat
