
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { MapPin, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface CurrentLocationButtonProps {
  onLocationSelect: (lat: number, lng: number, address?: string) => void
  className?: string
}

const CurrentLocationButton: React.FC<CurrentLocationButtonProps> = ({ 
  onLocationSelect, 
  className = "" 
}) => {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      toast({
        title: 'Location not supported',
        description: 'Your browser does not support location services',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        
        try {
          // Reverse geocoding to get address
          const response = await fetch(
            `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=YOUR_OPENCAGE_API_KEY`
          )
          
          let address = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
          
          if (response.ok) {
            const data = await response.json()
            if (data.results && data.results[0]) {
              address = data.results[0].formatted
            }
          }
          
          onLocationSelect(latitude, longitude, address)
          toast({
            title: 'Location detected',
            description: 'Your current location has been set successfully',
          })
        } catch (error) {
          onLocationSelect(latitude, longitude)
          toast({
            title: 'Location detected',
            description: 'Your current location has been set successfully',
          })
        }
        
        setLoading(false)
      },
      (error) => {
        console.error('Geolocation error:', error)
        toast({
          title: 'Location access denied',
          description: 'Please allow location access to use this feature',
          variant: 'destructive',
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
      type="button"
      onClick={getCurrentLocation}
      disabled={loading}
      variant="outline"
      className={`flex items-center gap-2 ${className}`}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <MapPin className="h-4 w-4" />
      )}
      {loading ? 'Getting location...' : '📍 Use My Location'}
    </Button>
  )
}

export default CurrentLocationButton
