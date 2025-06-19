
import React, { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface MapboxMapProps {
  onLocationSelect?: (lat: number, lng: number) => void
  showShops?: boolean
  shops?: Array<{
    id: string
    name: string
    lat: number
    lng: number
    category: string
  }>
  height?: string
}

const MapboxMap: React.FC<MapboxMapProps> = ({ 
  onLocationSelect, 
  showShops = false, 
  shops = [], 
  height = "400px" 
}) => {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [mapboxToken, setMapboxToken] = useState('')
  const [tokenInput, setTokenInput] = useState('')
  const [mapReady, setMapReady] = useState(false)

  const initializeMap = (token: string) => {
    if (!mapContainer.current || !token) return

    mapboxgl.accessToken = token
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [77.2090, 28.6139], // Default to Delhi
      zoom: 12,
    })

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')

    // Add click handler for location selection
    if (onLocationSelect) {
      map.current.on('click', (e) => {
        const { lng, lat } = e.lngLat
        onLocationSelect(lat, lng)
        
        // Add marker
        new mapboxgl.Marker()
          .setLngLat([lng, lat])
          .addTo(map.current!)
      })
    }

    setMapReady(true)
  }

  const handleTokenSubmit = () => {
    if (tokenInput.trim()) {
      setMapboxToken(tokenInput.trim())
      localStorage.setItem('mapbox_token', tokenInput.trim())
      initializeMap(tokenInput.trim())
    }
  }

  useEffect(() => {
    // Try to get token from localStorage first
    const savedToken = localStorage.getItem('mapbox_token')
    if (savedToken) {
      setMapboxToken(savedToken)
      initializeMap(savedToken)
    }

    return () => {
      if (map.current) {
        map.current.remove()
      }
    }
  }, [])

  // Add shop markers when shops data changes
  useEffect(() => {
    if (map.current && mapReady && showShops && shops.length > 0) {
      // Clear existing markers
      const existingMarkers = document.querySelectorAll('.mapboxgl-marker')
      existingMarkers.forEach(marker => marker.remove())

      // Add shop markers
      shops.forEach(shop => {
        const el = document.createElement('div')
        el.className = 'shop-marker'
        el.style.backgroundColor = shop.category === 'food' ? '#F39C12' 
          : shop.category === 'grocery' ? '#16A085' 
          : '#2C3E50'
        el.style.width = '12px'
        el.style.height = '12px'
        el.style.borderRadius = '50%'
        el.style.border = '2px solid white'

        const popup = new mapboxgl.Popup({ offset: 25 })
          .setHTML(`
            <div>
              <h3 style="margin: 0; font-weight: bold;">${shop.name}</h3>
              <p style="margin: 4px 0; text-transform: capitalize;">${shop.category}</p>
            </div>
          `)

        new mapboxgl.Marker(el)
          .setLngLat([shop.lng, shop.lat])
          .setPopup(popup)
          .addTo(map.current!)
      })
    }
  }, [mapReady, showShops, shops])

  if (!mapboxToken) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg" style={{ height }}>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Mapbox Integration Setup Required
          </h3>
          <p className="text-gray-600 mb-4">
            Please enter your Mapbox public token to enable maps functionality.
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Get your token from: <a href="https://mapbox.com/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">https://mapbox.com/</a>
          </p>
          <div className="flex gap-2 max-w-md mx-auto">
            <Input
              type="text"
              placeholder="Enter Mapbox public token"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
            />
            <Button onClick={handleTokenSubmit} className="bg-[#16A085] hover:bg-[#16A085]/90">
              Set Token
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

export default MapboxMap
