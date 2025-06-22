
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import LocationPicker from '@/components/LocationPicker'
import LeafletMap from '@/components/LeafletMap'

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'customer',
    name: '',
    phone: '',
    // Shop owner specific
    shopName: '',
    shopCategory: 'food',
    shopAddress: '',
    shopLat: 0,
    shopLng: 0,
    // Customer location
    customerLat: 0,
    customerLng: 0,
    // Delivery partner specific
    vehicleType: 'bicycle',
    deliveryLat: 0,
    deliveryLng: 0,
  })
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleLocationSelect = (lat: number, lng: number, address?: string) => {
    if (formData.role === 'shop_owner') {
      setFormData(prev => ({
        ...prev,
        shopLat: lat,
        shopLng: lng,
        shopAddress: address || prev.shopAddress
      }))
    } else if (formData.role === 'customer') {
      setFormData(prev => ({
        ...prev,
        customerLat: lat,
        customerLng: lng
      }))
    } else if (formData.role === 'delivery_partner') {
      setFormData(prev => ({
        ...prev,
        deliveryLat: lat,
        deliveryLng: lng
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'Password mismatch',
        description: 'Passwords do not match',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)

    try {
      const userData = {
        name: formData.name,
        phone: formData.phone,
        role: formData.role,
        ...(formData.role === 'shop_owner' && {
          shop_name: formData.shopName,
          shop_category: formData.shopCategory,
          shop_address: formData.shopAddress,
          shop_lat: formData.shopLat,
          shop_lng: formData.shopLng,
        }),
        ...(formData.role === 'customer' && {
          latitude: formData.customerLat,
          longitude: formData.customerLng,
        }),
        ...(formData.role === 'delivery_partner' && {
          vehicle_type: formData.vehicleType,
          latitude: formData.deliveryLat,
          longitude: formData.deliveryLng,
        }),
      }

      const { error } = await signUp(formData.email, formData.password, userData)
      
      if (error) {
        toast({
          title: 'Registration failed',
          description: error.message,
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Account created successfully!',
          description: 'Please check your email to verify your account.',
        })
        
        navigate('/auth/login')
      }
    } catch (error) {
      toast({
        title: 'Registration failed',
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const getSelectedLocation = () => {
    if (formData.role === 'shop_owner' && formData.shopLat && formData.shopLng) {
      return { lat: formData.shopLat, lng: formData.shopLng }
    }
    if (formData.role === 'customer' && formData.customerLat && formData.customerLng) {
      return { lat: formData.customerLat, lng: formData.customerLng }
    }
    if (formData.role === 'delivery_partner' && formData.deliveryLat && formData.deliveryLng) {
      return { lat: formData.deliveryLat, lng: formData.deliveryLng }
    }
    return undefined
  }

  return (
    <div className="min-h-screen bg-[#F7F9F9] flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-[#2C3E50]">
            Join LocalHub
          </CardTitle>
          <p className="text-gray-600">Create your account</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="role">I am a</Label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#16A085] focus:border-transparent"
              >
                <option value="customer">Customer</option>
                <option value="shop_owner">Shop Owner</option>
                <option value="delivery_partner">Delivery Partner</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  className="mt-1"
                />
              </div>
            </div>

            {formData.role === 'shop_owner' && (
              <>
                <div>
                  <Label htmlFor="shopName">Shop Name</Label>
                  <Input
                    id="shopName"
                    name="shopName"
                    value={formData.shopName}
                    onChange={handleInputChange}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="shopCategory">Shop Category</Label>
                  <select
                    id="shopCategory"
                    name="shopCategory"
                    value={formData.shopCategory}
                    onChange={handleInputChange}
                    className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#16A085] focus:border-transparent"
                  >
                    <option value="food">Food</option>
                    <option value="grocery">Grocery</option>
                    <option value="medicine">Medicine</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="shopAddress">Shop Address</Label>
                  <Input
                    id="shopAddress"
                    name="shopAddress"
                    value={formData.shopAddress}
                    onChange={handleInputChange}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Shop Location</Label>
                  <div className="mt-2 space-y-2">
                    <LocationPicker onLocationSelect={handleLocationSelect} />
                    <LeafletMap
                      onLocationSelect={handleLocationSelect}
                      selectedLocation={getSelectedLocation()}
                      height="200px"
                      showLocationPicker={true}
                    />
                  </div>
                </div>
              </>
            )}

            {formData.role === 'customer' && (
              <div>
                <Label>Your Location (Optional)</Label>
                <div className="mt-2 space-y-2">
                  <LocationPicker onLocationSelect={handleLocationSelect} />
                  <LeafletMap
                    onLocationSelect={handleLocationSelect}
                    selectedLocation={getSelectedLocation()}
                    height="200px"
                    showLocationPicker={true}
                  />
                </div>
              </div>
            )}

            {formData.role === 'delivery_partner' && (
              <>
                <div>
                  <Label htmlFor="vehicleType">Vehicle Type</Label>
                  <select
                    id="vehicleType"
                    name="vehicleType"
                    value={formData.vehicleType}
                    onChange={handleInputChange}
                    className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#16A085] focus:border-transparent"
                  >
                    <option value="bicycle">Bicycle</option>
                    <option value="motorcycle">Motorcycle</option>
                    <option value="car">Car</option>
                  </select>
                </div>
                <div>
                  <Label>Your Location</Label>
                  <div className="mt-2 space-y-2">
                    <LocationPicker onLocationSelect={handleLocationSelect} />
                    <LeafletMap
                      onLocationSelect={handleLocationSelect}
                      selectedLocation={getSelectedLocation()}
                      height="200px"
                      showLocationPicker={true}
                    />
                  </div>
                </div>
              </>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#16A085] hover:bg-[#16A085]/90"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link
                to="/auth/login"
                className="text-[#16A085] hover:underline font-medium"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Register
