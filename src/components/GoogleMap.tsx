
import React, { useEffect, useRef, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface Shop {
  id: string
  name: string
  latitude: number
  longitude: number
  category: string
  address: string
  is_open: boolean
}

interface GoogleMapProps {
  onLocationSelect?: (lat: number, lng: number, address?: string) => void
  showShops?: boolean
  shops?: Shop[]
  height?: string
  center?: { lat: number; lng: number }
  userLocation?: { lat: number; lng: number }
  onShopSelect?: (shop: Shop) => void
}

const GoogleMap: React.FC<GoogleMapProps> = ({ 
  onLocationSelect, 
  showShops = false, 
  shops = [], 
  height = "400px",
  center,
  userLocation,
  onShopSelect
}) => {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<google.maps.Map | null>(null)
  const [apiKey, setApiKey] = useState('AIzaSyC-YKM5cDuBNLtCuAvwrqRpL0V4__TRJGY')
  const [tokenInput, setTokenInput] = useState('')
  const [mapReady, setMapReady] = useState(false)
  const [scriptLoaded, setScriptLoaded] = useState(false)
  const markersRef = useRef<google.maps.Marker[]>([])

  const loadGoogleMapsScript = () => {
    if (window.google && window.google.maps) {
      setScriptLoaded(true)
      return
    }

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
    script.async = true
    script.defer = true
    script.onload = () => setScriptLoaded(true)
    script.onerror = () => console.error('Failed to load Google Maps script')
    document.head.appendChild(script)
  }

  const initializeMap = () => {
    if (!mapContainer.current || !window.google || !apiKey) return

    const defaultCenter = center || userLocation || { lat: 28.6139, lng: 77.2090 } // Delhi

    map.current = new google.maps.Map(mapContainer.current, {
      center: defaultCenter,
      zoom: 13,
      styles: [
        {
          featureType: "poi.business",
          stylers: [{ visibility: "off" }]
        }
      ]
    })

    // Add click handler for location selection
    if (onLocationSelect) {
      map.current.addListener('click', (e: google.maps.MapMouseEvent) => {
        const lat = e.latLng?.lat()
        const lng = e.latLng?.lng()
        if (lat && lng) {
          onLocationSelect(lat, lng)
          
          // Add marker
          new google.maps.Marker({
            position: { lat, lng },
            map: map.current,
            title: 'Selected Location'
          })
        }
      })
    }

    // Add user location marker if available
    if (userLocation) {
      new google.maps.Marker({
        position: userLocation,
        map: map.current,
        title: 'Your Location',
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="8" fill="#3B82F6" stroke="white" stroke-width="2"/>
            </svg>
          `),
          scaledSize: new google.maps.Size(20, 20)
        }
      })
    }

    setMapReady(true)
  }

  const clearMarkers = () => {
    markersRef.current.forEach(marker => marker.setMap(null))
    markersRef.current = []
  }

  const addShopMarkers = () => {
    if (!map.current || !showShops || shops.length === 0) return

    clearMarkers()

    shops.forEach(shop => {
      const marker = new google.maps.Marker({
        position: { lat: shop.latitude, lng: shop.longitude },
        map: map.current,
        title: shop.name,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="${shop.is_open ? '#16A085' : '#95A5A6'}" stroke="white" stroke-width="2"/>
              <circle cx="12" cy="9" r="2.5" fill="white"/>
            </svg>
          `),
          scaledSize: new google.maps.Size(32, 32)
        }
      })

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; max-width: 200px;">
            <h3 style="margin: 0 0 4px 0; font-weight: bold;">${shop.name}</h3>
            <p style="margin: 0 0 4px 0; text-transform: capitalize; color: #666;">${shop.category}</p>
            <p style="margin: 0 0 8px 0; font-size: 12px; color: #666;">${shop.address}</p>
            <span style="display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 12px; background: ${shop.is_open ? '#16A085' : '#95A5A6'}; color: white;">
              ${shop.is_open ? 'Open' : 'Closed'}
            </span>
          </div>
        `
      })

      marker.addListener('click', () => {
        infoWindow.open(map.current, marker)
        if (onShopSelect) {
          onShopSelect(shop)
        }
      })

      markersRef.current.push(marker)
    })
  }

  useEffect(() => {
    if (apiKey) {
      loadGoogleMapsScript()
    }
  }, [apiKey])

  useEffect(() => {
    if (scriptLoaded) {
      initializeMap()
    }
  }, [scriptLoaded, center, userLocation])

  useEffect(() => {
    if (mapReady) {
      addShopMarkers()
    }
  }, [mapReady, showShops, shops])

  const handleTokenSubmit = () => {
    if (tokenInput.trim()) {
      setApiKey(tokenInput.trim())
      localStorage.setItem('google_maps_key', tokenInput.trim())
    }
  }

  if (!apiKey) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg" style={{ height }}>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Google Maps Setup Required
          </h3>
          <p className="text-gray-600 mb-4">
            Please enter your Google Maps API key to enable maps functionality.
          </p>
          <div className="flex gap-2 max-w-md mx-auto">
            <Input
              type="text"
              placeholder="Enter Google Maps API key"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
            />
            <Button onClick={handleTokenSubmit} className="bg-[#16A085] hover:bg-[#16A085]/90">
              Set Key
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      <div ref={mapContainer} style={{ height, width: '100%' }} className="rounded-lg" />
      {onLocationSelect && (
        <div className="absolute top-2 left-2 bg-white p-2 rounded shadow text-sm">
          Click on the map to select location
        </div>
      )}
    </div>
  )
}

export default GoogleMap
