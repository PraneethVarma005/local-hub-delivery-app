
import React, { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface Shop {
  id: string
  name: string
  lat: number
  lng: number
  category: string
}

interface LeafletMapProps {
  shops?: Shop[]
  height?: string
  showShops?: boolean
  center?: { lat: number; lng: number }
  zoom?: number
  onLocationSelect?: (lat: number, lng: number, address: string) => void
  selectedLocation?: { lat: number; lng: number }
  showLocationPicker?: boolean
}

const LeafletMap: React.FC<LeafletMapProps> = ({
  shops = [],
  height = '400px',
  showShops = false,
  center = { lat: 28.6139, lng: 77.2090 }, // Delhi coordinates
  zoom = 13,
  onLocationSelect,
  selectedLocation,
  showLocationPicker = false
}) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.Marker[]>([])

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    // Initialize map
    const map = L.map(mapRef.current).setView([center.lat, center.lng], zoom)
    mapInstanceRef.current = map

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map)

    // Add click handler for location selection
    if (showLocationPicker && onLocationSelect) {
      map.on('click', async (e) => {
        const { lat, lng } = e.latlng
        
        // Clear existing markers
        markersRef.current.forEach(marker => marker.remove())
        markersRef.current = []
        
        // Add new marker
        const marker = L.marker([lat, lng]).addTo(map)
        markersRef.current.push(marker)
        
        // Get address (simplified - you could use a geocoding service)
        const address = `${lat.toFixed(6)}, ${lng.toFixed(6)}`
        onLocationSelect(lat, lng, address)
      })
    }

    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, [])

  // Update shops markers
  useEffect(() => {
    if (!mapInstanceRef.current || !showShops) return

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []

    // Add shop markers
    shops.forEach(shop => {
      const marker = L.marker([shop.lat, shop.lng])
        .addTo(mapInstanceRef.current!)
        .bindPopup(`<strong>${shop.name}</strong><br/>${shop.category}`)
      
      markersRef.current.push(marker)
    })
  }, [shops, showShops])

  // Update selected location marker
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedLocation) return

    // Clear existing markers if this is for location selection
    if (showLocationPicker) {
      markersRef.current.forEach(marker => marker.remove())
      markersRef.current = []
      
      // Add selected location marker
      const marker = L.marker([selectedLocation.lat, selectedLocation.lng])
        .addTo(mapInstanceRef.current!)
      
      markersRef.current.push(marker)
      
      // Center map on selected location
      mapInstanceRef.current.setView([selectedLocation.lat, selectedLocation.lng], zoom)
    }
  }, [selectedLocation, showLocationPicker])

  return (
    <div 
      ref={mapRef} 
      style={{ height, width: '100%', zIndex: 1 }}
      className="rounded-lg border"
    />
  )
}

export default LeafletMap
