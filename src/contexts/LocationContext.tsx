
import React, { createContext, useContext, useEffect, useState } from 'react'

interface LocationContextType {
  location: { lat: number; lng: number } | null
  address: string | null
  loading: boolean
  error: string | null
  getCurrentLocation: () => Promise<void>
  setLocation: (lat: number, lng: number) => void
}

const LocationContext = createContext<LocationContextType | undefined>(undefined)

export const useLocation = () => {
  const context = useContext(LocationContext)
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider')
  }
  return context
}

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [location, setLocationState] = useState<{ lat: number; lng: number } | null>(null)
  const [address, setAddress] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getCurrentLocation = async () => {
    setLoading(true)
    setError(null)

    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by this browser')
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000,
        })
      })

      const { latitude, longitude } = position.coords
      setLocationState({ lat: latitude, lng: longitude })
      
      // Reverse geocoding would go here in a real app
      setAddress(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get location')
    } finally {
      setLoading(false)
    }
  }

  const setLocation = (lat: number, lng: number) => {
    setLocationState({ lat, lng })
    setAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`)
  }

  useEffect(() => {
    getCurrentLocation()
  }, [])

  const value = {
    location,
    address,
    loading,
    error,
    getCurrentLocation,
    setLocation,
  }

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>
}
