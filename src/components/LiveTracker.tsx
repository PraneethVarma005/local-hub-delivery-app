
import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Clock, User } from 'lucide-react'
import LeafletMap from './LeafletMap'

interface DeliveryPartner {
  id: string
  name: string
  lat: number
  lng: number
  status: 'assigned' | 'picked_up' | 'on_the_way' | 'delivered'
  estimatedTime?: string
}

interface LiveTrackerProps {
  orderId: string
  customerLocation: { lat: number; lng: number }
  shopLocation: { lat: number; lng: number }
}

const LiveTracker: React.FC<LiveTrackerProps> = ({ 
  orderId, 
  customerLocation, 
  shopLocation 
}) => {
  const [deliveryPartner, setDeliveryPartner] = useState<DeliveryPartner | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock data for demonstration
    const mockDeliveryPartner: DeliveryPartner = {
      id: '1',
      name: 'Raj Kumar',
      lat: 28.6100, // Slightly different from shop location to show movement
      lng: 77.2050,
      status: 'on_the_way',
      estimatedTime: '15 mins'
    }

    // Simulate getting delivery partner data
    setTimeout(() => {
      setDeliveryPartner(mockDeliveryPartner)
      setLoading(false)
    }, 1000)

    // Simulate live location updates
    const interval = setInterval(() => {
      if (mockDeliveryPartner) {
        // Simulate movement towards customer location
        const deltaLat = (customerLocation.lat - mockDeliveryPartner.lat) * 0.1
        const deltaLng = (customerLocation.lng - mockDeliveryPartner.lng) * 0.1
        
        mockDeliveryPartner.lat += deltaLat
        mockDeliveryPartner.lng += deltaLng
        
        setDeliveryPartner({ ...mockDeliveryPartner })
      }
    }, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [orderId, customerLocation])

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#16A085] mx-auto mb-4"></div>
            <p>Finding delivery partner...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!deliveryPartner) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-gray-500">No delivery partner assigned yet</p>
        </CardContent>
      </Card>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned': return 'bg-yellow-500'
      case 'picked_up': return 'bg-blue-500'
      case 'on_the_way': return 'bg-green-500'
      case 'delivered': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'assigned': return 'Assigned'
      case 'picked_up': return 'Order Picked Up'
      case 'on_the_way': return 'On the Way'
      case 'delivered': return 'Delivered'
      default: return 'Unknown'
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Live Delivery Tracking
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <User className="h-8 w-8 text-[#16A085]" />
              <div>
                <p className="font-medium">{deliveryPartner.name}</p>
                <p className="text-sm text-gray-600">Delivery Partner</p>
              </div>
            </div>
            <Badge className={`${getStatusColor(deliveryPartner.status)} text-white`}>
              {getStatusText(deliveryPartner.status)}
            </Badge>
          </div>
          
          {deliveryPartner.estimatedTime && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>Estimated delivery: {deliveryPartner.estimatedTime}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Live Location</CardTitle>
        </CardHeader>
        <CardContent>
          <LeafletMap
            shops={[
              {
                id: 'delivery-partner',
                name: deliveryPartner.name,
                lat: deliveryPartner.lat,
                lng: deliveryPartner.lng,
                category: 'delivery'
              },
              {
                id: 'customer',
                name: 'Delivery Location',
                lat: customerLocation.lat,
                lng: customerLocation.lng,
                category: 'customer'
              },
              {
                id: 'shop',
                name: 'Shop',
                lat: shopLocation.lat,
                lng: shopLocation.lng,
                category: 'shop'
              }
            ]}
            height="300px"
            showShops={true}
            center={{ lat: deliveryPartner.lat, lng: deliveryPartner.lng }}
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default LiveTracker
