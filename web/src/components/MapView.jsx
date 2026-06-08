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
  { ocorrencias = [], onMapClick, targetLocation },
  ref
) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const selectionMarkerRef = useRef(null)   // marcador da área selecionada
  const selectionRingRef = useRef(null)     // anel externo pulsante

  useImperativeHandle(ref, () => ({
    flyTo(lat, lng, zoom = 15) {
      mapInstanceRef.current?.flyTo([lat, lng], zoom, { duration: 1.2 })
    }
  }))

  // ── Inicializa o mapa uma única vez ───────────────────────────────────────
  useEffect(() => {
    if (mapInstanceRef.current) return

    mapInstanceRef.current = L.map(mapRef.current).setView([-23.5505, -46.6333], 10)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(mapInstanceRef.current)

    mapInstanceRef.current.on('click', (e) => {
      const { lat, lng } = e.latlng
      placeSelectionMarker(lat, lng)
      if (onMapClick) onMapClick(lat, lng)
    })

    ocorrencias.forEach(({ lat, lng, titulo, severidade }) => {
      const cor = severidade === 'Crítico' ? '#c60202'
                : severidade === 'Grave'   ? '#ff6a00'
                : '#cab900'
      const marker = L.circleMarker([lat, lng], {
        radius: 10, fillColor: cor, color: '#fff', weight: 2, fillOpacity: 0.9
      }).addTo(mapInstanceRef.current)
      marker.bindPopup(`<b>${titulo}</b><br/>Severidade: ${severidade}`)
    })

    return () => {
      mapInstanceRef.current?.remove()
      mapInstanceRef.current = null
    }
  }, [])

  // ── Quando targetLocation mudar, geocodifica e voa para lá ───────────────
  useEffect(() => {
    if (!targetLocation || !mapInstanceRef.current) return

    const query = [targetLocation.neighborhood, targetLocation.city]
      .filter(Boolean)
      .join(', ')

    if (!query) return

    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`)
      .then((r) => r.json())
      .then((results) => {
        if (!results.length) return
        const { lat, lon } = results[0]
        const zoom = targetLocation.neighborhood ? 14 : 12
        placeSelectionMarker(parseFloat(lat), parseFloat(lon))
        mapInstanceRef.current?.flyTo([lat, lon], zoom, { duration: 1.2 })
      })
      .catch(() => {})
  }, [targetLocation])

  // ── Coloca o círculo pulsante no mapa ────────────────────────────────────
  function placeSelectionMarker(lat, lng) {
    const map = mapInstanceRef.current
    if (!map) return

    // Remove marcadores anteriores
    selectionMarkerRef.current?.remove()
    selectionRingRef.current?.remove()

    // Anel externo (efeito de pulso via CSS injection)
    selectionRingRef.current = L.circleMarker([lat, lng], {
      radius: 22,
      fillColor: '#44769b',
      color: '#44769b',
      weight: 2,
      fillOpacity: 0.15,
      className: 'selection-ring'
    }).addTo(map)

    // Ponto central sólido
    selectionMarkerRef.current = L.circleMarker([lat, lng], {
      radius: 10,
      fillColor: '#44769b',
      color: '#ffffff',
      weight: 2.5,
      fillOpacity: 0.95,
      className: 'selection-dot'
    }).addTo(map)

    selectionMarkerRef.current.bindPopup('<b>Área selecionada</b>').openPopup()

    // Injeta animação CSS uma única vez
    if (!document.getElementById('selection-marker-style')) {
      const style = document.createElement('style')
      style.id = 'selection-marker-style'
      style.textContent = `
        .selection-ring {
          animation: ring-pulse 1.6s ease-out infinite;
        }
        @keyframes ring-pulse {
          0%   { opacity: 0.6; transform: scale(1); }
          70%  { opacity: 0;   transform: scale(1.8); }
          100% { opacity: 0;   transform: scale(1.8); }
        }
      `
      document.head.appendChild(style)
    }
  }

  return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
})

export default MapView