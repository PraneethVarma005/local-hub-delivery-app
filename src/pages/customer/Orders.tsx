
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin, Clock, Star, MessageCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import ChatSystem from '@/components/ChatSystem'
import LiveDeliveryTracker from '@/components/LiveDeliveryTracker'
import RatingSystem from '@/components/RatingSystem'

const Orders = () => {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [showChat, setShowChat] = useState(false)
  const [showTracking, setShowTracking] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      loadOrders()
    }
  }, [user])

  const loadOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          shop:user_profiles!shop_id(shop_name, phone),
          delivery_partner:user_profiles!delivery_partner_id(full_name, phone)
        `)
        .eq('customer_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setOrders(data || [])
    } catch (error) {
      console.error('Error loading orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500'
      case 'accepted': return 'bg-blue-500'
      case 'preparing': return 'bg-orange-500'
      case 'ready': return 'bg-purple-500'
      case 'picked_up': return 'bg-indigo-500'
      case 'on_the_way': return 'bg-cyan-500'
      case 'delivered': return 'bg-green-500'
      case 'cancelled': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  const canTrackOrder = (status: string) => {
    return ['picked_up', 'on_the_way'].includes(status)
  }

  const canChatForOrder = (status: string) => {
    return !['delivered', 'cancelled'].includes(status)
  }

  const canRateOrder = (status: string) => {
    return status === 'delivered'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F9F9] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#16A085]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F7F9F9] p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#2C3E50] mb-2">My Orders</h1>
          <p className="text-gray-600">Track your order history and current deliveries</p>
        </div>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-500 text-lg">No orders found</p>
              <p className="text-gray-400">Start shopping to see your orders here</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <Card key={order.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        Order #{order.id.slice(0, 8)}
                      </CardTitle>
                      <p className="text-gray-600">
                        From {order.shop?.shop_name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleString()}
                      </p>
                    </div>
                    <Badge className={`${getStatusColor(order.status)} text-white`}>
                      {getStatusText(order.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Order Items */}
                    <div>
                      <h4 className="font-medium mb-2">Items:</h4>
                      <div className="space-y-1">
                        {order.items.map((item: any, index: number) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>{item.name} × {item.quantity}</span>
                            <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Delivery Info */}
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {order.delivery_address}
                      </div>
                      {order.estimated_delivery_time && (
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          ETA: {new Date(order.estimated_delivery_time).toLocaleTimeString()}
                        </div>
                      )}
                    </div>

                    {/* Total */}
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="font-semibold">Total: ₹{order.total_amount}</span>
                      
                      <div className="flex gap-2">
                        {canTrackOrder(order.status) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedOrder(order)
                              setShowTracking(true)
                            }}
                          >
                            Track Order
                          </Button>
                        )}
                        
                        {canChatForOrder(order.status) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedOrder(order)
                              setShowChat(true)
                            }}
                          >
                            <MessageCircle className="h-4 w-4 mr-1" />
                            Chat
                          </Button>
                        )}

                        {canRateOrder(order.status) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <Star className="h-4 w-4 mr-1" />
                            Rate
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Chat Modal */}
        {showChat && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg w-full max-w-md">
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="font-semibold">Order Chat</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowChat(false)}>
                  ×
                </Button>
              </div>
              <div className="p-4">
                <ChatSystem
                  orderId={selectedOrder.id}
                  shopId={selectedOrder.shop_id}
                  deliveryPartnerId={selectedOrder.delivery_partner_id}
                />
              </div>
            </div>
          </div>
        )}

        {/* Tracking Modal */}
        {showTracking && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg w-full max-w-2xl">
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="font-semibold">Live Tracking</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowTracking(false)}>
                  ×
                </Button>
              </div>
              <div className="p-4">
                <LiveDeliveryTracker orderId={selectedOrder.id} />
              </div>
            </div>
          </div>
        )}

        {/* Rating Modal */}
        {selectedOrder && !showChat && !showTracking && canRateOrder(selectedOrder.status) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg w-full max-w-md">
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="font-semibold">Rate Your Experience</h3>
                <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(null)}>
                  ×
                </Button>
              </div>
              <div className="p-4">
                <RatingSystem shopId={selectedOrder.shop_id} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Orders
