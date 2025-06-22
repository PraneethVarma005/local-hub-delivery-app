
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { MapPin, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface LocationPickerProps {
  onLocationSelect: (lat: number, lng: number, address?: string) => void
  className?: string
}

const LocationPicker: React.FC<LocationPickerProps> = ({ onLocationSelect, className }) => {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const getCurrentLocation = () => {
    setLoading(true)
    
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation not supported",
        description: "Your browser doesn't support location services",
        variant: "destructive"
      })
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        console.log('Current location obtained:', latitude, longitude)
        
        // Simple address format (in production, you'd use a geocoding service)
        const address = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
        
        onLocationSelect(latitude, longitude, address)
        setLoading(false)
        
        toast({
          title: "Location obtained",
          description: "Your current location has been set successfully",
        })
      },
      (error) => {
        console.error('Geolocation error:', error)
        let errorMessage = "Unable to get your location"
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied. Please enable location permissions."
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable."
            break
          case error.TIMEOUT:
            errorMessage = "Location request timed out."
            break
        }
        
        toast({
          title: "Location Error",
          description: errorMessage,
          variant: "destructive"
        })
        setLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    )
  }

  return (
    <Button 
      onClick={getCurrentLocation}
      disabled={loading}
      variant="outline"
      className={className}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <MapPin className="h-4 w-4 mr-2" />
      )}
      {loading ? 'Getting location...' : 'Use Current Location'}
    </Button>
  )
}

export default LocationPicker
