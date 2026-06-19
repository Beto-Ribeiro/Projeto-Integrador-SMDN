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
  Crítico: { color: '#c60202', radius: 2200, opacity: 0.11 },
  Grave: { color: '#ff6a00', radius: 1550, opacity: 0.09 },
  Moderado: { color: '#cab900', radius: 1050, opacity: 0.075 },
}

function getSeverityStyle(severidade) {
  return SEVERITY_STYLE[severidade] || SEVERITY_STYLE.Moderado
}

function isValidCoord(value) {
  return typeof value === 'number' && Number.isFinite(value)
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}


function createOccurrencePopupNode(item, onOccurrenceDetails) {
  const wrapper = document.createElement('div')
  wrapper.className = 'smdn-map-popup'

  const title = document.createElement('strong')
  title.textContent = item.titulo || 'Ocorrência'
  wrapper.appendChild(title)

  const severity = document.createElement('div')
  severity.textContent = `Severidade: ${item.severidade || 'Moderado'}`
  wrapper.appendChild(severity)

  if (onOccurrenceDetails) {
    const details = document.createElement('button')
    details.type = 'button'
    details.textContent = 'Ver detalhes'
    details.className = 'smdn-map-details-link'
    details.addEventListener('click', (event) => {
      event.preventDefault()
      event.stopPropagation()
      onOccurrenceDetails(item)
    })
    wrapper.appendChild(details)
  }

  return wrapper
}


function createVictimPopupNode(item, onVictimAssistance, savingVictimId) {
  const wrapper = document.createElement('div')
  wrapper.className = 'smdn-map-popup smdn-victim-popup'

  const title = document.createElement('strong')
  title.textContent = item.name || 'Vítima localizada'
  wrapper.appendChild(title)

  const source = item.source === 'localizacao_dispositivo'
    ? 'Localização do dispositivo'
    : 'Último relato com localização'

  const sourceLine = document.createElement('div')
  sourceLine.textContent = source
  wrapper.appendChild(sourceLine)

  const status = document.createElement('div')
  const attended = item.assistanceStatus === 'atendida'
  status.innerHTML = `<b>Status:</b> ${attended ? 'Atendida / socorrida' : 'Pendente de atendimento'}`
  status.className = attended ? 'smdn-victim-status smdn-victim-status-ok' : 'smdn-victim-status smdn-victim-status-pending'
  wrapper.appendChild(status)

  if (!attended && onVictimAssistance) {
    const action = document.createElement('button')
    action.type = 'button'
    action.textContent = savingVictimId === item.id ? 'Salvando...' : 'Marcar como atendida'
    action.disabled = savingVictimId === item.id
    action.className = 'smdn-map-details-link smdn-victim-action'
    action.addEventListener('click', (event) => {
      event.preventDefault()
      event.stopPropagation()
      onVictimAssistance(item)
    })
    wrapper.appendChild(action)
  }

  return wrapper
}

