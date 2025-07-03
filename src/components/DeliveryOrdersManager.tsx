import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Package, MapPin, Clock, User, Phone, CheckCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import LeafletMap from './LeafletMap'

interface Order {
  id: string
  customer_id: string
  shop_id: string
  delivery_partner_id?: string
  items: any[]
  total_amount: number
  status: string
  delivery_address: string
  delivery_lat?: number
  delivery_lng?: number
  pickup_address: string
  pickup_lat?: number
  pickup_lng?: number
  estimated_delivery_time?: string
  created_at: string
}

const DeliveryOrdersManager = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null)
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (user) {
      loadOrders()
      getCurrentLocation()
    }
  }, [user])

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          console.error('Error getting location:', error)
          toast({
            title: 'Location Error',
            description: 'Could not get your current location',
            variant: 'destructive'
          })
        }
      )
    }
  }

  const loadOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .or(`delivery_partner_id.eq.${user?.id},delivery_partner_id.is.null`)
        .neq('status', 'delivered')
        .order('created_at', { ascending: false })

      if (error) throw error
      setOrders((data || []).map(order => ({
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

  const acceptOrder = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          delivery_partner_id: user?.id,
          status: 'accepted'
        })
        .eq('id', orderId)

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Order accepted successfully!'
      })
      
      loadOrders()
    } catch (error) {
      console.error('Error accepting order:', error)
      toast({
        title: 'Error',
        description: 'Failed to accept order',
        variant: 'destructive'
      })
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
      
      loadOrders()
    } catch (error) {
      console.error('Error updating order:', error)
      toast({
        title: 'Error',
        description: 'Failed to update order status',
        variant: 'destructive'
      })
    }
  }

  const updateLiveLocation = async (lat?: number, lng?: number) => {
    const location = lat && lng ? { lat, lng } : currentLocation
    if (!location || !selectedOrder) return

    try {
      const { error } = await supabase
        .from('delivery_tracking')
        .insert({
          order_id: selectedOrder.id,
          delivery_partner_id: user?.id,
          current_lat: location.lat,
          current_lng: location.lng,
          status: selectedOrder.status
        })

      if (error) throw error

      if (lat && lng) {
        setCurrentLocation({ lat, lng })
      }

      toast({
        title: 'Success',
        description: 'Location updated successfully!'
      })
    } catch (error) {
      console.error('Error updating location:', error)
      toast({
        title: 'Error',
        description: 'Failed to update location',
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
      case 'accepted': return 'picked_up'
      case 'ready': return 'picked_up'
      case 'picked_up': return 'on_the_way'
      case 'on_the_way': return 'delivered'
      default: return null
    }
  }

  const getMapMarkers = (order: Order) => {
    const markers = []

    if (order.pickup_lat && order.pickup_lng) {
      markers.push({
        id: 'pickup',
        name: 'Pickup Location',
        lat: order.pickup_lat,
        lng: order.pickup_lng,
        category: 'pickup'
      })
    }

    if (order.delivery_lat && order.delivery_lng) {
      markers.push({
        id: 'delivery',
        name: 'Delivery Location',
        lat: order.delivery_lat,
        lng: order.delivery_lng,
        category: 'delivery'
      })
    }

    if (currentLocation) {
      markers.push({
        id: 'current',
        name: 'Your Location',
        lat: currentLocation.lat,
        lng: currentLocation.lng,
        category: 'current'
      })
    }

    return markers
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
      <div className="grid gap-4">
        {orders.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No orders available</p>
              <p className="text-sm text-gray-400">Check back later for new delivery orders</p>
            </CardContent>
          </Card>
        ) : (
          orders.map(order => (
            <Card key={order.id} className="cursor-pointer hover:shadow-lg transition-shadow">
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
                      <MapPin className="h-4 w-4 text-[#16A085]" />
                      <span className="font-medium">Pickup</span>
                    </div>
                    <p className="text-sm text-gray-600">{order.pickup_address}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-red-500" />
                      <span className="font-medium">Delivery</span>
                    </div>
                    <p className="text-sm text-gray-600">{order.delivery_address}</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Total: ₹{order.total_amount.toFixed(2)}</span>
                    <span className="text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex gap-2 flex-wrap">
                    {!order.delivery_partner_id && order.status === 'pending' && (
                      <Button
                        onClick={() => acceptOrder(order.id)}
                        className="bg-[#16A085] hover:bg-[#16A085]/90"
                        size="sm"
                      >
                        Accept Order
                      </Button>
                    )}
                    
                    {order.delivery_partner_id === user?.id && getNextStatus(order.status) && (
                      <Button
                        onClick={() => updateOrderStatus(order.id, getNextStatus(order.status)!)}
                        variant="outline"
                        size="sm"
                      >
                        Mark as {getNextStatus(order.status)?.replace('_', ' ')}
                      </Button>
                    )}
                    
                    {order.delivery_partner_id === user?.id && (
                      <>
                        <Button
                          onClick={() => setSelectedOrder(order)}
                          variant="outline"
                          size="sm"
                        >
                          View Map
                        </Button>
                        <Button
                          onClick={() => updateLiveLocation()}
                          variant="outline"
                          size="sm"
                        >
                          Update Location
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {selectedOrder && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Delivery Route - Order #{selectedOrder.id.slice(0, 8)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <LeafletMap
                shops={getMapMarkers(selectedOrder)}
                showShops={true}
                height="400px"
                center={currentLocation || undefined}
                showCurrentLocationButton={true}
                onCurrentLocationUpdate={updateLiveLocation}
                deliveryLocation={currentLocation || undefined}
                customerLocation={selectedOrder.delivery_lat && selectedOrder.delivery_lng 
                  ? { lat: selectedOrder.delivery_lat, lng: selectedOrder.delivery_lng }
                  : undefined}
              />
              
              <div className="flex justify-between">
                <Button 
                  onClick={() => updateLiveLocation()}
                  className="bg-[#16A085] hover:bg-[#16A085]/90"
                >
                  Update My Location
                </Button>
                <Button 
                  onClick={() => setSelectedOrder(null)}
                  variant="outline"
                >
                  Close Map
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default DeliveryOrdersManager