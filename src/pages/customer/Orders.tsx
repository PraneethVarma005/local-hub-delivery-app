
import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Clock, MapPin, Package } from 'lucide-react'

interface OrderWithDetails {
  id: string
  status: string
  total_amount: number
  delivery_fee: number
  delivery_address: string
  customer_phone: string
  special_instructions: string
  created_at: string
  estimated_delivery_time: string
  shop: {
    name: string
    phone: string
  }
  order_items: Array<{
    quantity: number
    unit_price: number
    total_price: number
    product: {
      name: string
    }
  }>
}

const Orders = () => {
  const [orders, setOrders] = useState<OrderWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

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
          shop:shops(name, phone),
          order_items(
            quantity,
            unit_price,
            total_price,
            product:products(name)
          )
        `)
        .eq('customer_id', user!.id)
        .order('created_at', { ascending: false })

      if (error) throw error
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
      case 'confirmed': return 'bg-blue-500'
      case 'preparing': return 'bg-orange-500'
      case 'ready_for_pickup': return 'bg-purple-500'
      case 'picked_up': return 'bg-indigo-500'
      case 'out_for_delivery': return 'bg-cyan-500'
      case 'delivered': return 'bg-green-500'
      case 'cancelled': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F9F9] flex items-center justify-center">
        <div className="text-gray-500">Loading orders...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F7F9F9] p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-[#2C3E50] mb-8">My Orders</h1>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No orders yet</p>
            <Button onClick={() => window.location.href = '/customer/shops'}>
              Start Shopping
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-[#2C3E50]">
                        Order #{order.id.slice(0, 8)}
                      </CardTitle>
                      <p className="text-sm text-gray-600">
                        From: {order.shop.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleString()}
                      </p>
                    </div>
                    <Badge className={getStatusColor(order.status)}>
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
                        {order.order_items.map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>
                              {item.product.name} × {item.quantity}
                            </span>
                            <span>₹{item.total_price.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Delivery Address */}
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 mt-0.5 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">Delivery Address:</p>
                        <p className="text-sm text-gray-600">{order.delivery_address}</p>
                      </div>
                    </div>

                    {/* Special Instructions */}
                    {order.special_instructions && (
                      <div>
                        <p className="text-sm font-medium">Special Instructions:</p>
                        <p className="text-sm text-gray-600">{order.special_instructions}</p>
                      </div>
                    )}

                    {/* Estimated Delivery */}
                    {order.estimated_delivery_time && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium">Estimated Delivery:</p>
                          <p className="text-sm text-gray-600">
                            {new Date(order.estimated_delivery_time).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Order Total */}
                    <div className="border-t pt-3">
                      <div className="flex justify-between font-medium">
                        <span>Total Amount:</span>
                        <span>₹{order.total_amount.toFixed(2)}</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        (Including delivery fee: ₹{order.delivery_fee.toFixed(2)})
                      </p>
                    </div>

                    {/* Contact Info */}
                    <div className="text-xs text-gray-500">
                      Contact: {order.customer_phone} | Shop: {order.shop.phone}
                    </div>
                  </div>
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
