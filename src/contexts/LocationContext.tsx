
import React, { createContext, useContext, useState, useEffect } from 'react'

interface LocationContextType {
  userLocation: { lat: number; lng: number } | null
  setUserLocation: (location: { lat: number; lng: number }) => void
  loading: boolean
}

const LocationContext = createContext<LocationContextType | undefined>(undefined)

export const useLocation = () => {
  const context = useContext(LocationContext)
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider')
  }
  return context
}

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Try to get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
          setLoading(false)
        },
        (error) => {
          console.log('Location access denied or failed:', error)
          setLoading(false)
        }
      )
    } else {
      setLoading(false)
    }
  }, [])

  return (
    <LocationContext.Provider value={{ userLocation, setUserLocation, loading }}>
      {children}
    </LocationContext.Provider>
  )
}
