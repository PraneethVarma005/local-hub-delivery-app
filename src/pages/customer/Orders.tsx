
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, MapPin, Package } from 'lucide-react'

// Mock orders data
const mockOrders = [
  {
    id: 'ord_001',
    status: 'delivered',
    total_amount: 925,
    delivery_fee: 25,
    delivery_address: '123 Main Street, Delhi',
    created_at: '2024-01-15T10:30:00Z',
    estimated_delivery_time: '2024-01-15T11:30:00Z',
    shop: {
      name: 'Fresh Mart Grocery',
      phone: '+91 9876543210'
    },
    order_items: [
      {
        quantity: 2,
        unit_price: 150,
        total_price: 300,
        product: { name: 'Fresh Apples' }
      },
      {
        quantity: 1,
        unit_price: 600,
        total_price: 600,
        product: { name: 'Basmati Rice' }
      }
    ]
  },
  {
    id: 'ord_002',
    status: 'out_for_delivery',
    total_amount: 485,
    delivery_fee: 30,
    delivery_address: '456 Park Avenue, Delhi',
    created_at: '2024-01-16T14:15:00Z',
    estimated_delivery_time: '2024-01-16T15:45:00Z',
    shop: {
      name: 'Spice Kitchen',
      phone: '+91 9876543211'
    },
    order_items: [
      {
        quantity: 2,
        unit_price: 225,
        total_price: 450,
        product: { name: 'Chicken Biryani' }
      }
    ]
  }
]

const Orders = () => {
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

  return (
    <div className="min-h-screen bg-[#F7F9F9] p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-[#2C3E50] mb-8">My Orders</h1>

        {mockOrders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No orders yet</p>
          </div>
        ) : (
          <div className="space-y-6">
            {mockOrders.map((order) => (
              <Card key={order.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-[#2C3E50]">
                        Order #{order.id}
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
                      Shop Contact: {order.shop.phone}
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
