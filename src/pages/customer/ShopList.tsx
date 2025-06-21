
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { MapPin, Clock, Star, Search } from 'lucide-react'
import LeafletMap from '@/components/LeafletMap'
import { mockShops, getShopsByCategory } from '@/data/mockShops'

const ShopList = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log('ShopList: Component mounted')
    console.log('ShopList: Mock shops data:', mockShops)
    
    // Simulate loading and data validation
    const initializeShops = async () => {
      try {
        // Small delay to simulate loading
        await new Promise(resolve => setTimeout(resolve, 500))
        
        if (!mockShops || mockShops.length === 0) {
          throw new Error('No shops data available')
        }
        
        console.log('ShopList: Data loaded successfully, shops count:', mockShops.length)
        setLoading(false)
      } catch (err) {
        console.error('ShopList: Error loading shops:', err)
        setError(err instanceof Error ? err.message : 'Failed to load shops')
        setLoading(false)
      }
    }

    initializeShops()
  }, [])

  const filteredShops = mockShops.filter(shop => {
    const matchesCategory = !selectedCategory || shop.category === selectedCategory
    const matchesSearch = !searchTerm || 
      shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shop.address.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const categories = [
    { id: '', name: 'All', count: mockShops.length },
    { id: 'food', name: 'Food', count: getShopsByCategory('food').length },
    { id: 'grocery', name: 'Grocery', count: getShopsByCategory('grocery').length },
    { id: 'medicine', name: 'Medicine', count: getShopsByCategory('medicine').length },
  ]

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
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#2C3E50] mb-2">Local Shops</h1>
          <p className="text-gray-600">Discover and order from local shops near you</p>
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
                name: shop.name,
                lat: shop.lat,
                lng: shop.lng,
                category: shop.category
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
                        shop.category === 'food' ? 'bg-orange-500' :
                        shop.category === 'grocery' ? 'bg-green-500' :
                        'bg-blue-500'
                      } text-white`}
                    >
                      {shop.category}
                    </Badge>
                    <Badge variant={shop.isOpen ? "default" : "secondary"}>
                      {shop.isOpen ? 'Open' : 'Closed'}
                    </Badge>
                  </div>
                  <CardTitle className="text-[#2C3E50] text-lg">{shop.name}</CardTitle>
                  <p className="text-sm text-gray-600">{shop.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-1" />
                      {shop.address}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-1" />
                      {shop.deliveryTime} • ₹{shop.deliveryFee} delivery
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 mr-1" />
                        <span className="text-sm font-medium">{shop.rating}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {shop.openTime} - {shop.closeTime}
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
            <p className="text-gray-500 text-lg">No shops found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ShopList
