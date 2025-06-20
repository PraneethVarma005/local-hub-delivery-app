
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import GoogleMap from '@/components/GoogleMap'
import { supabase } from '@/lib/supabase'
import { useLocation } from '@/contexts/LocationContext'
import { MapPin, Clock, Star } from 'lucide-react'

interface Shop {
  id: string
  name: string
  description: string
  category: string
  image_url: string
  address: string
  latitude: number
  longitude: number
  phone: string
  is_open: boolean
  opening_time: string
  closing_time: string
  delivery_radius_km: number
  minimum_order_amount: number
  delivery_fee: number
  rating: number
  total_reviews: number
}

const ShopList = () => {
  const [shops, setShops] = useState<Shop[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null)
  const { location } = useLocation()
  const navigate = useNavigate()

  const categories = [
    { value: 'all', label: 'All Shops' },
    { value: 'food', label: 'Food' },
    { value: 'grocery', label: 'Grocery' },
    { value: 'medicine', label: 'Medicine' },
    { value: 'pharmacy', label: 'Pharmacy' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'clothing', label: 'Clothing' },
    { value: 'books', label: 'Books' },
    { value: 'other', label: 'Other' }
  ]

  useEffect(() => {
    fetchShops()
  }, [selectedCategory])

  const fetchShops = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('shops')
        .select('*')
        .eq('is_open', true)

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory)
      }

      const { data, error } = await query

      if (error) throw error
      setShops(data || [])
    } catch (error) {
      console.error('Error fetching shops:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateDistance = (shopLat: number, shopLng: number) => {
    if (!location) return null
    
    const R = 6371 // Earth's radius in km
    const dLat = (shopLat - location.lat) * Math.PI / 180
    const dLon = (shopLng - location.lng) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(location.lat * Math.PI / 180) * Math.cos(shopLat * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  const handleShopSelect = (shop: Shop) => {
    setSelectedShop(shop)
    navigate(`/customer/shop/${shop.id}`)
  }

  return (
    <div className="min-h-screen bg-[#F7F9F9] p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#2C3E50] mb-4">Local Shops</h1>
          
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map((category) => (
              <Button
                key={category.value}
                variant={selectedCategory === category.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.value)}
                className={selectedCategory === category.value ? "bg-[#16A085] hover:bg-[#16A085]/90" : ""}
              >
                {category.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Map */}
          <div className="order-2 lg:order-1">
            <GoogleMap
              showShops={true}
              shops={shops.map(shop => ({
                id: shop.id,
                name: shop.name,
                latitude: shop.latitude,
                longitude: shop.longitude,
                category: shop.category,
                address: shop.address,
                is_open: shop.is_open
              }))}
              height="600px"
              userLocation={location}
              onShopSelect={(shop) => {
                const fullShop = shops.find(s => s.id === shop.id)
                if (fullShop) setSelectedShop(fullShop)
              }}
            />
          </div>

          {/* Shops List */}
          <div className="order-1 lg:order-2">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Loading shops...</div>
              </div>
            ) : shops.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No shops found in this category.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {shops.map((shop) => {
                  const distance = calculateDistance(shop.latitude, shop.longitude)
                  
                  return (
                    <Card 
                      key={shop.id} 
                      className={`cursor-pointer transition-shadow hover:shadow-lg ${
                        selectedShop?.id === shop.id ? 'ring-2 ring-[#16A085]' : ''
                      }`}
                      onClick={() => handleShopSelect(shop)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg text-[#2C3E50]">{shop.name}</CardTitle>
                            {shop.description && (
                              <p className="text-sm text-gray-600 mt-1">{shop.description}</p>
                            )}
                          </div>
                          <Badge 
                            variant={shop.is_open ? "default" : "secondary"}
                            className={shop.is_open ? "bg-[#16A085]" : ""}
                          >
                            {shop.is_open ? 'Open' : 'Closed'}
                          </Badge>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pt-0">
                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="w-4 h-4 mr-2" />
                            {shop.address}
                            {distance && (
                              <span className="ml-2 text-[#16A085] font-medium">
                                ({distance.toFixed(1)} km away)
                              </span>
                            )}
                          </div>
                          
                          {shop.opening_time && shop.closing_time && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Clock className="w-4 h-4 mr-2" />
                              {shop.opening_time} - {shop.closing_time}
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-sm">
                              <Star className="w-4 h-4 mr-1 text-yellow-400 fill-current" />
                              <span>{shop.rating.toFixed(1)}</span>
                              <span className="text-gray-500 ml-1">({shop.total_reviews} reviews)</span>
                            </div>
                            
                            <div className="text-sm text-gray-600">
                              Min order: ₹{shop.minimum_order_amount}
                              {shop.delivery_fee > 0 && ` • Delivery: ₹${shop.delivery_fee}`}
                            </div>
                          </div>
                          
                          <Badge variant="outline" className="text-xs">
                            {shop.category}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ShopList
