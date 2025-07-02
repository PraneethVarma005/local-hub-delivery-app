import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Store, MapPin, Phone, Hash, FileText, Camera } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import LeafletMap from './LeafletMap'

interface ShopSetupFormProps {
  onShopCreated: () => void
}

const ShopSetupForm: React.FC<ShopSetupFormProps> = ({ onShopCreated }) => {
  const [formData, setFormData] = useState({
    shop_name: '',
    shop_address: '',
    contact_number: '',
    pin_code: '',
    description: '',
    shop_image: ''
  })
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null)
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    setCoordinates({ lat, lng })
    setFormData(prev => ({ ...prev, shop_address: address }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      const shopData = {
        ...formData,
        shop_owner_id: user.id,
        shop_lat: coordinates?.lat,
        shop_lng: coordinates?.lng
      }

      const { error } = await supabase
        .from('shops')
        .insert(shopData)

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Shop created successfully!'
      })
      
      onShopCreated()
    } catch (error) {
      console.error('Error creating shop:', error)
      toast({
        title: 'Error',
        description: 'Failed to create shop. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-[#16A085]/10 rounded-full flex items-center justify-center mb-4">
            <Store className="w-8 h-8 text-[#16A085]" />
          </div>
          <CardTitle className="text-2xl text-[#2C3E50]">Set Up Your Shop</CardTitle>
          <p className="text-gray-600">Let's get your shop ready for customers</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Store className="h-4 w-4" />
                  Shop Name
                </label>
                <Input
                  placeholder="Enter your shop name"
                  value={formData.shop_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, shop_name: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Contact Number
                </label>
                <Input
                  type="tel"
                  placeholder="Enter contact number"
                  value={formData.contact_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact_number: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Shop Address
              </label>
              <Textarea
                placeholder="Enter your shop address or click on map to select location"
                value={formData.shop_address}
                onChange={(e) => setFormData(prev => ({ ...prev, shop_address: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Location on Map</label>
              <div className="border rounded-lg overflow-hidden">
                <LeafletMap
                  height="300px"
                  showLocationPicker={true}
                  onLocationSelect={handleLocationSelect}
                  selectedLocation={coordinates}
                />
              </div>
              <p className="text-xs text-gray-500">Click on the map to set your shop location</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  Pin Code
                </label>
                <Input
                  placeholder="Enter pin code"
                  value={formData.pin_code}
                  onChange={(e) => setFormData(prev => ({ ...prev, pin_code: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  Shop Image URL
                </label>
                <Input
                  placeholder="Enter image URL (optional)"
                  value={formData.shop_image}
                  onChange={(e) => setFormData(prev => ({ ...prev, shop_image: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Description
              </label>
              <Textarea
                placeholder="Describe your shop, specialties, timings etc."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-[#16A085] hover:bg-[#16A085]/90"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating Shop...
                </div>
              ) : (
                <>
                  <Store className="h-4 w-4 mr-2" />
                  Create Shop
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default ShopSetupForm