
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { MapPin, Clock, Star, Search, RefreshCw } from 'lucide-react'
import LeafletMap from '@/components/LeafletMap'
import { useAuth } from '@/contexts/AuthContext'
import { useLocation } from '@/contexts/LocationContext'
import { supabase } from '@/lib/supabase'
import { calculateDistance, isWithinRadius } from '@/utils/distance'
import { useToast } from '@/hooks/use-toast'

const ShopList = () => {
  const [shops, setShops] = useState<any[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user, loading: authLoading } = useAuth()
  const { userLocation, loading: locationLoading } = useLocation()
  
  const { toast } = useToast()

  useEffect(() => {
    // Only load shops when auth and location are ready
    if (!authLoading && !locationLoading) {
      loadShops()
    }
  }, [authLoading, locationLoading])

  const loadShops = async () => {
    try {
      console.log('Loading shops from database...')
      setLoading(true)
      setError(null)
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('role', 'shop_owner')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading shops:', error)
        throw error
      }

      console.log('Shops loaded:', data?.length || 0, 'shops')
      setShops(data || [])
      
      if (!data || data.length === 0) {
        console.log('No shops found in database')
      }
      
    } catch (err) {
      console.error('Exception loading shops:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to load shops'
      setError(errorMessage)
      
      toast({
        title: 'Error Loading Shops',
        description: 'Unable to load shops, please try again later',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const retryLoadShops = () => {
    loadShops()
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

  if (authLoading || locationLoading) {
    return (
      <div className="min-h-screen bg-[#F7F9F9] dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#16A085] mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">
            {authLoading ? 'Checking authentication...' : 'Getting your location...'}
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F9F9] dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#16A085] mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading shops...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F7F9F9] dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Unable to load shops</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {error === 'Failed to load shops' ? 'Unable to load shops, please try again later' : error}
          </p>
          <Button 
            onClick={retryLoadShops} 
            className="bg-[#16A085] hover:bg-[#16A085]/90"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F7F9F9] dark:bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-[#2C3E50] dark:text-white mb-2">Nearby Shops</h1>
            <p className="text-gray-600 dark:text-gray-300">Discover and order from local shops near you</p>
            {userLocation && (
              <p className="text-sm text-gray-500 mt-1">
                Showing shops within 10km of your location
              </p>
            )}
          </div>
          
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search shops..."
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
              <Card className="hover:shadow-lg cursor-pointer h-full transition-shadow">
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
                  <CardTitle className="text-[#2C3E50] dark:text-white text-lg">{shop.shop_name}</CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{shop.full_name}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="h-4 w-4 mr-1" />
                      {shop.shop_address}
                    </div>
                    {userLocation && shop.shop_lat && shop.shop_lng && (
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
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

        {filteredShops.length === 0 && shops.length > 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No shops found matching your criteria
            </p>
            <Button 
              onClick={() => {
                setSelectedCategory('')
                setSearchTerm('')
              }}
              variant="outline"
              className="mt-4"
            >
              Clear Filters
            </Button>
          </div>
        )}

        {shops.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-6">
              <svg className="w-20 h-20 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No shops available</h3>
            <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">
              No shops available in your area
            </p>
            <Button 
              onClick={retryLoadShops} 
              className="bg-[#16A085] hover:bg-[#16A085]/90"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ShopList
