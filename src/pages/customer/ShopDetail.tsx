
import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, Clock, Star, ArrowLeft, Plus, Minus, ShoppingCart } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import LeafletMap from '@/components/LeafletMap'
import RatingSystem from '@/components/RatingSystem'
import { supabase } from '@/lib/supabase'

const ShopDetail = () => {
  const { shopId } = useParams<{ shopId: string }>()
  const [shop, setShop] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [userRating, setUserRating] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const { addToCart, items, updateQuantity, getTotalItems } = useCart()
  const { user } = useAuth()

  useEffect(() => {
    if (shopId) {
      loadShopDetails()
      loadProducts()
      loadUserRating()
    }
  }, [shopId, user])

  const loadShopDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', shopId)
        .eq('role', 'shop_owner')
        .single()

      if (error) throw error
      setShop(data)
    } catch (error) {
      console.error('Error loading shop details:', error)
      toast({
        title: 'Error',
        description: 'Failed to load shop details',
        variant: 'destructive'
      })
    }
  }

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('shop_inventory')
        .select('*')
        .eq('shop_id', shopId)
        .eq('is_available', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadUserRating = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('shop_ratings')
        .select('*')
        .eq('shop_id', shopId)
        .eq('customer_id', user.id)
        .single()

      if (data) {
        setUserRating(data)
      }
    } catch (error) {
      // User hasn't rated yet, which is fine
    }
  }

  const getItemQuantity = (productId: string) => {
    const item = items.find(item => item.id === productId)
    return item ? item.quantity : 0
  }

  const handleAddToCart = (product: any) => {
    addToCart({
      id: product.id,
      shopId: shop.id,
      name: product.product_name,
      price: product.price,
      image: product.image_url
    })
    
    toast({
      title: "Added to cart",
      description: `${product.product_name} has been added to your cart`,
    })
  }

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    updateQuantity(productId, newQuantity)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F9F9] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#16A085]"></div>
      </div>
    )
  }

  if (!shop) {
    return (
      <div className="min-h-screen bg-[#F7F9F9] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#2C3E50] mb-2">Shop Not Found</h2>
          <Link to="/customer/shops">
            <Button className="bg-[#16A085] hover:bg-[#16A085]/90">
              Back to Shops
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F7F9F9] p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link to="/customer/shops" className="inline-flex items-center text-[#16A085] hover:underline mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Shops
          </Link>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-3xl font-bold text-[#2C3E50]">{shop.shop_name}</h1>
                  <Badge 
                    className={`${
                      shop.shop_category === 'food' ? 'bg-orange-500' :
                      shop.shop_category === 'groceries' ? 'bg-green-500' :
                      'bg-blue-500'
                    } text-white capitalize`}
                  >
                    {shop.shop_category}
                  </Badge>
                </div>
                <p className="text-gray-600 mb-2">Owned by {shop.full_name}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {shop.shop_address}
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    30-45 min delivery
                  </div>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 mr-1" />
                    {shop.average_rating || 'New'} ({shop.total_ratings || 0} reviews)
                  </div>
                </div>
              </div>
              <Badge variant="default" className="text-lg px-3 py-1">
                Open
              </Badge>
            </div>

            {/* Map */}
            {shop.shop_lat && shop.shop_lng && (
              <div className="mt-4">
                <LeafletMap
                  shops={[{
                    id: shop.id,
                    name: shop.shop_name,
                    lat: shop.shop_lat,
                    lng: shop.shop_lng,
                    category: shop.shop_category
                  }]}
                  height="300px"
                  showShops={true}
                  center={{ lat: shop.shop_lat, lng: shop.shop_lng }}
                  zoom={15}
                />
              </div>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Products */}
          <div className="lg:col-span-3">
            <h2 className="text-2xl font-bold text-[#2C3E50] mb-4">Menu</h2>
            {products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No products available at the moment</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {products.map(product => {
                  const quantity = getItemQuantity(product.id)
                  return (
                    <Card key={product.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg text-[#2C3E50] mb-1">
                              {product.product_name}
                            </h3>
                            <p className="text-gray-600 text-sm mb-2">{product.description}</p>
                            <div className="flex items-center space-x-2">
                              <span className="text-2xl font-bold text-[#16A085]">
                                ₹{product.price}
                              </span>
                              <Badge className="capitalize">{product.category}</Badge>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Stock: {product.stock_quantity}
                            </p>
                          </div>
                        </div>
                        
                        {quantity === 0 ? (
                          <Button
                            onClick={() => handleAddToCart(product)}
                            disabled={product.stock_quantity === 0}
                            className="w-full bg-[#16A085] hover:bg-[#16A085]/90"
                          >
                            {product.stock_quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
                          </Button>
                        ) : (
                          <div className="flex items-center justify-between">
                            <Button
                              onClick={() => handleUpdateQuantity(product.id, quantity - 1)}
                              variant="outline"
                              size="sm"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="font-semibold text-lg">{quantity}</span>
                            <Button
                              onClick={() => handleUpdateQuantity(product.id, quantity + 1)}
                              variant="outline"
                              size="sm"
                              disabled={quantity >= product.stock_quantity}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}

            {/* Rating System */}
            {user && (
              <div className="mt-8">
                <RatingSystem shopId={shopId!} existingRating={userRating} />
              </div>
            )}
          </div>

          {/* Cart Summary */}
          {getTotalItems() > 0 && (
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Your Cart ({getTotalItems()})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-4">
                    {items.map(item => (
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
                  
                  <hr className="my-4" />
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>₹{items.reduce((sum, item) => sum + item.price * item.quantity, 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery Fee:</span>
                      <span>₹40</span>
                    </div>
                    <hr />
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total:</span>
                      <span>₹{items.reduce((sum, item) => sum + item.price * item.quantity, 0) + 40}</span>
                    </div>
                  </div>

                  <Link to="/customer/checkout">
                    <Button className="w-full bg-[#16A085] hover:bg-[#16A085]/90" size="lg">
                      Proceed to Checkout
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ShopDetail
