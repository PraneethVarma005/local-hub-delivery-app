
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
  showCurrentLocationButton?: boolean
  onCurrentLocationUpdate?: (lat: number, lng: number) => void
  deliveryLocation?: { lat: number; lng: number }
  customerLocation?: { lat: number; lng: number }
}

const LeafletMap: React.FC<LeafletMapProps> = ({
  shops = [],
  height = '400px',
  showShops = false,
  center = { lat: 28.6139, lng: 77.2090 }, // Delhi coordinates
  zoom = 13,
  onLocationSelect,
  selectedLocation,
  showLocationPicker = false,
  showCurrentLocationButton = false,
  onCurrentLocationUpdate,
  deliveryLocation,
  customerLocation
}) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.Marker[]>([])
  const [currentLocation, setCurrentLocation] = React.useState<{ lat: number; lng: number } | null>(null)

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          setCurrentLocation(location)
          if (onCurrentLocationUpdate) {
            onCurrentLocationUpdate(location.lat, location.lng)
          }
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setView([location.lat, location.lng], 15)
          }
        },
        (error) => {
          console.error('Error getting location:', error)
        }
      )
    }
  }

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

  // Add delivery and customer location markers
  useEffect(() => {
    if (!mapInstanceRef.current) return

    // Create custom icons for different marker types
    const deliveryIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    })

    const customerIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    })

    const currentLocationIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    })

    // Clear existing markers for special locations
    markersRef.current = markersRef.current.filter(marker => {
      const popup = marker.getPopup()
      if (popup && (popup.getContent()?.toString().includes('Delivery') || 
                    popup.getContent()?.toString().includes('Customer') ||
                    popup.getContent()?.toString().includes('Current'))) {
        marker.remove()
        return false
      }
      return true
    })

    // Add delivery location marker
    if (deliveryLocation) {
      const marker = L.marker([deliveryLocation.lat, deliveryLocation.lng], { icon: deliveryIcon })
        .addTo(mapInstanceRef.current!)
        .bindPopup('<strong>Delivery Partner</strong>')
      markersRef.current.push(marker)
    }

    // Add customer location marker
    if (customerLocation) {
      const marker = L.marker([customerLocation.lat, customerLocation.lng], { icon: customerIcon })
        .addTo(mapInstanceRef.current!)
        .bindPopup('<strong>Customer Location</strong>')
      markersRef.current.push(marker)
    }

    // Add current location marker
    if (currentLocation) {
      const marker = L.marker([currentLocation.lat, currentLocation.lng], { icon: currentLocationIcon })
        .addTo(mapInstanceRef.current!)
        .bindPopup('<strong>Your Current Location</strong>')
      markersRef.current.push(marker)
    }
  }, [deliveryLocation, customerLocation, currentLocation])

  return (
    <div className="relative">
      <div 
        ref={mapRef} 
        style={{ height, width: '100%', zIndex: 1 }}
        className="rounded-lg border"
      />
      {showCurrentLocationButton && (
        <button
          onClick={getCurrentLocation}
          className="absolute top-2 right-2 z-10 bg-white border border-gray-300 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm"
        >
          📍 Use My Location
        </button>
      )}
    </div>
  )
}

export default LeafletMap
