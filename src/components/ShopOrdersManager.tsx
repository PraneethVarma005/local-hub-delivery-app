import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Package, MapPin, Clock, User, Phone } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'

interface Order {
  id: string
  customer_id: string
  shop_id: string
  delivery_partner_id?: string
  items: any[]
  total_amount: number
  status: string
  delivery_address: string
  pickup_address: string
  estimated_delivery_time?: string
  created_at: string
}

const ShopOrdersManager = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [shopId, setShopId] = useState<string | null>(null)
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (user) {
      loadShopAndOrders()
    }
  }, [user])

  const loadShopAndOrders = async () => {
    try {
      // First get the shop ID for the current user
      const { data: shopData, error: shopError } = await supabase
        .from('shops')
        .select('id')
        .eq('shop_owner_id', user?.id)
        .single()

      if (shopError) {
        console.error('Error loading shop:', shopError)
        setLoading(false)
        return
      }

      setShopId(shopData.id)

      // Then load orders for this shop
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('shop_id', shopData.id)
        .order('created_at', { ascending: false })

      if (ordersError) throw ordersError
      setOrders((ordersData || []).map(order => ({
        ...order,
        items: Array.isArray(order.items) ? order.items : []
      })))
    } catch (error) {
      console.error('Error loading orders:', error)
      toast({
        title: 'Error',
        description: 'Failed to load orders',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)

      if (error) throw error

      toast({
        title: 'Success',
        description: `Order status updated to ${newStatus.replace('_', ' ')}`
      })
      
      loadShopAndOrders()
    } catch (error) {
      console.error('Error updating order:', error)
      toast({
        title: 'Error',
        description: 'Failed to update order status',
        variant: 'destructive'
      })
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
      default: return 'bg-gray-500'
    }
  }

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case 'pending': return 'preparing'
      case 'accepted': return 'preparing'
      case 'preparing': return 'ready'
      default: return null
    }
  }

  const canUpdateStatus = (status: string) => {
    return ['pending', 'accepted', 'preparing'].includes(status)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#16A085]"></div>
      </div>
    )
  }

  if (!shopId) {
    return (
      <div className="text-center py-8">
        <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">No shop found</p>
        <p className="text-sm text-gray-400">Please set up your shop first</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Order Management</h3>
        <Badge variant="outline">
          {orders.filter(o => o.status !== 'delivered').length} Active Orders
        </Badge>
      </div>

      <div className="grid gap-4">
        {orders.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No orders yet</p>
              <p className="text-sm text-gray-400">Orders will appear here when customers place them</p>
            </CardContent>
          </Card>
        ) : (
          orders.map(order => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Order #{order.id.slice(0, 8)}</CardTitle>
                  <Badge className={`${getStatusColor(order.status)} text-white`}>
                    {order.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-red-500" />
                      <span className="font-medium">Delivery Address</span>
                    </div>
                    <p className="text-sm text-gray-600">{order.delivery_address}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">Order Time</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {new Date(order.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Order Items:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {order.items.map((item: any, index: number) => (
                      <li key={index} className="flex justify-between">
                        <span>{item.quantity}x {item.name}</span>
                        <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex justify-between items-center mt-3 pt-2 border-t">
                    <span className="font-semibold">Total: ₹{order.total_amount.toFixed(2)}</span>
                    
                    <div className="flex gap-2">
                      {canUpdateStatus(order.status) && getNextStatus(order.status) && (
                        <Button
                          onClick={() => updateOrderStatus(order.id, getNextStatus(order.status)!)}
                          className="bg-[#16A085] hover:bg-[#16A085]/90"
                          size="sm"
                        >
                          Mark as {getNextStatus(order.status)?.replace('_', ' ')}
                        </Button>
                      )}
                      
                      {order.status === 'ready' && (
                        <Badge className="bg-purple-500 text-white">
                          Ready for Pickup
                        </Badge>
                      )}
                      
                      {order.status === 'delivered' && (
                        <Badge className="bg-green-500 text-white">
                          Completed
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

export default ShopOrdersManager