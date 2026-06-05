import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Corrige ícones padrão do Leaflet no Vite/React
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

export default function MapView({ ocorrencias = [] }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)

  useEffect(() => {
    if (mapInstanceRef.current) return // evita duplicar

    mapInstanceRef.current = L.map(mapRef.current).setView([-23.5505, -46.6333], 10) // SP

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(mapInstanceRef.current)

    // Adiciona marcadores das ocorrências
    ocorrencias.forEach(({ lat, lng, titulo, severidade }) => {
      const cor = severidade === 'Crítico' ? 'red' : severidade === 'Grave' ? 'orange' : 'yellow'
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
}