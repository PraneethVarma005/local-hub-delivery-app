
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { MapPin, Phone, User, MessageSquare } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@/hooks/use-toast'
import LeafletMap from '@/components/LeafletMap'

const Checkout = () => {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [orderData, setOrderData] = useState({
    customerName: '',
    phone: '',
    address: '',
    latitude: 0,
    longitude: 0,
    specialInstructions: ''
  })

  // Mock cart data
  const mockCartItems = [
    { id: '1', name: 'Fresh Apples', price: 150, quantity: 2 },
    { id: '2', name: 'Basmati Rice', price: 600, quantity: 1 }
  ]

  const subtotal = mockCartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const deliveryFee = 25
  const total = subtotal + deliveryFee

  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    setOrderData(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      address: address
    }))
  }

  const handlePlaceOrder = async () => {
    if (!orderData.customerName || !orderData.phone || !orderData.address) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    try {
      // Simulate order placement (skip actual database for now)
      toast({
        title: "Order Placed Successfully!",
        description: "Your order has been placed and will be processed soon.",
      })
      
      // Navigate to orders page
      navigate('/customer/orders')
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to place order. Please try again.",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F9F9] p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-[#2C3E50] mb-6">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Order Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="customerName">Full Name *</Label>
                  <Input
                    id="customerName"
                    value={orderData.customerName}
                    onChange={(e) => setOrderData(prev => ({ ...prev, customerName: e.target.value }))}
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={orderData.phone}
                    onChange={(e) => setOrderData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter your phone number"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Delivery Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Delivery Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    value={orderData.address}
                    onChange={(e) => setOrderData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Click on the map or enter address manually"
                  />
                </div>
                <div>
                  <Label>Select Delivery Location on Map</Label>
                  <LeafletMap
                    onLocationSelect={handleLocationSelect}
                    selectedLocation={orderData.latitude && orderData.longitude ? 
                      { lat: orderData.latitude, lng: orderData.longitude } : undefined
                    }
                    height="300px"
                    showLocationPicker={true}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Special Instructions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Special Instructions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={orderData.specialInstructions}
                  onChange={(e) => setOrderData(prev => ({ ...prev, specialInstructions: e.target.value }))}
                  placeholder="Any special instructions for delivery (optional)"
                  rows={3}
                />
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Order Items */}
                <div className="space-y-3">
                  {mockCartItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-sm">{item.name}</div>
                        <div className="text-xs text-gray-500">
                          ₹{item.price} × {item.quantity}
                        </div>
                      </div>
                      <div className="font-medium">
                        ₹{item.price * item.quantity}
                      </div>
                    </div>
                  ))}
                </div>

                <hr />

                {/* Price Breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee:</span>
                    <span>₹{deliveryFee}</span>
                  </div>
                  <hr />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total:</span>
                    <span>₹{total}</span>
                  </div>
                </div>

                {/* Payment Note */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-700">
                    💳 Payment will be collected on delivery (Cash on Delivery)
                  </p>
                </div>

                <Button 
                  onClick={handlePlaceOrder}
                  className="w-full bg-[#16A085] hover:bg-[#16A085]/90"
                  size="lg"
                >
                  Place Order
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout
