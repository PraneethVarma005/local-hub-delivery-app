
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useLocation } from '@/contexts/LocationContext'
import { supabase } from '@/lib/supabase'
import MapboxMap from '@/components/MapboxMap'
import { MapPin } from 'lucide-react'

interface Shop {
  id: string
  name: string
  category: 'food' | 'grocery' | 'medicine'
  rating: number
  delivery_time: string
  lat: number
  lng: number
  distance?: number
}

const CustomerDashboard = () => {
  const { location, address, getCurrentLocation } = useLocation()
  const [shops, setShops] = useState<Shop[]>([])
  const [filteredShops, setFilteredShops] = useState<Shop[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)

  // Mock shops data for demo
  const mockShops: Shop[] = [
    {
      id: '1',
      name: 'Fresh Mart Grocery',
      category: 'grocery',
      rating: 4.5,
      delivery_time: '20-30 min',
      lat: 28.6139 + (Math.random() - 0.5) * 0.1,
      lng: 77.2090 + (Math.random() - 0.5) * 0.1,
    },
    {
      id: '2',
      name: 'Pizza Corner',
      category: 'food',
      rating: 4.2,
      delivery_time: '25-35 min',
      lat: 28.6139 + (Math.random() - 0.5) * 0.1,
      lng: 77.2090 + (Math.random() - 0.5) * 0.1,
    },
    {
      id: '3',
      name: 'MedPlus Pharmacy',
      category: 'medicine',
      rating: 4.7,
      delivery_time: '15-25 min',
      lat: 28.6139 + (Math.random() - 0.5) * 0.1,
      lng: 77.2090 + (Math.random() - 0.5) * 0.1,
    },
    {
      id: '4',
      name: 'Burger House',
      category: 'food',
      rating: 4.0,
      delivery_time: '30-40 min',
      lat: 28.6139 + (Math.random() - 0.5) * 0.1,
      lng: 77.2090 + (Math.random() - 0.5) * 0.1,
    },
    {
      id: '5',
      name: 'Green Vegetables',
      category: 'grocery',
      rating: 4.3,
      delivery_time: '20-30 min',
      lat: 28.6139 + (Math.random() - 0.5) * 0.1,
      lng: 77.2090 + (Math.random() - 0.5) * 0.1,
    },
  ]

  useEffect(() => {
    setShops(mockShops)
    setFilteredShops(mockShops)
  }, [])

  useEffect(() => {
    let filtered = shops

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(shop => shop.category === selectedCategory)
    }

    if (searchQuery) {
      filtered = filtered.filter(shop => 
        shop.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredShops(filtered)
  }, [shops, selectedCategory, searchQuery])

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'food': return '🍕'
      case 'grocery': return '🥬'
      case 'medicine': return '💊'
      default: return '🏪'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'food': return 'bg-[#F39C12]'
      case 'grocery': return 'bg-[#16A085]'
      case 'medicine': return 'bg-[#2C3E50]'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F9F9] p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#2C3E50] mb-2">
            Find Nearby Shops
          </h1>
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="h-4 w-4" />
            <span>{address || 'Getting your location...'}</span>
            <Button 
              onClick={getCurrentLocation}
              variant="outline" 
              size="sm"
              className="ml-2"
            >
              Update Location
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Filters and Search */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Search & Filter</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Search shops..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                
                <div>
                  <h4 className="font-medium mb-2">Categories</h4>
                  <div className="space-y-2">
                    {['all', 'food', 'grocery', 'medicine'].map(category => (
                      <Button
                        key={category}
                        variant={selectedCategory === category ? 'default' : 'outline'}
                        className={`w-full justify-start ${
                          selectedCategory === category 
                            ? 'bg-[#16A085] hover:bg-[#16A085]/90' 
                            : ''
                        }`}
                        onClick={() => setSelectedCategory(category)}
                      >
                        {category !== 'all' && getCategoryIcon(category)} 
                        <span className="ml-2 capitalize">{category}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Map */}
            <Card>
              <CardHeader>
                <CardTitle>Nearby Shops</CardTitle>
              </CardHeader>
              <CardContent>
                <MapboxMap
                  showShops={true}
                  shops={filteredShops.map(shop => ({
                    id: shop.id,
                    name: shop.name,
                    lat: shop.lat,
                    lng: shop.lng,
                    category: shop.category
                  }))}
                  height="300px"
                />
              </CardContent>
            </Card>
          </div>

          {/* Shop List */}
          <div className="lg:col-span-2">
            <div className="grid gap-4">
              {filteredShops.map(shop => (
                <Card key={shop.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">{getCategoryIcon(shop.category)}</span>
                          <div>
                            <h3 className="font-semibold text-lg text-[#2C3E50]">
                              {shop.name}
                            </h3>
                            <Badge className={`${getCategoryColor(shop.category)} text-white`}>
                              {shop.category}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                          <span>⭐ {shop.rating}</span>
                          <span>🕒 {shop.delivery_time}</span>
                          <span>📍 2.5 km away</span>
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-4">
                          Fresh products, great prices, fast delivery to your doorstep.
                        </p>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <Button className="bg-[#16A085] hover:bg-[#16A085]/90">
                          View Menu
                        </Button>
                        <Button variant="outline">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {filteredShops.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <p className="text-gray-500">No shops found matching your criteria.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomerDashboard
