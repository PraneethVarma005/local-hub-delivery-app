
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import MapboxMap from '@/components/MapboxMap'
import { Navigation, Package, Clock, CheckCircle, MapPin, Phone } from 'lucide-react'

interface DeliveryOrder {
  id: string
  customerName: string
  customerPhone: string
  shopName: string
  items: string[]
  pickupAddress: string
  deliveryAddress: string
  total: number
  status: 'available' | 'accepted' | 'picked_up' | 'delivered'
  distance: string
  estimatedTime: string
  pickupLat: number
  pickupLng: number
  deliveryLat: number
  deliveryLng: number
}

const DeliveryDashboard = () => {
  const { user } = useAuth()
  const [orders, setOrders] = useState<DeliveryOrder[]>([])
  const [activeOrder, setActiveOrder] = useState<DeliveryOrder | null>(null)
  const [isOnline, setIsOnline] = useState(false)

  // Mock data
  useEffect(() => {
    const mockOrders: DeliveryOrder[] = [
      {
        id: '1',
        customerName: 'John Doe',
        customerPhone: '+1234567890',
        shopName: 'Pizza Corner',
        items: ['Margherita Pizza', 'Caesar Salad'],
        pickupAddress: '123 Restaurant St',
        deliveryAddress: '456 Customer Ave',
        total: 21.98,
        status: 'available',
        distance: '2.5 km',
        estimatedTime: '15 min',
        pickupLat: 28.6139,
        pickupLng: 77.2090,
        deliveryLat: 28.6200,
        deliveryLng: 77.2150
      },
      {
        id: '2',
        customerName: 'Jane Smith',
        shopName: 'Fresh Mart',
        customerPhone: '+1234567891',
        items: ['Groceries'],
        pickupAddress: '789 Market St',
        deliveryAddress: '321 Home St',
        total: 45.50,
        status: 'available',
        distance: '1.8 km',
        estimatedTime: '12 min',
        pickupLat: 28.6100,
        pickupLng: 77.2050,
        deliveryLat: 28.6180,
        deliveryLng: 77.2100
      }
    ]

    setOrders(mockOrders)
  }, [])

  const acceptOrder = (orderId: string) => {
    const order = orders.find(o => o.id === orderId)
    if (order) {
      setActiveOrder({...order, status: 'accepted'})
      setOrders(orders.filter(o => o.id !== orderId))
    }
  }

  const updateOrderStatus = (status: DeliveryOrder['status']) => {
    if (activeOrder) {
      setActiveOrder({...activeOrder, status})
    }
  }

  const completeDelivery = () => {
    setActiveOrder(null)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500'
      case 'accepted': return 'bg-blue-500'
      case 'picked_up': return 'bg-yellow-500'
      case 'delivered': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <Package className="h-4 w-4" />
      case 'accepted': return <Clock className="h-4 w-4" />
      case 'picked_up': return <Navigation className="h-4 w-4" />
      case 'delivered': return <CheckCircle className="h-4 w-4" />
      default: return <Package className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F9F9] p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#2C3E50] mb-2">
                Delivery Dashboard
              </h1>
              <p className="text-gray-600">Manage your deliveries</p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                onClick={() => setIsOnline(!isOnline)}
                className={`${isOnline ? 'bg-red-500 hover:bg-red-600' : 'bg-[#16A085] hover:bg-[#16A085]/90'}`}
              >
                {isOnline ? 'Go Offline' : 'Go Online'}
              </Button>
              <Badge className={`${isOnline ? 'bg-green-500' : 'bg-gray-500'} text-white`}>
                {isOnline ? 'Online' : 'Offline'}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Orders List */}
          <div className="space-y-4">
            {activeOrder ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Navigation className="h-5 w-5" />
                    Active Delivery
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">Order #{activeOrder.id}</h3>
                    <Badge className={`${getStatusColor(activeOrder.status)} text-white`}>
                      {getStatusIcon(activeOrder.status)}
                      <span className="ml-1 capitalize">{activeOrder.status.replace('_', ' ')}</span>
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Package className="h-4 w-4 text-[#16A085]" />
                        <span className="font-medium">Pickup</span>
                      </div>
                      <p className="text-sm">{activeOrder.shopName}</p>
                      <p className="text-sm text-gray-600">{activeOrder.pickupAddress}</p>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="h-4 w-4 text-[#16A085]" />
                        <span className="font-medium">Delivery</span>
                      </div>
                      <p className="text-sm">{activeOrder.customerName}</p>
                      <p className="text-sm text-gray-600">{activeOrder.deliveryAddress}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{activeOrder.customerPhone}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span>Distance: {activeOrder.distance}</span>
                    <span>Est. Time: {activeOrder.estimatedTime}</span>
                    <span className="font-semibold">${activeOrder.total.toFixed(2)}</span>
                  </div>

                  <div className="space-y-2">
                    {activeOrder.status === 'accepted' && (
                      <Button 
                        onClick={() => updateOrderStatus('picked_up')}
                        className="w-full bg-[#16A085] hover:bg-[#16A085]/90"
                      >
                        Mark as Picked Up
                      </Button>
                    )}
                    {activeOrder.status === 'picked_up' && (
                      <Button 
                        onClick={() => updateOrderStatus('delivered')}
                        className="w-full bg-[#16A085] hover:bg-[#16A085]/90"
                      >
                        Mark as Delivered
                      </Button>
                    )}
                    {activeOrder.status === 'delivered' && (
                      <Button 
                        onClick={completeDelivery}
                        className="w-full bg-green-500 hover:bg-green-600"
                      >
                        Complete Delivery
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                <h2 className="text-xl font-semibold text-[#2C3E50]">Available Orders</h2>
                {isOnline ? (
                  orders.map(order => (
                    <Card key={order.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold text-lg">Order #{order.id}</h3>
                          <Badge className={`${getStatusColor(order.status)} text-white`}>
                            {getStatusIcon(order.status)}
                            <span className="ml-1 capitalize">{order.status}</span>
                          </Badge>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-[#16A085]" />
                            <span className="text-sm">{order.shopName} → {order.customerName}</span>
                          </div>
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>{order.distance}</span>
                            <span>{order.estimatedTime}</span>
                            <span className="font-semibold text-[#2C3E50]">${order.total.toFixed(2)}</span>
                          </div>
                        </div>
                        
                        <Button 
                          onClick={() => acceptOrder(order.id)}
                          className="w-full bg-[#16A085] hover:bg-[#16A085]/90"
                        >
                          Accept Order
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <p className="text-gray-500">Go online to see available orders</p>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>

          {/* Map */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Delivery Map</CardTitle>
              </CardHeader>
              <CardContent>
                <MapboxMap
                  showShops={true}
                  shops={activeOrder ? [
                    {
                      id: 'pickup',
                      name: `Pickup: ${activeOrder.shopName}`,
                      lat: activeOrder.pickupLat,
                      lng: activeOrder.pickupLng,
                      category: 'pickup'
                    },
                    {
                      id: 'delivery',
                      name: `Delivery: ${activeOrder.customerName}`,
                      lat: activeOrder.deliveryLat,
                      lng: activeOrder.deliveryLng,
                      category: 'delivery'
                    }
                  ] : orders.map(order => ({
                    id: order.id,
                    name: order.shopName,
                    lat: order.pickupLat,
                    lng: order.pickupLng,
                    category: 'shop'
                  }))}
                  height="500px"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DeliveryDashboard
