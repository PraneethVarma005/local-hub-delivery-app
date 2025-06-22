
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Package, Clock, MapPin, Eye } from 'lucide-react'
import LiveDeliveryTracker from '@/components/LiveDeliveryTracker'

interface Order {
  id: string
  shop_id: string
  delivery_partner_id?: string
  items: any[]
  total_amount: number
  status: string
  delivery_address: string
  pickup_address: string
  estimated_delivery_time?: string
  created_at: string
  shop_profile?: {
    shop_name: string
  }
}

const Orders = () => {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      fetchOrders()
    }
  }, [user])

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          shop_profile:user_profiles!orders_shop_id_fkey(shop_name)
        `)
        .eq('customer_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching orders:', error)
        return
      }

      setOrders(data || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
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
      case 'on_the_way': return 'bg-green-500'
      case 'delivered': return 'bg-gray-500'
      case 'cancelled': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
      case 'accepted':
      case 'preparing':
        return <Clock className="h-4 w-4" />
      case 'ready':
      case 'picked_up':
      case 'on_the_way':
        return <Package className="h-4 w-4" />
      case 'delivered':
        return <MapPin className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F9F9] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#16A085]"></div>
      </div>
    )
  }

  if (selectedOrderId) {
    return (
      <div className="min-h-screen bg-[#F7F9F9] p-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Button
              onClick={() => setSelectedOrderId(null)}
              variant="outline"
              className="mb-4"
            >
              ← Back to Orders
            </Button>
            <h1 className="text-3xl font-bold text-[#2C3E50]">Live Order Tracking</h1>
          </div>
          <LiveDeliveryTracker orderId={selectedOrderId} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F7F9F9] p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#2C3E50] mb-2">
            My Orders
          </h1>
          <p className="text-gray-600">Track your orders and delivery status</p>
        </div>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">No orders yet</h3>
              <p className="text-gray-500">Start shopping to see your orders here</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">Order #{order.id.slice(0, 8)}</h3>
                      <p className="text-gray-600 text-sm">
                        {order.shop_profile?.shop_name || 'Unknown Shop'}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {new Date(order.created_at).toLocaleDateString()} at{' '}
                        {new Date(order.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className={`${getStatusColor(order.status)} text-white mb-2`}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1 capitalize">
                          {order.status.replace('_', ' ')}
                        </span>
                      </Badge>
                      <p className="text-lg font-bold text-[#2C3E50]">
                        ${order.total_amount.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-[#16A085] mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Delivery Address:</p>
                        <p className="text-sm text-gray-600">{order.delivery_address}</p>
                      </div>
                    </div>

                    {order.estimated_delivery_time && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-500" />
                        <p className="text-sm">
                          Estimated delivery: {new Date(order.estimated_delivery_time).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2 text-sm">Order Items:</h4>
                    <div className="space-y-1">
                      {order.items.slice(0, 3).map((item: any, index: number) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{item.quantity}x {item.name}</span>
                          <span>${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <p className="text-xs text-gray-500">
                          +{order.items.length - 3} more items
                        </p>
                      )}
                    </div>
                  </div>

                  {(order.status === 'picked_up' || order.status === 'on_the_way') && (
                    <div className="border-t pt-4 mt-4">
                      <Button
                        onClick={() => setSelectedOrderId(order.id)}
                        className="w-full bg-[#16A085] hover:bg-[#16A085]/90"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Track Live Delivery
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Orders
