
import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, Star, Phone, Clock, Plus, Minus, ShoppingCart } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

// Mock data for products
const mockShop = {
  id: '1',
  name: 'Fresh Mart Grocery',
  category: 'grocery',
  address: '123 Main Street, Delhi',
  phone: '+91 9876543210',
  is_open: true,
  rating: 4.5,
  total_reviews: 128,
  delivery_fee: 25,
  minimum_order_amount: 200,
  opening_time: '08:00',
  closing_time: '22:00'
}

const mockProducts = [
  {
    id: '1',
    name: 'Fresh Apples',
    description: 'Red delicious apples, 1kg pack',
    price: 150,
    category: 'Fruits',
    is_available: true,
    stock_quantity: 50,
    image_url: '/placeholder.svg'
  },
  {
    id: '2',
    name: 'Basmati Rice',
    description: 'Premium quality basmati rice, 5kg',
    price: 600,
    category: 'Grains',
    is_available: true,
    stock_quantity: 25,
    image_url: '/placeholder.svg'
  },
  {
    id: '3',
    name: 'Fresh Milk',
    description: 'Full cream milk, 1 liter',
    price: 60,
    category: 'Dairy',
    is_available: false,
    stock_quantity: 0,
    image_url: '/placeholder.svg'
  }
]

const ShopDetail = () => {
  const { shopId } = useParams()
  const { toast } = useToast()
  const [cart, setCart] = useState<Record<string, number>>({})

  const updateCartQuantity = (productId: string, change: number) => {
    setCart(prev => {
      const currentQty = prev[productId] || 0
      const newQty = Math.max(0, currentQty + change)
      
      if (newQty === 0) {
        const { [productId]: removed, ...rest } = prev
        return rest
      }
      
      return { ...prev, [productId]: newQty }
    })
  }

  const addToCart = (productId: string) => {
    updateCartQuantity(productId, 1)
    toast({
      title: "Added to cart",
      description: "Item has been added to your cart",
    })
  }

  const getTotalItems = () => {
    return Object.values(cart).reduce((sum, qty) => sum + qty, 0)
  }

  const getTotalAmount = () => {
    return Object.entries(cart).reduce((total, [productId, qty]) => {
      const product = mockProducts.find(p => p.id === productId)
      return total + (product ? product.price * qty : 0)
    }, 0)
  }

  return (
    <div className="min-h-screen bg-[#F7F9F9] p-4">
      <div className="max-w-6xl mx-auto">
        {/* Shop Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl text-[#2C3E50] mb-2">
                  {mockShop.name}
                </CardTitle>
                <div className="flex items-center gap-4 mb-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{mockShop.rating}</span>
                    <span className="text-gray-500">({mockShop.total_reviews} reviews)</span>
                  </div>
                  <Badge variant={mockShop.is_open ? "default" : "secondary"}>
                    {mockShop.is_open ? "Open" : "Closed"}
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{mockShop.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{mockShop.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">
                    {mockShop.opening_time} - {mockShop.closing_time}
                  </span>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div>Delivery Fee: ₹{mockShop.delivery_fee}</div>
                <div>Minimum Order: ₹{mockShop.minimum_order_amount}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold text-[#2C3E50] mb-4">Products</h2>
            <div className="space-y-4">
              {mockProducts.map((product) => (
                <Card key={product.id}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-20 h-20 object-cover rounded-lg bg-gray-100"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-medium text-[#2C3E50]">{product.name}</h3>
                            <p className="text-sm text-gray-600">{product.description}</p>
                            <Badge variant="outline" className="mt-1">
                              {product.category}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-semibold text-[#16A085]">
                              ₹{product.price}
                            </div>
                            <div className="text-xs text-gray-500">
                              Stock: {product.stock_quantity}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {cart[product.id] ? (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateCartQuantity(product.id, -1)}
                                >
                                  <Minus className="w-4 h-4" />
                                </Button>
                                <span className="px-3 py-1 bg-gray-100 rounded">
                                  {cart[product.id]}
                                </span>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateCartQuantity(product.id, 1)}
                                >
                                  <Plus className="w-4 h-4" />
                                </Button>
                              </>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => addToCart(product.id)}
                                disabled={!product.is_available}
                                className="bg-[#16A085] hover:bg-[#16A085]/90"
                              >
                                <Plus className="w-4 h-4 mr-1" />
                                Add to Cart
                              </Button>
                            )}
                          </div>
                          {!product.is_available && (
                            <Badge variant="secondary">Out of Stock</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Cart Summary */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Cart ({getTotalItems()} items)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {Object.keys(cart).length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Your cart is empty</p>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(cart).map(([productId, qty]) => {
                      const product = mockProducts.find(p => p.id === productId)
                      if (!product) return null
                      
                      return (
                        <div key={productId} className="flex justify-between items-center">
                          <div>
                            <div className="font-medium text-sm">{product.name}</div>
                            <div className="text-xs text-gray-500">
                              ₹{product.price} × {qty}
                            </div>
                          </div>
                          <div className="font-medium">
                            ₹{product.price * qty}
                          </div>
                        </div>
                      )
                    })}
                    
                    <hr />
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>₹{getTotalAmount()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Delivery Fee:</span>
                        <span>₹{mockShop.delivery_fee}</span>
                      </div>
                      <div className="flex justify-between font-semibold">
                        <span>Total:</span>
                        <span>₹{getTotalAmount() + mockShop.delivery_fee}</span>
                      </div>
                    </div>
                    
                    <Button className="w-full bg-[#16A085] hover:bg-[#16A085]/90 mt-4">
                      Proceed to Checkout
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ShopDetail
