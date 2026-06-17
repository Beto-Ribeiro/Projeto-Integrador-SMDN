import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const SEVERITY_STYLE = {
  Crítico: { color: '#c60202', radius: 3800, opacity: 0.26 },
  Grave: { color: '#ff6a00', radius: 2700, opacity: 0.22 },
  Moderado: { color: '#cab900', radius: 1800, opacity: 0.18 },
}

function getSeverityStyle(severidade) {
  return SEVERITY_STYLE[severidade] || SEVERITY_STYLE.Moderado
}

function isValidCoord(value) {
  return typeof value === 'number' && Number.isFinite(value)
}

const MapView = forwardRef(function MapView(
  { ocorrencias = [], onMapClick, targetLocation, heatmap = false },
  ref
) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const occurrenceLayerRef = useRef(null)
  const heatLayerRef = useRef(null)
  const selectionMarkerRef = useRef(null)
  const selectionRingRef = useRef(null)

  useImperativeHandle(ref, () => ({
    flyTo(lat, lng, zoom = 15) {
      mapInstanceRef.current?.flyTo([lat, lng], zoom, { duration: 1.2 })
    }
  }))

  useEffect(() => {
    if (mapInstanceRef.current) return

    mapInstanceRef.current = L.map(mapRef.current, {
      zoomControl: true,
      attributionControl: true,
    }).setView([-23.5505, -46.6333], 10)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(mapInstanceRef.current)

    occurrenceLayerRef.current = L.layerGroup().addTo(mapInstanceRef.current)
    heatLayerRef.current = L.layerGroup().addTo(mapInstanceRef.current)

    mapInstanceRef.current.on('click', (e) => {
      const { lat, lng } = e.latlng
      placeSelectionMarker(lat, lng)
      if (onMapClick) onMapClick(lat, lng)
    })

    setTimeout(() => mapInstanceRef.current?.invalidateSize(), 200)

    return () => {
      mapInstanceRef.current?.remove()
      mapInstanceRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map || !occurrenceLayerRef.current || !heatLayerRef.current) return

    occurrenceLayerRef.current.clearLayers()
    heatLayerRef.current.clearLayers()

    const valid = ocorrencias.filter((item) => isValidCoord(item.lat) && isValidCoord(item.lng))

    valid.forEach((item) => {
      const style = getSeverityStyle(item.severidade)

      if (heatmap) {
        L.circle([item.lat, item.lng], {
          radius: style.radius,
          color: style.color,
          fillColor: style.color,
          fillOpacity: style.opacity,
          opacity: 0.35,
          weight: 1,
        })
          .bindPopup(`<b>${item.titulo || 'Ocorrência'}</b><br/>Severidade: ${item.severidade || 'Moderado'}`)
          .addTo(heatLayerRef.current)

        L.circleMarker([item.lat, item.lng], {
          radius: 5,
          fillColor: style.color,
          color: '#fff',
          weight: 1.5,
          fillOpacity: 0.95,
        })
          .bindPopup(`<b>${item.titulo || 'Ocorrência'}</b><br/>Severidade: ${item.severidade || 'Moderado'}`)
          .addTo(heatLayerRef.current)
      } else {
        L.circleMarker([item.lat, item.lng], {
          radius: 10,
          fillColor: style.color,
          color: '#fff',
          weight: 2,
          fillOpacity: 0.9,
        })
          .bindPopup(`<b>${item.titulo || 'Ocorrência'}</b><br/>Severidade: ${item.severidade || 'Moderado'}`)
          .addTo(occurrenceLayerRef.current)
      }
    })

    if (valid.length > 0) {
      const bounds = L.latLngBounds(valid.map((item) => [item.lat, item.lng]))
      map.fitBounds(bounds.pad(0.25), { maxZoom: 12, animate: true })
    }
  }, [ocorrencias, heatmap])

  useEffect(() => {
    if (!targetLocation || !mapInstanceRef.current) return

    if (isValidCoord(targetLocation.lat) && isValidCoord(targetLocation.lon)) {
      const zoom = targetLocation.neighborhood ? 14 : 12
      placeSelectionMarker(targetLocation.lat, targetLocation.lon)
      mapInstanceRef.current?.flyTo([targetLocation.lat, targetLocation.lon], zoom, { duration: 1.2 })
      return
    }

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

  function placeSelectionMarker(lat, lng) {
    const map = mapInstanceRef.current
    if (!map) return

    selectionMarkerRef.current?.remove()
    selectionRingRef.current?.remove()

    selectionRingRef.current = L.circleMarker([lat, lng], {
      radius: 22,
      fillColor: '#44769b',
      color: '#44769b',
      weight: 2,
      fillOpacity: 0.15,
      className: 'selection-ring'
    }).addTo(map)

    selectionMarkerRef.current = L.circleMarker([lat, lng], {
      radius: 10,
      fillColor: '#44769b',
      color: '#ffffff',
      weight: 2.5,
      fillOpacity: 0.95,
      className: 'selection-dot'
    }).addTo(map)

    selectionMarkerRef.current.bindPopup('<b>Área selecionada</b>').openPopup()

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
