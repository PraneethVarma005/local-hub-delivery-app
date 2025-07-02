
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { MessageCircle, X } from 'lucide-react'
import AIChat from '@/components/AIChat'
import { useAuth } from '@/contexts/AuthContext'

const FloatingChatbot = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { user } = useAuth()

  // Only show to authenticated users
  if (!user) return null

  return (
    <>
      {/* Floating Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-full bg-[#16A085] hover:bg-[#16A085]/90 shadow-lg flex items-center justify-center"
        >
          {isOpen ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <MessageCircle className="w-6 h-6 text-white" />
          )}
        </Button>
      </div>

      {/* Chat Interface */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 h-96 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border z-50 flex flex-col">
          <div className="bg-[#16A085] text-white p-3 rounded-t-lg">
            <h3 className="font-semibold">AI Assistant</h3>
            <p className="text-xs opacity-90">Ask me anything about LocalHub</p>
          </div>
          <div className="flex-1 overflow-hidden">
            <AIChat isFloating={true} />
          </div>
        </div>
      )}
    </>
  )
}

export default FloatingChatbot
