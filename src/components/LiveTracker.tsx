import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, Navigation, RefreshCw } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'
import LeafletMap from './LeafletMap'

interface Order {
  id: string
  delivery_address: string
  delivery_lat?: number
  delivery_lng?: number
  pickup_address: string
  pickup_lat?: number
  pickup_lng?: number
  status: string
}

interface LiveTrackerProps {
  orderId: string
  isDeliveryPartner?: boolean
}

const LiveTracker: React.FC<LiveTrackerProps> = ({ orderId, isDeliveryPartner = false }) => {
  const [order, setOrder] = useState<Order | null>(null)
  const [deliveryLocation, setDeliveryLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    loadOrderDetails()
    if (isDeliveryPartner) {
      loadDeliveryLocation()
    }
  }, [orderId, isDeliveryPartner])

  const loadOrderDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single()

      if (error) throw error
      setOrder(data)
    } catch (error) {
      console.error('Error loading order:', error)
      toast({
        title: 'Error',
        description: 'Failed to load order details',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const loadDeliveryLocation = async () => {
    try {
      const { data, error } = await supabase
        .from('delivery_tracking')
        .select('*')
        .eq('order_id', orderId)
        .order('timestamp', { ascending: false })
        .limit(1)
        .single()

      if (data && data.current_lat && data.current_lng) {
        setDeliveryLocation({
          lat: data.current_lat,
          lng: data.current_lng
        })
      }
    } catch (error) {
      console.log('No delivery location found yet')
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#16A085]"></div>
        </CardContent>
      </Card>
    )
  }

  if (!order) {
    return (
      <Card>
        <CardContent className="text-center p-8">
          <p className="text-gray-500">Order not found</p>
        </CardContent>
      </Card>
    )
  }

  const customerLocation = order.delivery_lat && order.delivery_lng 
    ? { lat: order.delivery_lat, lng: order.delivery_lng }
    : null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Navigation className="h-5 w-5" />
          {isDeliveryPartner ? 'Delivery Route' : 'Track Your Order'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-sm text-gray-700 mb-1">Pickup Location</h4>
            <p className="text-sm text-gray-600">{order.pickup_address}</p>
          </div>
          <div>
            <h4 className="font-medium text-sm text-gray-700 mb-1">Delivery Location</h4>
            <p className="text-sm text-gray-600">{order.delivery_address}</p>
          </div>
        </div>

        <div className="h-96">
          <LeafletMap
            height="100%"
            center={customerLocation || undefined}
            deliveryLocation={deliveryLocation || undefined}
            customerLocation={customerLocation || undefined}
            zoom={14}
          />
        </div>

        {!isDeliveryPartner && deliveryLocation && (
          <div className="text-center text-sm text-gray-600">
            <p>🚗 Your delivery partner is on the way!</p>
            <p>Last updated: {new Date().toLocaleTimeString()}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default LiveTracker