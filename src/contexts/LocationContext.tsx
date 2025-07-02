
import React, { createContext, useContext, useState, useEffect } from 'react'

interface LocationContextType {
  userLocation: { lat: number; lng: number } | null
  setUserLocation: (location: { lat: number; lng: number }) => void
  loading: boolean
  error: string | null
  requestLocation: () => Promise<void>
}

const LocationContext = createContext<LocationContextType | undefined>(undefined)

export const useLocation = () => {
  const context = useContext(LocationContext)
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider')
  }
  return context
}

const LOCATION_CACHE_KEY = 'localhub_user_location'
const LOCATION_CACHE_DURATION = 1000 * 60 * 60 * 24 // 24 hours

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userLocation, setUserLocationState] = useState<{ lat: number; lng: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const setUserLocation = (location: { lat: number; lng: number }) => {
    setUserLocationState(location)
    // Cache location with timestamp
    const cacheData = {
      location,
      timestamp: Date.now()
    }
    localStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify(cacheData))
  }

  const requestLocation = async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser')
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    return new Promise<void>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          setUserLocation(newLocation)
          setLoading(false)
          resolve()
        },
        (error) => {
          console.log('Location access denied or failed:', error)
          let errorMessage = 'Unable to get your location'
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied. Please enable location services.'
              break
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable.'
              break
            case error.TIMEOUT:
              errorMessage = 'Location request timed out.'
              break
          }
          
          setError(errorMessage)
          setLoading(false)
          reject(error)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      )
    })
  }

  useEffect(() => {
    // Check for cached location first
    const checkCachedLocation = () => {
      try {
        const cached = localStorage.getItem(LOCATION_CACHE_KEY)
        if (cached) {
          const { location, timestamp } = JSON.parse(cached)
          const now = Date.now()
          
          // Use cached location if it's within the cache duration
          if (now - timestamp < LOCATION_CACHE_DURATION) {
            console.log('Using cached location:', location)
            setUserLocationState(location)
            setLoading(false)
            return true
          } else {
            // Clear expired cache
            localStorage.removeItem(LOCATION_CACHE_KEY)
          }
        }
      } catch (error) {
        console.error('Error reading cached location:', error)
        localStorage.removeItem(LOCATION_CACHE_KEY)
      }
      return false
    }

    // Try cached location first, then request fresh location
    if (!checkCachedLocation()) {
      requestLocation().catch(() => {
        // Location request failed, but app should still work
        console.log('Initial location request failed')
      })
    }
  }, [])

  return (
    <LocationContext.Provider value={{ 
      userLocation, 
      setUserLocation, 
      loading, 
      error, 
      requestLocation 
    }}>
      {children}
    </LocationContext.Provider>
  )
}
