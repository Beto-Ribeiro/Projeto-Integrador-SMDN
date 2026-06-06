import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const MapView = forwardRef(function MapView(
  { ocorrencias = [], onMapClick },
  ref
) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)

  // Expõe flyTo para o pai
  useImperativeHandle(ref, () => ({
    flyTo(lat, lng, zoom = 15) {
      mapInstanceRef.current?.flyTo([lat, lng], zoom, { duration: 1.2 })
    }
  }))

  useEffect(() => {
    if (mapInstanceRef.current) return
    mapInstanceRef.current = L.map(mapRef.current).setView([-23.5505, -46.6333], 10)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(mapInstanceRef.current)

    mapInstanceRef.current.on('click', (e) => {
      const { lat, lng } = e.latlng

      if (onMapClick) {
        onMapClick(lat, lng)
      }
    })

    ocorrencias.forEach(({ lat, lng, titulo, severidade }) => {
      const cor = severidade === 'Crítico' ? '#c60202' : severidade === 'Grave' ? '#ff6a00' : '#cab900'
      const marker = L.circleMarker([lat, lng], {
        radius: 10,
        fillColor: cor,
        color: '#fff',
        weight: 2,
        fillOpacity: 0.9
      }).addTo(mapInstanceRef.current)
      marker.bindPopup(`<b>${titulo}</b><br/>Severidade: ${severidade}`)
    })

    return () => {
      mapInstanceRef.current?.remove()
      mapInstanceRef.current = null
    }
  }, [])

  return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
})

export default MapView