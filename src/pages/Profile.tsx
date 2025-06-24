
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { User, MapPin, Phone, Mail } from 'lucide-react'
import LeafletMap from '@/components/LeafletMap'
import { supabase } from '@/lib/supabase'

const Profile = () => {
  const { user, userRole } = useAuth()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [profileData, setProfileData] = useState({
    full_name: user?.user_metadata?.full_name || user?.user_metadata?.name || '',
    phone: user?.user_metadata?.phone || '',
    address: user?.user_metadata?.address || '',
    latitude: user?.user_metadata?.latitude || 0,
    longitude: user?.user_metadata?.longitude || 0
  })

  useEffect(() => {
    if (user?.user_metadata) {
      setProfileData({
        full_name: user.user_metadata.full_name || user.user_metadata.name || '',
        phone: user.user_metadata.phone || '',
        address: user.user_metadata.address || '',
        latitude: user.user_metadata.latitude || 0,
        longitude: user.user_metadata.longitude || 0
      })
    }
  }, [user])

  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    setProfileData(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      address: address
    }))
  }

  const handleSave = async () => {
    if (!user) return

    setLoading(true)
    try {
      // Update the user's metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          ...user.user_metadata,
          full_name: profileData.full_name,
          phone: profileData.phone,
          address: profileData.address,
          latitude: profileData.latitude,
          longitude: profileData.longitude
        }
      })

      if (authError) {
        throw authError
      }

      // Also update the user_profiles table if it exists
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({
          full_name: profileData.full_name,
          phone: profileData.phone,
          address: profileData.address,
          latitude: profileData.latitude,
          longitude: profileData.longitude,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      // Don't throw error if profile doesn't exist, just log it
      if (profileError) {
        console.warn('Profile update warning:', profileError)
      }

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      })
      setIsEditing(false)
    } catch (error) {
      console.error('Profile update error:', error)
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setProfileData({
      full_name: user?.user_metadata?.full_name || user?.user_metadata?.name || '',
      phone: user?.user_metadata?.phone || '',
      address: user?.user_metadata?.address || '',
      latitude: user?.user_metadata?.latitude || 0,
      longitude: user?.user_metadata?.longitude || 0
    })
    setIsEditing(false)
  }

  return (
    <div className="min-h-screen bg-[#F7F9F9] p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-[#2C3E50] mb-6">My Profile</h1>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700">{user?.email}</span>
                </div>
              </div>

              <div>
                <Label htmlFor="full_name">Full Name</Label>
                {isEditing ? (
                  <Input
                    id="full_name"
                    value={profileData.full_name}
                    onChange={(e) => setProfileData(prev => ({ ...prev, full_name: e.target.value }))}
                    placeholder="Enter your full name"
                  />
                ) : (
                  <div className="flex items-center gap-2 mt-1">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">{profileData.full_name || 'Not set'}</span>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                {isEditing ? (
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter your phone number"
                  />
                ) : (
                  <div className="flex items-center gap-2 mt-1">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">{profileData.phone || 'Not set'}</span>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="role">Role</Label>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#16A085] text-white">
                    {userRole?.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                {!isEditing ? (
                  <Button 
                    onClick={() => setIsEditing(true)}
                    className="bg-[#16A085] hover:bg-[#16A085]/90"
                    disabled={loading}
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <>
                    <Button 
                      onClick={handleSave}
                      className="bg-[#16A085] hover:bg-[#16A085]/90"
                      disabled={loading}
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button 
                      onClick={handleCancel}
                      variant="outline"
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Address & Location */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Address & Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="address">Address</Label>
                {isEditing ? (
                  <Textarea
                    id="address"
                    value={profileData.address}
                    onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Enter your address or click on the map"
                    rows={3}
                  />
                ) : (
                  <div className="flex items-start gap-2 mt-1">
                    <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                    <span className="text-gray-700">{profileData.address || 'Not set'}</span>
                  </div>
                )}
              </div>

              {isEditing && (
                <div>
                  <Label>Select Location on Map</Label>
                  <div className="mt-2">
                    <LeafletMap
                      onLocationSelect={handleLocationSelect}
                      selectedLocation={profileData.latitude && profileData.longitude ? 
                        { lat: profileData.latitude, lng: profileData.longitude } : undefined
                      }
                      height="300px"
                      showLocationPicker={true}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Click on the map to set your location
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Account Statistics */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Account Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <h3 className="text-2xl font-bold text-blue-600">12</h3>
                <p className="text-sm text-gray-600">Total Orders</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <h3 className="text-2xl font-bold text-green-600">5</h3>
                <p className="text-sm text-gray-600">Favorite Shops</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <h3 className="text-2xl font-bold text-purple-600">₹2,450</h3>
                <p className="text-sm text-gray-600">Total Spent</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Profile
