
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock, MapPin, Package, Eye } from 'lucide-react'
import LiveTracker from '@/components/LiveTracker'

interface Order {
  id: string
  shopName: string
  items: string[]
  total: number
  status: 'placed' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered'
  orderTime: string
  deliveryTime?: string
  customerLocation: { lat: number; lng: number }
  shopLocation: { lat: number; lng: number }
}

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showTracker, setShowTracker] = useState(false)

  useEffect(() => {
    // Mock data
    const mockOrders: Order[] = [
      {
        id: 'ORD-001',
        shopName: 'Fresh Mart',
        items: ['Fresh Apples', 'Basmati Rice'],
        total: 925,
        status: 'out_for_delivery',
        orderTime: '2:30 PM',
        customerLocation: { lat: 28.6139, lng: 77.2090 },
        shopLocation: { lat: 28.6100, lng: 77.2050 }
      },
      {
        id: 'ORD-002',
        shopName: 'Spice Garden',
        items: ['Chicken Curry', 'Naan'],
        total: 450,
        status: 'preparing',
        orderTime: '1:15 PM',
        customerLocation: { lat: 28.6139, lng: 77.2090 },
        shopLocation: { lat: 28.6120, lng: 77.2070 }
      }
    ]
    setOrders(mockOrders)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'placed': return 'bg-yellow-500'
      case 'confirmed': return 'bg-blue-500'
      case 'preparing': return 'bg-orange-500'
      case 'out_for_delivery': return 'bg-green-500'
      case 'delivered': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'placed': return 'Order Placed'
      case 'confirmed': return 'Confirmed'
      case 'preparing': return 'Preparing'
      case 'out_for_delivery': return 'Out for Delivery'
      case 'delivered': return 'Delivered'
      default: return 'Unknown'
    }
  }

  const handleTrackOrder = (order: Order) => {
    setSelectedOrder(order)
    setShowTracker(true)
  }

  if (showTracker && selectedOrder) {
    return (
      <div className="min-h-screen bg-[#F7F9F9] p-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 flex items-center gap-4">
            <Button 
              onClick={() => setShowTracker(false)}
              variant="outline"
            >
              ← Back to Orders
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-[#2C3E50]">Track Order</h1>
              <p className="text-gray-600">Order #{selectedOrder.id}</p>
            </div>
          </div>
          
          <LiveTracker 
            orderId={selectedOrder.id}
            customerLocation={selectedOrder.customerLocation}
            shopLocation={selectedOrder.shopLocation}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F7F9F9] p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#2C3E50] mb-2">My Orders</h1>
          <p className="text-gray-600">Track your orders and view order history</p>
        </div>

        <div className="space-y-4">
          {orders.map(order => (
            <Card key={order.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">Order #{order.id}</h3>
                    <p className="text-gray-600">{order.shopName} • {order.orderTime}</p>
                  </div>
                  <Badge className={`${getStatusColor(order.status)} text-white`}>
                    {getStatusText(order.status)}
                  </Badge>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Items:</p>
                  <ul className="list-disc list-inside text-sm">
                    {order.items.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-lg">₹{order.total}</span>
                  <div className="flex gap-2">
                    {(order.status === 'out_for_delivery' || order.status === 'confirmed' || order.status === 'preparing') && (
                      <Button 
                        onClick={() => handleTrackOrder(order)}
                        className="bg-[#16A085] hover:bg-[#16A085]/90"
                        size="sm"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Track Order
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {orders.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No orders yet</p>
            <p className="text-gray-400">Start shopping to see your orders here</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Orders
