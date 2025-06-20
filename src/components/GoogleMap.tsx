
import React, { useEffect, useRef, useState } from 'react'

interface GoogleMapProps {
  onLocationSelect?: (lat: number, lng: number, address: string) => void
  selectedLocation?: { lat: number; lng: number }
  shops?: Array<{
    id: string
    name: string
    lat: number
    lng: number
    category?: string
  }>
  height?: string
  showLocationPicker?: boolean
  showShops?: boolean
  center?: { lat: number; lng: number }
  zoom?: number
}

const GoogleMap: React.FC<GoogleMapProps> = ({
  onLocationSelect,
  selectedLocation,
  shops = [],
  height = '400px',
  showLocationPicker = false,
  showShops = false,
  center,
  zoom = 13
}) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)

  useEffect(() => {
    // Load Google Maps API
    if (!window.google) {
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyC-YKM5cDuBNLtCuAvwrqRpL0V4__TRJGY&libraries=places`
      script.async = true
      script.defer = true
      script.onload = initializeMap
      document.head.appendChild(script)
    } else {
      initializeMap()
    }
  }, [])

  const initializeMap = () => {
    if (!mapRef.current) return

    // Use provided center or get user's current location
    if (center) {
      createMap(center)
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          setUserLocation(userPos)
          createMap(userPos)
        },
        () => {
          // Default to Delhi if geolocation fails
          const defaultPos = { lat: 28.6139, lng: 77.2090 }
          setUserLocation(defaultPos)
          createMap(defaultPos)
        }
      )
    }
  }

  const createMap = (mapCenter: { lat: number; lng: number }) => {
    const mapInstance = new google.maps.Map(mapRef.current!, {
      center: mapCenter,
      zoom: zoom,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    })

    setMap(mapInstance)

    // Add user location marker only if we have user location and no custom center
    if (!center && userLocation) {
      new google.maps.Marker({
        position: userLocation,
        map: mapInstance,
        title: 'Your Location',
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <circle cx="12" cy="12" r="4"/>
            </svg>
          `),
          scaledSize: new google.maps.Size(30, 30)
        }
      })
    }

    // Add shop markers
    if (showShops && shops.length > 0) {
      shops.forEach(shop => {
        const marker = new google.maps.Marker({
          position: { lat: shop.lat, lng: shop.lng },
          map: mapInstance,
          title: shop.name,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16A085" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9,22 9,12 15,12 15,22"/>
              </svg>
            `),
            scaledSize: new google.maps.Size(35, 35)
          }
        })

        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div>
              <h3 style="margin: 0 0 5px 0; color: #2C3E50;">${shop.name}</h3>
              <p style="margin: 0; color: #666; font-size: 12px; text-transform: capitalize;">${shop.category || 'Shop'}</p>
            </div>
          `
        })

        marker.addListener('click', () => {
          infoWindow.open(mapInstance, marker)
        })
      })
    }

    // Add click listener for location selection
    if (showLocationPicker && onLocationSelect) {
      let selectedMarker: google.maps.Marker | null = null

      mapInstance.addListener('click', async (event: google.maps.MapMouseEvent) => {
        if (event.latLng) {
          const lat = event.latLng.lat()
          const lng = event.latLng.lng()

          // Remove previous selected marker
          if (selectedMarker) {
            selectedMarker.setMap(null)
          }

          // Add new selected marker
          selectedMarker = new google.maps.Marker({
            position: { lat, lng },
            map: mapInstance,
            title: 'Delivery Location',
            icon: {
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E74C3C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              `),
              scaledSize: new google.maps.Size(40, 40)
            }
          })

          // Get address using reverse geocoding
          const geocoder = new google.maps.Geocoder()
          try {
            const result = await geocoder.geocode({ location: { lat, lng } })
            const address = result.results[0]?.formatted_address || `${lat.toFixed(6)}, ${lng.toFixed(6)}`
            onLocationSelect(lat, lng, address)
          } catch (error) {
            console.error('Geocoding error:', error)
            onLocationSelect(lat, lng, `${lat.toFixed(6)}, ${lng.toFixed(6)}`)
          }
        }
      })
    }

    // Show selected location if provided
    if (selectedLocation) {
      new google.maps.Marker({
        position: selectedLocation,
        map: mapInstance,
        title: 'Selected Location',
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E74C3C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          `),
          scaledSize: new google.maps.Size(40, 40)
        }
      })
    }
  }

  return (
    <div 
      ref={mapRef} 
      style={{ height, width: '100%' }} 
      className="rounded-lg border border-gray-200"
    />
  )
}

export default GoogleMap
