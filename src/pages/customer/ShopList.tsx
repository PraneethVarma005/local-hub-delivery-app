
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { MapPin, Clock, Star, Search } from 'lucide-react'
import LeafletMap from '@/components/LeafletMap'
import { useAuth } from '@/contexts/AuthContext'
import { useLocation } from '@/contexts/LocationContext'
import { supabase } from '@/lib/supabase'
import { calculateDistance, isWithinRadius } from '@/utils/distance'
import { useLanguage } from '@/hooks/useLanguage'
import LanguageSelector from '@/components/LanguageSelector'

const ShopList = () => {
  const [shops, setShops] = useState<any[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const { userLocation } = useLocation()
  const { t } = useLanguage()

  useEffect(() => {
    loadShops()
  }, [])

  const loadShops = async () => {
    try {
      console.log('Loading shops from database...')
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('role', 'shop_owner')
        .order('average_rating', { ascending: false })

      if (error) throw error

      console.log('Shops loaded:', data)
      setShops(data || [])
      setLoading(false)
    } catch (err) {
      console.error('Error loading shops:', err)
      setError(err instanceof Error ? err.message : 'Failed to load shops')
      setLoading(false)
    }
  }

  const filteredShops = shops.filter(shop => {
    // Filter by category
    const matchesCategory = !selectedCategory || shop.shop_category === selectedCategory
    
    // Filter by search term
    const matchesSearch = !searchTerm || 
      shop.shop_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shop.shop_address?.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Filter by location (within 10km radius)
    let matchesLocation = true
    if (userLocation && shop.shop_lat && shop.shop_lng) {
      matchesLocation = isWithinRadius(
        userLocation.lat,
        userLocation.lng,
        shop.shop_lat,
        shop.shop_lng,
        10
      )
    }
    
    return matchesCategory && matchesSearch && matchesLocation
  })

  const categories = [
    { id: '', name: 'All', count: shops.length },
    { id: 'food', name: 'Food', count: shops.filter(s => s.shop_category === 'food').length },
    { id: 'groceries', name: 'Groceries', count: shops.filter(s => s.shop_category === 'groceries').length },
    { id: 'medicine', name: 'Medicine', count: shops.filter(s => s.shop_category === 'medicine').length },
  ]

  const getDistanceText = (shop: any) => {
    if (!userLocation || !shop.shop_lat || !shop.shop_lng) return ''
    const distance = calculateDistance(
      userLocation.lat,
      userLocation.lng,
      shop.shop_lat,
      shop.shop_lng
    )
    return `${distance.toFixed(1)} km away`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F9F9] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#16A085] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading shops...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F7F9F9] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="bg-[#16A085] hover:bg-[#16A085]/90"
          >
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F7F9F9] p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-[#2C3E50] mb-2">{t('nearbyShops')}</h1>
            <p className="text-gray-600">Discover and order from local shops near you</p>
            {userLocation && (
              <p className="text-sm text-gray-500 mt-1">
                Showing shops within 10km of your location
              </p>
            )}
          </div>
          <LanguageSelector />
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t('search') + ' shops...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              onClick={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
              variant="outline"
            >
              {viewMode === 'list' ? 'Map View' : 'List View'}
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <Button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                variant={selectedCategory === category.id ? "default" : "outline"}
                className={selectedCategory === category.id ? "bg-[#16A085] hover:bg-[#16A085]/90" : ""}
              >
                {category.name} ({category.count})
              </Button>
            ))}
          </div>
        </div>

        {viewMode === 'map' ? (
          <div className="mb-6">
            <LeafletMap
              shops={filteredShops.map(shop => ({
                id: shop.id,
                name: shop.shop_name,
                lat: shop.shop_lat,
                lng: shop.shop_lng,
                category: shop.shop_category
              }))}
              height="500px"
              showShops={true}
            />
          </div>
        ) : null}

        {/* Shop List */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredShops.map(shop => (
            <Link key={shop.id} to={`/customer/shop/${shop.id}`}>
              <Card className="hover:shadow-lg cursor-pointer h-full">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between mb-2">
                    <Badge 
                      className={`${
                        shop.shop_category === 'food' ? 'bg-orange-500' :
                        shop.shop_category === 'groceries' ? 'bg-green-500' :
                        'bg-blue-500'
                      } text-white capitalize`}
                    >
                      {shop.shop_category}
                    </Badge>
                    <Badge variant="default">
                      Open
                    </Badge>
                  </div>
                  <CardTitle className="text-[#2C3E50] text-lg">{shop.shop_name}</CardTitle>
                  <p className="text-sm text-gray-600">{shop.full_name}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-1" />
                      {shop.shop_address}
                    </div>
                    {userLocation && shop.shop_lat && shop.shop_lng && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-1" />
                        {getDistanceText(shop)}
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 mr-1" />
                        <span className="text-sm font-medium">
                          {shop.average_rating || 'New'}
                        </span>
                        {shop.total_ratings && (
                          <span className="text-xs text-gray-500 ml-1">
                            ({shop.total_ratings})
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        9:00 AM - 9:00 PM
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {filteredShops.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {userLocation 
                ? 'No shops found within 10km of your location'
                : 'No shops found matching your criteria'
              }
            </p>
            {!userLocation && (
              <p className="text-gray-400 text-sm mt-2">
                Enable location access to see nearby shops
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ShopList
