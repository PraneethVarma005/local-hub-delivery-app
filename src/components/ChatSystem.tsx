
import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Send, MessageCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

interface ChatSystemProps {
  orderId: string
  shopId?: string
  deliveryPartnerId?: string
}

const ChatSystem: React.FC<ChatSystemProps> = ({ orderId, shopId, deliveryPartnerId }) => {
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [chatRoom, setChatRoom] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()

  useEffect(() => {
    initializeChatRoom()
  }, [orderId])

  useEffect(() => {
    if (chatRoom) {
      loadMessages()
      subscribeToMessages()
    }
  }, [chatRoom])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const initializeChatRoom = async () => {
    try {
      // Check if chat room exists
      let { data: existingRoom } = await supabase
        .from('chat_rooms')
        .select('*')
        .eq('order_id', orderId)
        .single()

      if (!existingRoom) {
        // Create new chat room
        const { data: newRoom, error } = await supabase
          .from('chat_rooms')
          .insert({
            customer_id: user?.id,
            shop_id: shopId,
            delivery_partner_id: deliveryPartnerId,
            order_id: orderId
          })
          .select()
          .single()

        if (error) throw error
        existingRoom = newRoom
      }

      setChatRoom(existingRoom)
      setLoading(false)
    } catch (error) {
      console.error('Error initializing chat room:', error)
      setLoading(false)
    }
  }

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          *,
          sender:user_profiles!sender_id(full_name)
        `)
        .eq('room_id', chatRoom.id)
        .order('created_at', { ascending: true })

      if (error) throw error
      setMessages(data || [])
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  const subscribeToMessages = () => {
    const channel = supabase
      .channel('chat-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${chatRoom.id}`
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return

    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          room_id: chatRoom.id,
          sender_id: user.id,
          message: newMessage.trim()
        })

      if (error) throw error
      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="text-center">Loading chat...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-96 flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Order Chat
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-4">
        <div className="flex-1 overflow-y-auto space-y-2 mb-4">
          {messages.map(message => (
            <div
              key={message.id}
              className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs px-3 py-2 rounded-lg ${
                  message.sender_id === user?.id
                    ? 'bg-[#16A085] text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <div className="text-sm">{message.message}</div>
                <div className="text-xs opacity-70 mt-1">
                  {new Date(message.created_at).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          />
          <Button onClick={sendMessage} size="sm">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default ChatSystem
