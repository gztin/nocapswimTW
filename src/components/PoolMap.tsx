import { LocateFixed } from 'lucide-react'
import { Map as MapLibreMap, Marker, NavigationControl, type StyleSpecification } from 'maplibre-gl'
import { useEffect, useRef, useState } from 'react'
import type { PoolLocation } from '../types/location'
import { LocationDetail } from './LocationDetail'

interface PoolMapProps {
  locations: PoolLocation[]
  selectedLocation?: PoolLocation | null
  onSelectLocation: (location: PoolLocation) => void
  onViewDetails: (location: PoolLocation) => void
  onCloseSelection: () => void
}

const mapStyle: StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      maxzoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap contributors</a>',
    },
  },
  layers: [{ id: 'osm-basemap', type: 'raster', source: 'osm' }],
}

function markerClassName(location: PoolLocation) {
  return `map-marker map-marker--${location.capPolicy}`
}

function createMarkers(
  map: MapLibreMap,
  locations: PoolLocation[],
  onSelectLocation: (location: PoolLocation) => void,
) {
  return locations.flatMap((location) => {
    if (location.latitude === null || location.longitude === null) return []
    const { latitude, longitude } = location
    const element = document.createElement('button')
    element.type = 'button'
    element.className = markerClassName(location)
    element.setAttribute('aria-label', `選取${location.name}`)
    element.title = location.name
    element.addEventListener('click', () => {
      onSelectLocation(location)
      map.flyTo({
        center: [longitude, latitude],
        zoom: Math.max(map.getZoom(), 10.2),
        duration: 700,
      })
    })

    return [new Marker({ element, anchor: 'bottom' })
      .setLngLat([longitude, latitude])
      .addTo(map)]
  })
}

export function PoolMap({
  locations,
  selectedLocation,
  onSelectLocation,
  onViewDetails,
  onCloseSelection,
}: PoolMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<MapLibreMap | null>(null)
  const markers = useRef<Marker[]>([])
  const [mapError, setMapError] = useState(false)

  useEffect(() => {
    if (!mapContainer.current || map.current) return

    const instance = new MapLibreMap({
      container: mapContainer.current,
      style: mapStyle,
      center: [121, 23.75],
      zoom: 6.35,
      minZoom: 5.4,
      maxZoom: 16,
    })

    instance.addControl(new NavigationControl({ showCompass: false }), 'top-right')
    setMapError(false)
    instance.on('error', () => setMapError(true))
    map.current = instance

    return () => {
      markers.current.forEach((marker) => marker.remove())
      markers.current = []
      instance.remove()
      map.current = null
    }
  }, [])

  useEffect(() => {
    if (!map.current) return

    markers.current.forEach((marker) => marker.remove())
    markers.current = createMarkers(map.current, locations, onSelectLocation)
  }, [locations, onSelectLocation])

  useEffect(() => {
    if (!selectedLocation || !map.current || selectedLocation.latitude === null || selectedLocation.longitude === null) return
    map.current.flyTo({
      center: [selectedLocation.longitude, selectedLocation.latitude],
      zoom: Math.max(map.current.getZoom(), 10.2),
      duration: 700,
    })
  }, [selectedLocation])

  const resetMap = () => {
    map.current?.flyTo({ center: [121, 23.75], zoom: 6.35, duration: 700 })
  }

  return (
    <div className="map-shell">
      <div className="map-canvas" ref={mapContainer} aria-label="台灣泳池地圖" />
      <div className="map-tools">
        <button className="map-tool-button" type="button" onClick={resetMap}>
          <LocateFixed size={16} aria-hidden="true" />
          顯示全台
        </button>
      </div>
      <div className="map-legend" aria-label="泳帽狀態圖例">
        <span><i className="legend-dot legend-dot--not-required" />不強制</span>
        <span><i className="legend-dot legend-dot--conditional" />有條件</span>
        <span><i className="legend-dot legend-dot--unknown" />待確認</span>
      </div>
      {mapError && (
        <div className="map-error" role="status">
          部分地圖底圖無法載入，請確認網路後重新整理，或切換清單瀏覽地點。
        </div>
      )}
      {selectedLocation && (
        <div className="map-selected-card">
          <LocationDetail
            location={selectedLocation}
            compact
            onClose={onCloseSelection}
            onViewDetails={() => onViewDetails(selectedLocation)}
          />
        </div>
      )}
    </div>
  )
}
