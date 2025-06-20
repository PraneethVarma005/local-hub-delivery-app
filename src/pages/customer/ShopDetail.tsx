
import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, Clock, Star, ArrowLeft, Plus, Minus, ShoppingCart } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useCart } from '@/contexts/CartContext'
import GoogleMap from '@/components/GoogleMap'
import { getShopById, getProductsByShop } from '@/data/mockShops'

const ShopDetail = () => {
  const { shopId } = useParams<{ shopId: string }>()
  const { toast } = useToast()
  const { addToCart, items, updateQuantity, getTotalItems } = useCart()

  if (!shopId) {
    return <div>Shop not found</div>
  }

  const shop = getShopById(shopId)
  const products = getProductsByShop(shopId)

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

  const getItemQuantity = (productId: string) => {
    const item = items.find(item => item.id === productId)
    return item ? item.quantity : 0
  }

  const handleAddToCart = (product: any) => {
    addToCart({
      id: product.id,
      shopId: shop.id,
      name: product.name,
      price: product.price,
      image: product.image
    })
    
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart`,
    })
  }

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    updateQuantity(productId, newQuantity)
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
                  <h1 className="text-3xl font-bold text-[#2C3E50]">{shop.name}</h1>
                  <Badge 
                    className={`${
                      shop.category === 'food' ? 'bg-orange-500' :
                      shop.category === 'grocery' ? 'bg-green-500' :
                      'bg-blue-500'
                    } text-white`}
                  >
                    {shop.category}
                  </Badge>
                </div>
                <p className="text-gray-600 mb-2">{shop.description}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {shop.address}
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {shop.deliveryTime}
                  </div>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 mr-1" />
                    {shop.rating}
                  </div>
                </div>
              </div>
              <Badge variant={shop.isOpen ? "default" : "secondary"} className="text-lg px-3 py-1">
                {shop.isOpen ? 'Open' : 'Closed'}
              </Badge>
            </div>

            {/* Map */}
            <div className="mt-4">
              <GoogleMap
                shops={[shop]}
                height="300px"
                showShops={true}
                center={{ lat: shop.lat, lng: shop.lng }}
                zoom={15}
              />
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Products */}
          <div className="lg:col-span-3">
            <h2 className="text-2xl font-bold text-[#2C3E50] mb-4">Menu</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {products.map(product => {
                const quantity = getItemQuantity(product.id)
                return (
                  <Card key={product.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-[#2C3E50] mb-1">
                            {product.name}
                          </h3>
                          <p className="text-gray-600 text-sm mb-2">{product.description}</p>
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl font-bold text-[#16A085]">
                              ₹{product.price}
                            </span>
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-yellow-500 mr-1" />
                              <span className="text-sm">{product.rating}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {quantity === 0 ? (
                        <Button
                          onClick={() => handleAddToCart(product)}
                          disabled={!product.available}
                          className="w-full bg-[#16A085] hover:bg-[#16A085]/90"
                        >
                          {product.available ? 'Add to Cart' : 'Out of Stock'}
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
                      <span>₹{shop.deliveryFee}</span>
                    </div>
                    <hr />
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total:</span>
                      <span>₹{items.reduce((sum, item) => sum + item.price * item.quantity, 0) + shop.deliveryFee}</span>
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
