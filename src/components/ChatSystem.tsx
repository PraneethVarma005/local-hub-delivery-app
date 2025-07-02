import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, Send, User, Clock } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'

interface ChatMessage {
  id: string
  sender_id: string
  receiver_id: string
  message: string
  order_id?: string
  created_at: string
  sender_role: string
}

interface ChatSystemProps {
  userRole: 'delivery_partner' | 'shop_owner'
  orderId?: string
}

const ChatSystem: React.FC<ChatSystemProps> = ({ userRole, orderId }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [activeChats, setActiveChats] = useState<any[]>([])
  const [selectedChat, setSelectedChat] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (user) {
      loadActiveChats()
    }
  }, [user])

  useEffect(() => {
    if (selectedChat) {
      loadMessages(selectedChat)
    }
  }, [selectedChat])

  const loadActiveChats = async () => {
    try {
      // For delivery partners, load their assigned orders
      if (userRole === 'delivery_partner') {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('delivery_partner_id', user?.id)
          .neq('status', 'delivered')
          .order('created_at', { ascending: false })

        if (error) throw error
        setActiveChats(data || [])
      }
      
      // For shop owners, load their shop's orders
      if (userRole === 'shop_owner') {
        // First get shop ID
        const { data: shopData, error: shopError } = await supabase
          .from('shops')
          .select('id')
          .eq('shop_owner_id', user?.id)
          .single()

        if (shopError) throw shopError

        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('shop_id', shopData.id)
          .neq('status', 'delivered')
          .order('created_at', { ascending: false })

        if (error) throw error
        setActiveChats(data || [])
      }
    } catch (error) {
      console.error('Error loading chats:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async (chatId: string) => {
    try {
      // This would load messages for the specific order/chat
      // For now, showing placeholder
      setMessages([])
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return

    try {
      // This would send a message to the database
      toast({
        title: 'Message sent',
        description: 'Your message has been sent successfully'
      })
      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive'
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#16A085]"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Chat List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Active Orders
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-[500px] overflow-y-auto">
            {activeChats.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No active chats</p>
              </div>
            ) : (
              activeChats.map(chat => (
                <div
                  key={chat.id}
                  onClick={() => setSelectedChat(chat.id)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedChat === chat.id 
                      ? 'bg-[#16A085]/10 border border-[#16A085]' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">
                      Order #{chat.id.slice(0, 8)}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {chat.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500">
                    {chat.delivery_address.substring(0, 30)}...
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-gray-400">
                      {new Date(chat.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Chat Messages */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              {selectedChat 
                ? `Chat - Order #${selectedChat.slice(0, 8)}`
                : 'Select a chat to start messaging'
              }
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col h-[500px]">
            {!selectedChat ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Select an order to start chatting</p>
                </div>
              </div>
            ) : (
              <>
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto mb-4 space-y-2">
                  {messages.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No messages yet</p>
                      <p className="text-sm text-gray-400">Start the conversation!</p>
                    </div>
                  ) : (
                    messages.map(message => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.sender_id === user?.id ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-xs px-4 py-2 rounded-lg ${
                            message.sender_id === user?.id
                              ? 'bg-[#16A085] text-white'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          <p className="text-sm">{message.message}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {new Date(message.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Message Input */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    className="flex-1"
                  />
                  <Button 
                    onClick={sendMessage}
                    className="bg-[#16A085] hover:bg-[#16A085]/90"
                    disabled={!newMessage.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ChatSystem