const MapView = forwardRef(function MapView(
  { ocorrencias = [], vitimas = [], onMapClick, onOccurrenceDetails, onVictimAssistance, savingVictimId, targetLocation, heatmap = false, mapMode },
  ref
) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const occurrenceLayerRef = useRef(null)
  const heatLayerRef = useRef(null)
  const victimLayerRef = useRef(null)
  const selectionMarkerRef = useRef(null)
  const selectionRingRef = useRef(null)

  const effectiveMode = mapMode || (heatmap ? 'heat' : 'points')
  const showOccurrences = effectiveMode !== 'victims'
  const showHeat = effectiveMode === 'heat'

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

    mapInstanceRef.current.attributionControl.setPrefix(false)

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      crossOrigin: true,
    }).addTo(mapInstanceRef.current)

    if (!mapInstanceRef.current.getPane('smdnHeatPane')) {
      mapInstanceRef.current.createPane('smdnHeatPane')
      mapInstanceRef.current.getPane('smdnHeatPane').style.zIndex = 350
      mapInstanceRef.current.getPane('smdnHeatPane').style.pointerEvents = 'none'
    }

    occurrenceLayerRef.current = L.layerGroup().addTo(mapInstanceRef.current)
    heatLayerRef.current = L.layerGroup().addTo(mapInstanceRef.current)
    victimLayerRef.current = L.layerGroup().addTo(mapInstanceRef.current)

    mapInstanceRef.current.on('click', (e) => {
      const { lat, lng } = e.latlng
      placeSelectionMarker(lat, lng)
      if (onMapClick) onMapClick(lat, lng)
    })

    if (!document.getElementById('smdn-heatmap-style')) {
      const style = document.createElement('style')
      style.id = 'smdn-heatmap-style'
      style.textContent = `
        .smdn-map-root,
        .smdn-map-root .leaflet-container {
          width: 100%;
          height: 100%;
          background: #dbe6ed;
          outline: none;
        }

        .smdn-map-root .leaflet-control-attribution {
          right: 8px;
          bottom: 8px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.58);
          backdrop-filter: blur(8px);
          padding: 2px 7px;
          color: #64748b;
          font-size: 9px;
          line-height: 1.25;
          box-shadow: 0 6px 18px rgba(15, 23, 42, 0.08);
          opacity: 0.62;
          transition: opacity 0.2s ease, background 0.2s ease;
        }

        .smdn-map-root .leaflet-control-attribution:hover,
        .smdn-map-root .leaflet-control-attribution:focus-within {
          opacity: 1;
          background: rgba(255, 255, 255, 0.92);
        }

        .smdn-map-root .leaflet-control-attribution a {
          color: #475569;
          text-decoration: none;
        }

        .smdn-map-root .leaflet-control-zoom {
          border: 0;
          box-shadow: 0 10px 24px rgba(15, 23, 42, 0.12);
        }

        .smdn-map-root .leaflet-control-zoom a {
          border: 0;
          color: #09162e;
        }

        .smdn-map-root .leaflet-control-zoom a:focus-visible {
          outline: 3px solid #0ea5e9;
          outline-offset: 2px;
        }

        .smdn-map-root .leaflet-control-zoom a:first-child {
          border-bottom: 1px solid #e2e8f0;
        }

        .smdn-heat-circle {
          mix-blend-mode: multiply;
          filter: blur(1px);
        }

        .smdn-victim-marker {
          filter: drop-shadow(0 2px 5px rgba(15, 23, 42, 0.35));
        }

        .smdn-victim-status {
          margin-top: 5px;
          font-size: 12px;
        }

        .smdn-victim-status-ok {
          color: #16a34a;
        }

        .smdn-victim-status-pending {
          color: #b45309;
        }

        .smdn-victim-action:disabled {
          opacity: 0.6;
          cursor: wait;
        }

        .smdn-map-details-link {
          display: inline-block;
          margin-top: 6px;
          padding: 0;
          border: 0;
          background: transparent;
          color: #0b63a6;
          font: inherit;
          font-weight: 700;
          text-decoration: underline;
          cursor: pointer;
        }

        .smdn-map-details-link:focus-visible {
          outline: 2px solid #0ea5e9;
          outline-offset: 2px;
          border-radius: 4px;
        }
      `
      document.head.appendChild(style)
    }

    setTimeout(() => mapInstanceRef.current?.invalidateSize(), 200)

    return () => {
      mapInstanceRef.current?.remove()
      mapInstanceRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map || !occurrenceLayerRef.current || !heatLayerRef.current || !victimLayerRef.current) return

    occurrenceLayerRef.current.clearLayers()
    heatLayerRef.current.clearLayers()
    victimLayerRef.current.clearLayers()

    const validOccurrences = ocorrencias.filter((item) => isValidCoord(item.lat) && isValidCoord(item.lng))
    const validVictims = vitimas.filter((item) => isValidCoord(item.lat) && isValidCoord(item.lng))

    if (showOccurrences) {
      validOccurrences.forEach((item) => {
        const style = getSeverityStyle(item.severidade)
        const popup = createOccurrencePopupNode(item, onOccurrenceDetails)

        if (showHeat) {
          L.circle([item.lat, item.lng], {
            pane: 'smdnHeatPane',
            radius: style.radius,
            stroke: false,
            fillColor: style.color,
            fillOpacity: style.opacity,
            interactive: false,
            className: 'smdn-heat-circle',
          })
            .bindPopup(popup)
            .addTo(heatLayerRef.current)

          L.circleMarker([item.lat, item.lng], {
            radius: 5,
            fillColor: style.color,
            color: '#fff',
            weight: 1.5,
            fillOpacity: 0.9,
          })
            .bindPopup(popup)
            .addTo(heatLayerRef.current)
        } else {
          L.circleMarker([item.lat, item.lng], {
            radius: 10,
            fillColor: style.color,
            color: '#fff',
            weight: 2,
            fillOpacity: 0.9,
          })
            .bindPopup(popup)
            .addTo(occurrenceLayerRef.current)
        }
      })
    }

    validVictims.forEach((item) => {
      const attended = item.assistanceStatus === 'atendida'
      const popup = createVictimPopupNode(item, onVictimAssistance, savingVictimId)

      L.circleMarker([item.lat, item.lng], {
        radius: attended ? 8 : 7,
        fillColor: attended ? '#16a34a' : '#020617',
        color: '#ffffff',
        weight: 2,
        fillOpacity: 0.95,
        className: 'smdn-victim-marker',
      })
        .bindPopup(popup)
        .addTo(victimLayerRef.current)
    })

    const visiblePoints = effectiveMode === 'victims'
      ? validVictims
      : [...validOccurrences, ...validVictims]

    if (visiblePoints.length > 0) {
      const bounds = L.latLngBounds(visiblePoints.map((item) => [item.lat, item.lng]))
      map.fitBounds(bounds.pad(0.25), { maxZoom: 12, animate: true })
    }
  }, [ocorrencias, vitimas, effectiveMode, showOccurrences, showHeat, onOccurrenceDetails, onVictimAssistance, savingVictimId])

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

  }

  return <div ref={mapRef} className="smdn-map-root" />
})

export default MapView
