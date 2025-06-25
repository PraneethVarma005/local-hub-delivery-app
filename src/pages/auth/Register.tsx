
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import CurrentLocationButton from '@/components/CurrentLocationButton'
import LeafletMap from '@/components/LeafletMap'
import PrivacyPolicyDialog from '@/components/PrivacyPolicyDialog'
import ReturnPolicyDialog from '@/components/ReturnPolicyDialog'

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'customer',
    name: '',
    phone: '',
    shop_name: '',
    shop_category: 'food',
    shop_address: '',
    shop_lat: 0,
    shop_lng: 0,
    latitude: 0,
    longitude: 0,
    vehicle_type: 'bicycle',
    privacy_policy_accepted: false,
    return_policy_accepted: false,
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

  const handleCheckboxChange = (field: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked
    }))
  }

  const handleLocationSelect = (lat: number, lng: number, address?: string) => {
    if (formData.role === 'shop_owner') {
      setFormData(prev => ({
        ...prev,
        shop_lat: lat,
        shop_lng: lng,
        shop_address: address || prev.shop_address
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        latitude: lat,
        longitude: lng
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

    if (formData.password.length < 6) {
      toast({
        title: 'Password too short',
        description: 'Password must be at least 6 characters long',
        variant: 'destructive',
      })
      return
    }

    if (!formData.privacy_policy_accepted) {
      toast({
        title: 'Privacy Policy Required',
        description: 'Please accept the Privacy Policy to continue',
        variant: 'destructive',
      })
      return
    }

    if (!formData.return_policy_accepted) {
      toast({
        title: 'Return Policy Required',
        description: 'Please accept the Return Policy to continue',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)

    try {
      const userData = {
        name: formData.name,
        full_name: formData.name,
        phone: formData.phone,
        role: formData.role,
        privacy_policy_accepted: formData.privacy_policy_accepted,
        return_policy_accepted: formData.return_policy_accepted,
        terms_accepted: true,
        ...(formData.role === 'shop_owner' && {
          shop_name: formData.shop_name,
          shop_category: formData.shop_category,
          shop_address: formData.shop_address,
          shop_lat: formData.shop_lat,
          shop_lng: formData.shop_lng,
        }),
        ...(formData.role === 'customer' && {
          latitude: formData.latitude,
          longitude: formData.longitude,
        }),
        ...(formData.role === 'delivery_partner' && {
          vehicle_type: formData.vehicle_type,
          latitude: formData.latitude,
          longitude: formData.longitude,
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
          description: 'Please check your email to verify your account, then you can login.',
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
    if (formData.role === 'shop_owner' && formData.shop_lat && formData.shop_lng) {
      return { lat: formData.shop_lat, lng: formData.shop_lng }
    }
    if ((formData.role === 'customer' || formData.role === 'delivery_partner') && formData.latitude && formData.longitude) {
      return { lat: formData.latitude, lng: formData.longitude }
    }
    return undefined
  }

  const isFormValid = formData.privacy_policy_accepted && formData.return_policy_accepted

  return (
    <div className="min-h-screen bg-[#F7F9F9] flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-[#2C3E50]">
            Register - LocalHub
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
                  placeholder="Enter your full name"
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
                  placeholder="Enter your phone"
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
                placeholder="Enter your email"
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
                  placeholder="Enter password (min 6 chars)"
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
                  placeholder="Confirm your password"
                />
              </div>
            </div>

            {formData.role === 'shop_owner' && (
              <>
                <div>
                  <Label htmlFor="shop_name">Shop Name</Label>
                  <Input
                    id="shop_name"
                    name="shop_name"
                    value={formData.shop_name}
                    onChange={handleInputChange}
                    required
                    className="mt-1"
                    placeholder="Enter your shop name"
                  />
                </div>
                <div>
                  <Label htmlFor="shop_category">Shop Category</Label>
                  <select
                    id="shop_category"
                    name="shop_category"
                    value={formData.shop_category}
                    onChange={handleInputChange}
                    className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#16A085] focus:border-transparent"
                  >
                    <option value="food">Food</option>
                    <option value="groceries">Groceries</option>
                    <option value="medicine">Medicine</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="shop_address">Shop Address</Label>
                  <Input
                    id="shop_address"
                    name="shop_address"
                    value={formData.shop_address}
                    onChange={handleInputChange}
                    required
                    className="mt-1"
                    placeholder="Enter your shop address"
                  />
                </div>
                <div>
                  <Label>Shop Location</Label>
                  <div className="mt-2 space-y-2">
                    <CurrentLocationButton onLocationSelect={handleLocationSelect} />
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

            {formData.role === 'delivery_partner' && (
              <>
                <div>
                  <Label htmlFor="vehicle_type">Vehicle Type</Label>
                  <select
                    id="vehicle_type"
                    name="vehicle_type"
                    value={formData.vehicle_type}
                    onChange={handleInputChange}
                    className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#16A085] focus:border-transparent"
                  >
                    <option value="bicycle">Bicycle</option>
                    <option value="motorcycle">Motorcycle</option>
                    <option value="car">Car</option>
                    <option value="scooter">Electric Scooter</option>
                  </select>
                </div>
                <div>
                  <Label>Your Location</Label>
                  <div className="mt-2 space-y-2">
                    <CurrentLocationButton onLocationSelect={handleLocationSelect} />
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
                  <CurrentLocationButton onLocationSelect={handleLocationSelect} />
                  <LeafletMap
                    onLocationSelect={handleLocationSelect}
                    selectedLocation={getSelectedLocation()}
                    height="200px"
                    showLocationPicker={true}
                  />
                </div>
              </div>
            )}

            {/* Privacy Policy and Return Policy Checkboxes */}
            <div className="space-y-3 border-t pt-4">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="privacy_policy"
                  checked={formData.privacy_policy_accepted}
                  onCheckedChange={(checked) => handleCheckboxChange('privacy_policy_accepted', checked as boolean)}
                />
                <div className="text-sm">
                  <span className="text-red-500">*</span>
                  <span> I agree to the </span>
                  <PrivacyPolicyDialog userType={formData.role as 'customer' | 'shop_owner' | 'delivery_partner'}>
                    <button
                      type="button"
                      className="text-[#16A085] hover:underline font-medium"
                    >
                      Privacy Policy
                    </button>
                  </PrivacyPolicyDialog>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="return_policy"
                  checked={formData.return_policy_accepted}
                  onCheckedChange={(checked) => handleCheckboxChange('return_policy_accepted', checked as boolean)}
                />
                <div className="text-sm">
                  <span className="text-red-500">*</span>
                  <span> I agree to the </span>
                  <ReturnPolicyDialog userType={formData.role as 'customer' | 'shop_owner' | 'delivery_partner'}>
                    <button
                      type="button"
                      className="text-[#16A085] hover:underline font-medium"
                    >
                      Return Policy
                    </button>
                  </ReturnPolicyDialog>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || !isFormValid}
              className={`w-full ${!isFormValid ? 'cursor-not-allowed opacity-50' : 'bg-[#16A085] hover:bg-[#16A085]/90'}`}
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
