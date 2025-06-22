
import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'
import { MapPin, Clock, User, Phone } from 'lucide-react'
import LeafletMap from './LeafletMap'

interface DeliveryTracking {
  id: string
  order_id: string
  delivery_partner_id: string
  current_lat: number
  current_lng: number
  status: string
  timestamp: string
}

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

interface LiveDeliveryTrackerProps {
  orderId: string
}

const LiveDeliveryTracker: React.FC<LiveDeliveryTrackerProps> = ({ orderId }) => {
  const [order, setOrder] = useState<Order | null>(null)
  const [deliveryLocation, setDeliveryLocation] = useState<DeliveryTracking | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrderDetails()
    
    // Set up real-time subscription for delivery tracking
    const subscription = supabase
      .channel('delivery-tracking')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'delivery_tracking',
          filter: `order_id=eq.${orderId}`
        },
        (payload) => {
          console.log('New delivery location update:', payload)
          setDeliveryLocation(payload.new as DeliveryTracking)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`
        },
        (payload) => {
          console.log('Order status update:', payload)
          setOrder(payload.new as Order)
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [orderId])

  const fetchOrderDetails = async () => {
    try {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single()

      if (orderError) {
        console.error('Error fetching order:', orderError)
        return
      }

      setOrder(orderData)

      // Fetch latest delivery location if delivery partner is assigned
      if (orderData.delivery_partner_id) {
        const { data: trackingData, error: trackingError } = await supabase
          .from('delivery_tracking')
          .select('*')
          .eq('order_id', orderId)
          .order('timestamp', { ascending: false })
          .limit(1)
          .single()

        if (!trackingError && trackingData) {
          setDeliveryLocation(trackingData)
        }
      }
    } catch (error) {
      console.error('Error fetching order details:', error)
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
      default: return 'bg-gray-500'
    }
  }

  const getMapMarkers = () => {
    const markers = []

    // Add pickup location
    if (order?.pickup_lat && order?.pickup_lng) {
      markers.push({
        id: 'pickup',
        name: 'Pickup Location',
        lat: order.pickup_lat,
        lng: order.pickup_lng,
        category: 'pickup'
      })
    }

    // Add delivery location
    if (order?.delivery_lat && order?.delivery_lng) {
      markers.push({
        id: 'delivery',
        name: 'Delivery Location',
        lat: order.delivery_lat,
        lng: order.delivery_lng,
        category: 'delivery'
      })
    }

    // Add current delivery partner location
    if (deliveryLocation) {
      markers.push({
        id: 'delivery-partner',
        name: 'Delivery Partner',
        lat: deliveryLocation.current_lat,
        lng: deliveryLocation.current_lng,
        category: 'delivery-partner'
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

  if (!order) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500">Order not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Order #{order.id.slice(0, 8)}</CardTitle>
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

          {order.estimated_delivery_time && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <span className="text-sm">
                Estimated delivery: {new Date(order.estimated_delivery_time).toLocaleTimeString()}
              </span>
            </div>
          )}

          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">Order Items:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              {order.items.map((item: any, index: number) => (
                <li key={index}>
                  {item.quantity}x {item.name} - ${item.price.toFixed(2)}
                </li>
              ))}
            </ul>
            <p className="font-semibold mt-2">Total: ${order.total_amount.toFixed(2)}</p>
          </div>
        </CardContent>
      </Card>

      {deliveryLocation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Live Delivery Tracking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-gray-600">
                Last updated: {new Date(deliveryLocation.timestamp).toLocaleString()}
              </div>
              
              <LeafletMap
                shops={getMapMarkers()}
                showShops={true}
                height="400px"
                center={
                  deliveryLocation ? 
                  { lat: deliveryLocation.current_lat, lng: deliveryLocation.current_lng } : 
                  undefined
                }
              />
              
              <div className="text-center">
                <Badge className="bg-green-500 text-white">
                  Delivery partner is {deliveryLocation.status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!deliveryLocation && order.status === 'pending' && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">Waiting for delivery partner assignment...</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default LiveDeliveryTracker
