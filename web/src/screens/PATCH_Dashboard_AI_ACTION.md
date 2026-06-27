# Ajuste recomendado em `web/src/screens/Dashboard.jsx`

Procure este bloco dentro de `handleAiOpenOccurrence`:

```jsx
if (occurrence) {
  setRecentMinimized(false)
  handleOccClick(occurrence)
}
```

Troque por:

```jsx
if (occurrence) {
  setMapMode(normalizeMapMode(detail.mapMode || 'heat'))
  setRecentMinimized(false)
  setStatsMinimized(false)
  handleOccClick(occurrence)

  if (Number.isFinite(occurrence.lat) && Number.isFinite(occurrence.lng)) {
    window.setTimeout(() => {
      mapRef.current?.flyTo(occurrence.lat, occurrence.lng, Number(detail.zoom) || 16)
    }, 180)
  }
}
```

Esse trecho faz a action da IA abrir a ocorrência, ativar mapa de calor e aproximar o mapa.
