
import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, Plus, Minus, ShoppingCart, MapPin, Clock, Star } from 'lucide-react'

interface Product {
  id: string
  name: string
  description: string
  image_url: string
  price: number
  category: string
  is_available: boolean
  stock_quantity: number
}

interface Shop {
  id: string
  name: string
  description: string
  category: string
  image_url: string
  address: string
  phone: string
  is_open: boolean
  opening_time: string
  closing_time: string
  minimum_order_amount: number
  delivery_fee: number
  rating: number
  total_reviews: number
}

interface CartItem {
  product_id: string
  quantity: number
}

const ShopDetail = () => {
  const { shopId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()
  
  const [shop, setShop] = useState<Shop | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (shopId) {
      fetchShopDetails()
      fetchProducts()
      fetchCartItems()
    }
  }, [shopId])

  const fetchShopDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('shops')
        .select('*')
        .eq('id', shopId)
        .single()

      if (error) throw error
      setShop(data)
    } catch (error) {
      console.error('Error fetching shop:', error)
      toast({
        title: 'Error',
        description: 'Failed to load shop details',
        variant: 'destructive'
      })
    }
  }

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('shop_id', shopId)
        .eq('is_available', true)
        .order('category', { ascending: true })

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCartItems = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select('product_id, quantity')
        .eq('customer_id', user.id)

      if (error) throw error
      setCart(data || [])
    } catch (error) {
      console.error('Error fetching cart:', error)
    }
  }

  const getProductQuantityInCart = (productId: string) => {
    const cartItem = cart.find(item => item.product_id === productId)
    return cartItem ? cartItem.quantity : 0
  }

  const updateCartItem = async (productId: string, newQuantity: number) => {
    if (!user) {
      toast({
        title: 'Please login',
        description: 'You need to login to add items to cart',
        variant: 'destructive'
      })
      return
    }

    try {
      if (newQuantity === 0) {
        // Remove from cart
        await supabase
          .from('cart_items')
          .delete()
          .eq('customer_id', user.id)
          .eq('product_id', productId)
        
        setCart(cart.filter(item => item.product_id !== productId))
      } else {
        // Check if item already exists in cart
        const existingItem = cart.find(item => item.product_id === productId)
        
        if (existingItem) {
          // Update quantity
          await supabase
            .from('cart_items')
            .update({ quantity: newQuantity })
            .eq('customer_id', user.id)
            .eq('product_id', productId)
          
          setCart(cart.map(item => 
            item.product_id === productId 
              ? { ...item, quantity: newQuantity }
              : item
          ))
        } else {
          // Add new item
          await supabase
            .from('cart_items')
            .insert({
              customer_id: user.id,
              product_id: productId,
              quantity: newQuantity
            })
          
          setCart([...cart, { product_id: productId, quantity: newQuantity }])
        }
      }

      toast({
        title: 'Cart updated',
        description: newQuantity === 0 ? 'Item removed from cart' : 'Item added to cart'
      })
    } catch (error) {
      console.error('Error updating cart:', error)
      toast({
        title: 'Error',
        description: 'Failed to update cart',
        variant: 'destructive'
      })
    }
  }

  const getTotalCartValue = () => {
    return cart.reduce((total, cartItem) => {
      const product = products.find(p => p.id === cartItem.product_id)
      return total + (product ? product.price * cartItem.quantity : 0)
    }, 0)
  }

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast({
        title: 'Cart is empty',
        description: 'Please add items to cart before checkout',
        variant: 'destructive'
      })
      return
    }

    const totalValue = getTotalCartValue()
    if (shop && totalValue < shop.minimum_order_amount) {
      toast({
        title: 'Minimum order not met',
        description: `Minimum order amount is ₹${shop.minimum_order_amount}`,
        variant: 'destructive'
      })
      return
    }

    navigate('/customer/checkout', { state: { shopId, cart, shop } })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F9F9] flex items-center justify-center">
        <div className="text-gray-500">Loading shop details...</div>
      </div>
    )
  }

  if (!shop) {
    return (
      <div className="min-h-screen bg-[#F7F9F9] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Shop not found</p>
          <Button onClick={() => navigate('/customer/shops')}>
            Back to Shops
          </Button>
        </div>
      </div>
    )
  }

  const groupedProducts = products.reduce((acc, product) => {
    const category = product.category || 'Other'
    if (!acc[category]) acc[category] = []
    acc[category].push(product)
    return acc
  }, {} as Record<string, Product[]>)

  return (
    <div className="min-h-screen bg-[#F7F9F9]">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/customer/shops')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Shops
          </Button>

          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <h1 className="text-3xl font-bold text-[#2C3E50]">{shop.name}</h1>
                <Badge 
                  variant={shop.is_open ? "default" : "secondary"}
                  className={shop.is_open ? "bg-[#16A085]" : ""}
                >
                  {shop.is_open ? 'Open' : 'Closed'}
                </Badge>
              </div>

              {shop.description && (
                <p className="text-gray-600 mb-4">{shop.description}</p>
              )}

              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  {shop.address}
                </div>
                
                {shop.opening_time && shop.closing_time && (
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    {shop.opening_time} - {shop.closing_time}
                  </div>
                )}
                
                <div className="flex items-center">
                  <Star className="w-4 h-4 mr-1 text-yellow-400 fill-current" />
                  {shop.rating.toFixed(1)} ({shop.total_reviews} reviews)
                </div>
              </div>

              <div className="mt-4 text-sm text-gray-600">
                Minimum order: ₹{shop.minimum_order_amount}
                {shop.delivery_fee > 0 && ` • Delivery fee: ₹${shop.delivery_fee}`}
              </div>
            </div>

            {/* Cart Summary */}
            {cart.length > 0 && (
              <div className="md:w-80">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-[#2C3E50]">
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Cart ({getTotalItems()} items)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>₹{getTotalCartValue().toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Delivery fee:</span>
                        <span>₹{shop.delivery_fee.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg border-t pt-2">
                        <span>Total:</span>
                        <span>₹{(getTotalCartValue() + shop.delivery_fee).toFixed(2)}</span>
                      </div>
                    </div>
                    <Button 
                      onClick={handleCheckout}
                      className="w-full bg-[#16A085] hover:bg-[#16A085]/90"
                    >
                      Proceed to Checkout
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {Object.entries(groupedProducts).map(([category, categoryProducts]) => (
          <div key={category} className="mb-8">
            <h2 className="text-xl font-semibold text-[#2C3E50] mb-4">{category}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryProducts.map((product) => {
                const quantityInCart = getProductQuantityInCart(product.id)
                
                return (
                  <Card key={product.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-[#2C3E50] mb-1">{product.name}</h3>
                          {product.description && (
                            <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                          )}
                          <p className="text-lg font-bold text-[#16A085]">₹{product.price}</p>
                          {product.stock_quantity <= 5 && (
                            <p className="text-xs text-orange-500">Only {product.stock_quantity} left</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        {quantityInCart === 0 ? (
                          <Button
                            onClick={() => updateCartItem(product.id, 1)}
                            disabled={!shop.is_open || product.stock_quantity === 0}
                            className="bg-[#16A085] hover:bg-[#16A085]/90"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Add to Cart
                          </Button>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateCartItem(product.id, quantityInCart - 1)}
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <span className="font-medium px-3">{quantityInCart}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateCartItem(product.id, quantityInCart + 1)}
                              disabled={quantityInCart >= product.stock_quantity}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        ))}

        {products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No products available at this shop.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ShopDetail
