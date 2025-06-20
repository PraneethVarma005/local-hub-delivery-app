
import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import GoogleMap from '@/components/GoogleMap'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { useLocation as useUserLocation } from '@/contexts/LocationContext'
import { ArrowLeft, MapPin } from 'lucide-react'

interface CartItem {
  product_id: string
  quantity: number
}

interface Product {
  id: string
  name: string
  price: number
}

interface Shop {
  id: string
  name: string
  delivery_fee: number
}

const Checkout = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const { toast } = useToast()
  const { location: userLocation } = useUserLocation()
  
  const { shopId, cart, shop } = location.state || {}
  
  const [products, setProducts] = useState<Product[]>([])
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [customerPhone, setCustomerPhone] = useState(profile?.phone || '')
  const [specialInstructions, setSpecialInstructions] = useState('')
  const [deliveryLocation, setDeliveryLocation] = useState<{lat: number, lng: number} | null>(
    userLocation ? { lat: userLocation.lat, lng: userLocation.lng } : null
  )
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!cart || !shopId) {
      navigate('/customer/shops')
      return
    }
    
    fetchProducts()
    
    // Set initial address from profile
    if (profile?.address) {
      setDeliveryAddress(profile.address)
    }
  }, [cart, shopId, profile])

  const fetchProducts = async () => {
    try {
      const productIds = cart.map((item: CartItem) => item.product_id)
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price')
        .in('id', productIds)

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const getOrderSummary = () => {
    return cart.map((cartItem: CartItem) => {
      const product = products.find(p => p.id === cartItem.product_id)
      return {
        ...cartItem,
        product,
        total: product ? product.price * cartItem.quantity : 0
      }
    })
  }

  const getSubtotal = () => {
    return getOrderSummary().reduce((total, item) => total + item.total, 0)
  }

  const getTotal = () => {
    return getSubtotal() + (shop?.delivery_fee || 0)
  }

  const handleLocationSelect = (lat: number, lng: number) => {
    setDeliveryLocation({ lat, lng })
    
    // Reverse geocoding would be implemented here in a real app
    // For now, we'll set a simple coordinate-based address
    setDeliveryAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`)
  }

  const handlePlaceOrder = async () => {
    if (!user || !deliveryLocation || !deliveryAddress.trim() || !customerPhone.trim()) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields and select delivery location',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)

    try {
      // Create order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_id: user.id,
          shop_id: shopId,
          status: 'pending',
          total_amount: getTotal(),
          delivery_fee: shop?.delivery_fee || 0,
          delivery_address: deliveryAddress,
          delivery_latitude: deliveryLocation.lat,
          delivery_longitude: deliveryLocation.lng,
          customer_phone: customerPhone,
          special_instructions: specialInstructions || null,
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Create order items
      const orderItems = getOrderSummary().map(item => ({
        order_id: orderData.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.product!.price,
        total_price: item.total
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) throw itemsError

      // Clear cart
      await supabase
        .from('cart_items')
        .delete()
        .eq('customer_id', user.id)
        .in('product_id', cart.map((item: CartItem) => item.product_id))

      toast({
        title: 'Order placed successfully!',
        description: `Order #${orderData.id.slice(0, 8)} has been placed`,
      })

      navigate('/customer/orders', { replace: true })
    } catch (error) {
      console.error('Error placing order:', error)
      toast({
        title: 'Error placing order',
        description: 'Please try again',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  if (!cart || !shop) {
    return (
      <div className="min-h-screen bg-[#F7F9F9] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">No items in cart</p>
          <Button onClick={() => navigate('/customer/shops')}>
            Browse Shops
          </Button>
        </div>
      </div>
    )
  }

  const orderSummary = getOrderSummary()

  return (
    <div className="min-h-screen bg-[#F7F9F9] p-4">
      <div className="max-w-6xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <h1 className="text-3xl font-bold text-[#2C3E50] mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order Details Form */}
          <div className="space-y-6">
            {/* Delivery Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-[#2C3E50]">Delivery Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Enter your phone number"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="address">Delivery Address *</Label>
                  <Textarea
                    id="address"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Enter full delivery address"
                    required
                  />
                </div>

                <div>
                  <Label>Select Delivery Location on Map *</Label>
                  <div className="mt-2">
                    <GoogleMap
                      onLocationSelect={handleLocationSelect}
                      height="300px"
                      center={deliveryLocation || userLocation || undefined}
                      userLocation={userLocation}
                    />
                  </div>
                  {deliveryLocation && (
                    <p className="text-sm text-green-600 mt-2 flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      Location selected: {deliveryLocation.lat.toFixed(4)}, {deliveryLocation.lng.toFixed(4)}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="instructions">Special Instructions (Optional)</Label>
                  <Textarea
                    id="instructions"
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    placeholder="Any special delivery instructions..."
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-[#2C3E50]">Order Summary</CardTitle>
                <p className="text-sm text-gray-600">From: {shop.name}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Order Items */}
                  <div className="space-y-3">
                    {orderSummary.map((item) => (
                      <div key={item.product_id} className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{item.product?.name}</p>
                          <p className="text-sm text-gray-600">
                            ₹{item.product?.price} × {item.quantity}
                          </p>
                        </div>
                        <p className="font-medium">₹{item.total.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>₹{getSubtotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery fee:</span>
                      <span>₹{(shop.delivery_fee || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Total:</span>
                      <span>₹{getTotal().toFixed(2)}</span>
                    </div>
                  </div>

                  <Button
                    onClick={handlePlaceOrder}
                    disabled={loading || !deliveryLocation || !deliveryAddress.trim() || !customerPhone.trim()}
                    className="w-full bg-[#16A085] hover:bg-[#16A085]/90"
                  >
                    {loading ? 'Placing Order...' : 'Place Order'}
                  </Button>

                  <p className="text-xs text-gray-500 text-center">
                    Note: Payment will be collected on delivery
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout
